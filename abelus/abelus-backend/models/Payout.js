import mongoose from "mongoose";

/**
 * Payout - Tracks payout requests from sellers
 */
const payoutSchema = new mongoose.Schema(
    {
        // Auto-generated payout ID
        payoutId: {
            type: String,
            unique: true,
            required: true
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        // Amount requested (net after commission)
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        // Gross amount before commission
        grossAmount: {
            type: Number,
            default: 0
        },
        // Platform fee/commission deducted
        platformFee: {
            type: Number,
            default: 0
        },
        commissionRate: {
            type: Number,
            default: 10
        },
        // Payment method
        paymentMethod: {
            type: String,
            enum: ["bank_transfer", "mobile_money", "paypal", "other"],
            default: "mobile_money"
        },
        // Payment details
        paymentDetails: {
            bankName: String,
            accountNumber: String,
            accountName: String,
            mobileNumber: String,
            mobileOperator: String, // MTN, Airtel
            paypalEmail: String
        },
        // Status
        status: {
            type: String,
            enum: ["pending", "processing", "completed", "rejected", "cancelled"],
            default: "pending",
            index: true
        },
        // Period this payout covers (for automated payouts)
        periodStart: Date,
        periodEnd: Date,
        // Admin notes
        adminNote: String,
        rejectionReason: String,
        // Transaction details (when completed)
        transactionId: String,
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        processedAt: Date,
        // Orders included in this payout
        orders: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        }],
        orderCount: {
            type: Number,
            default: 0
        },
        // Earnings included in this payout (legacy)
        earnings: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "SellerEarning"
        }],
        earningsCount: {
            type: Number,
            default: 0
        },
        // Automatic vs Manual payout
        isAutomatic: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Auto-generate payout ID before save
payoutSchema.pre("save", async function (next) {
    if (!this.payoutId) {
        const count = await mongoose.model("Payout").countDocuments();
        this.payoutId = `PAY-${String(count + 1).padStart(6, "0")}`;
    }
    next();
});

// Indexes
payoutSchema.index({ seller: 1, status: 1 });
payoutSchema.index({ createdAt: -1 });
payoutSchema.index({ isAutomatic: 1, status: 1 });

// Static: Get seller's pending balance from delivered orders not yet paid
payoutSchema.statics.getSellerPendingBalance = async function (sellerId) {
    const Order = mongoose.model("Order");

    // Get all order IDs already included in payouts
    const paidOrderIds = await this.distinct("orders", {
        seller: sellerId,
        status: { $in: ["completed", "processing", "pending"] }
    });

    // Find delivered orders not in any payout
    const unpaidOrders = await Order.find({
        status: "delivered",
        _id: { $nin: paidOrderIds }
    });

    // Calculate seller's portion from each order
    let totalEarnings = 0;
    const sellerOrderIds = [];

    unpaidOrders.forEach(order => {
        let hasSellerItems = false;
        order.items.forEach(item => {
            if (item.seller && item.seller.toString() === sellerId.toString()) {
                totalEarnings += item.price * item.quantity;
                hasSellerItems = true;
            }
        });
        if (hasSellerItems) {
            sellerOrderIds.push(order._id);
        }
    });

    return {
        balance: totalEarnings,
        orderCount: sellerOrderIds.length,
        orderIds: sellerOrderIds
    };
};

const Payout = mongoose.model("Payout", payoutSchema);

export default Payout;

