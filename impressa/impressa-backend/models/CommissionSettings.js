import mongoose from "mongoose";

/**
 * Commission Settings - Platform-wide or per-seller commission rates
 */
const commissionSettingsSchema = new mongoose.Schema(
    {
        // Global default commission rate (percentage)
        defaultRate: {
            type: Number,
            default: 10, // 10% default for Online
            min: 0,
            max: 100
        },
        // POS commission rate (percentage)
        posRate: {
            type: Number,
            default: 5, // Default lower for POS? or same 10. Let's say 10 default.
            min: 0,
            max: 100
        },
        // Per-category commission rates (optional)
        categoryRates: [{
            category: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category"
            },
            rate: {
                type: Number,
                min: 0,
                max: 100
            }
        }],
        // Minimum payout amount
        minimumPayoutAmount: {
            type: Number,
            default: 10000 // 10,000 RWF minimum
        },
        // Payout schedule
        payoutSchedule: {
            type: String,
            enum: ["weekly", "biweekly", "monthly", "manual"],
            default: "manual"
        },
        // Payment methods that can be used for payouts
        payoutMethods: {
            type: [String],
            default: ["bank_transfer", "mobile_money"]
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

// Ensure only one settings document exists
commissionSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

const CommissionSettings = mongoose.model("CommissionSettings", commissionSettingsSchema);

export default CommissionSettings;
