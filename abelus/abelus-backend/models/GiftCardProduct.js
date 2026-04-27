import mongoose from "mongoose";

const giftCardProductSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        color: {
            type: String,
            default: "from-violet-500 to-indigo-600",
        },
        isCustom: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        expiryDays: {
            type: Number,
            default: 365,
            min: 1,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Index for ordering
giftCardProductSchema.index({ order: 1 });

const GiftCardProduct = mongoose.model("GiftCardProduct", giftCardProductSchema);

export default GiftCardProduct;
