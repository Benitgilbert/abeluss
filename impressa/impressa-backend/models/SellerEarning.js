import mongoose from "mongoose";

/**
 * Seller Earning - Tracks earnings for each order item sold by a seller
 */
const sellerEarningSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        orderPublicId: {
            type: String,
            required: true
        },
        // Order item details
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        productName: String,
        quantity: Number,
        itemPrice: {
            type: Number,
            required: true
        },
        // Gross amount (price * quantity)
        grossAmount: {
            type: Number,
            required: true
        },
        // Commission details
        commissionRate: {
            type: Number,
            required: true,
            default: 10
        },
        commissionAmount: {
            type: Number,
            required: true
        },
        // Net amount after commission (what seller receives)
        netAmount: {
            type: Number,
            required: true
        },
        // Status
        status: {
            type: String,
            enum: ["pending", "confirmed", "paid", "cancelled"],
            default: "pending"
        },
        // Link to payout (when paid)
        payout: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payout"
        },
        paidAt: Date
    },
    {
        timestamps: true
    }
);

// Indexes for efficient queries
sellerEarningSchema.index({ seller: 1, status: 1 });
sellerEarningSchema.index({ order: 1 });
sellerEarningSchema.index({ createdAt: -1 });

const SellerEarning = mongoose.model("SellerEarning", sellerEarningSchema);

export default SellerEarning;
