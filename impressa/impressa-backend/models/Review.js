import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
        },
        // Moderation fields
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "approved", // Auto-approve by default
            index: true,
        },
        moderatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        moderatedAt: Date,
        moderationNote: String,
        // Admin/Seller reply
        reply: {
            text: String,
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            createdAt: Date,
        },
        // Helpful votes
        helpfulVotes: {
            type: Number,
            default: 0,
        },
        reported: {
            type: Boolean,
            default: false,
        },
        reportReason: String,
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate reviews from same user for same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
