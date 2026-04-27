import mongoose from "mongoose";

/**
 * SellerViolation - Tracks seller violations and warnings
 */
const sellerViolationSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: [
                "high_cancellation_rate",
                "slow_fulfillment",
                "customer_complaints",
                "fake_product",
                "policy_violation",
                "payment_issue",
                "low_rating",
                "other"
            ],
            required: true
        },
        severity: {
            type: String,
            enum: ["warning", "review", "suspension"],
            default: "warning"
        },
        status: {
            type: String,
            enum: ["active", "resolved", "escalated", "dismissed"],
            default: "active"
        },
        // Details about the violation
        description: {
            type: String,
            required: true
        },
        // Metrics that triggered this violation
        metrics: {
            cancellationRate: Number,
            averageFulfillmentTime: Number, // hours
            complaintCount: Number,
            averageRating: Number,
            affectedOrders: Number
        },
        // Related entities
        relatedOrders: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        }],
        relatedProducts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }],
        // Detection
        detectedBy: {
            type: String,
            enum: ["system", "admin", "customer_report"],
            default: "system"
        },
        // Resolution
        resolvedAt: Date,
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        resolutionNote: String,
        // Actions taken
        actionsTaken: [{
            action: {
                type: String,
                enum: ["warning_sent", "products_hidden", "account_suspended", "account_terminated", "reviewed", "dismissed"]
            },
            takenAt: { type: Date, default: Date.now },
            takenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            note: String
        }],
        // Penalty points (for escalation)
        penaltyPoints: {
            type: Number,
            default: 0
        },
        // Expiry (warnings can expire)
        expiresAt: Date,
        isExpired: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Indexes
sellerViolationSchema.index({ seller: 1, status: 1 });
sellerViolationSchema.index({ type: 1, severity: 1 });
sellerViolationSchema.index({ createdAt: -1 });
sellerViolationSchema.index({ expiresAt: 1, isExpired: 1 });

// Static: Get seller's active violations count
sellerViolationSchema.statics.getActiveViolationCount = async function (sellerId) {
    return this.countDocuments({
        seller: sellerId,
        status: "active",
        isExpired: false
    });
};

// Static: Get seller's total penalty points
sellerViolationSchema.statics.getTotalPenaltyPoints = async function (sellerId) {
    const result = await this.aggregate([
        {
            $match: {
                seller: new mongoose.Types.ObjectId(sellerId),
                status: "active",
                isExpired: false
            }
        },
        {
            $group: {
                _id: null,
                totalPoints: { $sum: "$penaltyPoints" }
            }
        }
    ]);
    return result[0]?.totalPoints || 0;
};

// Instance: Resolve violation
sellerViolationSchema.methods.resolve = async function (resolvedBy, note) {
    this.status = "resolved";
    this.resolvedAt = new Date();
    this.resolvedBy = resolvedBy;
    this.resolutionNote = note;
    this.actionsTaken.push({
        action: "reviewed",
        takenBy: resolvedBy,
        note: note
    });
    await this.save();
};

// Instance: Escalate violation
sellerViolationSchema.methods.escalate = async function (escalatedBy, note) {
    const severityMap = { warning: "review", review: "suspension" };
    this.severity = severityMap[this.severity] || "suspension";
    this.status = "escalated";
    this.actionsTaken.push({
        action: this.severity === "suspension" ? "account_suspended" : "reviewed",
        takenBy: escalatedBy,
        note: note
    });
    await this.save();
};

const SellerViolation = mongoose.model("SellerViolation", sellerViolationSchema);

export default SellerViolation;
