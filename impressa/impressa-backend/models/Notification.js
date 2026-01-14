import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: [
                "order_placed", "order_status", "order_shipped", "order_delivered",
                "payment_received", "payment_failed", "new_order",
                "product_approved", "product_rejected", "low_stock", "product_added",
                "review_received", "review_reply", "new_review",
                "ticket_reply", "ticket_resolved",
                "payout_processed", "payout_rejected", "payout_request",
                "seller_approved", "seller_rejected",
                "violation_report", "new_subscriber", "user_register", "flash_sale_update",
                "system", "promotion"
            ],
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        link: String,  // URL to navigate to
        // Related entities
        relatedOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        },
        relatedProduct: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        relatedTicket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket"
        },
        // Status
        isRead: {
            type: Boolean,
            default: false,
            index: true
        },
        readAt: Date,
        // Metadata
        priority: {
            type: String,
            enum: ["low", "normal", "high"],
            default: "normal"
        },
        icon: String,  // Optional icon class
        color: String  // Optional color for UI
    },
    {
        timestamps: true
    }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Auto-delete old read notifications after 30 days
notificationSchema.index({ readAt: 1 }, {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { isRead: true }
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
