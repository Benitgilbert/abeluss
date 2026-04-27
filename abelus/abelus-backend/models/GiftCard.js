import mongoose from "mongoose";
import crypto from "crypto";

const giftCardSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            unique: true,
            required: true,
            index: true,
            uppercase: true,
        },
        initialAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        currentBalance: {
            type: Number,
            required: true,
            min: 0,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        recipientEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        message: {
            type: String,
            maxlength: 500,
        },
        status: {
            type: String,
            enum: ["Active", "Redeemed", "Expired", "Pending"],
            default: "Pending",
        },
        expiryDate: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
    },
    {
        timestamps: true,
    }
);

// Generate unique code before saving
giftCardSchema.statics.generateCode = function () {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid ambiguous chars
    let code = "IMPR-";
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i === 3) code += "-";
    }
    return code;
};

const GiftCard = mongoose.model("GiftCard", giftCardSchema);

export default GiftCard;
