import mongoose from "mongoose";

const ticketMessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    senderRole: {
        type: String,
        enum: ["customer", "seller", "admin"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    attachments: [{
        filename: String,
        url: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ticketSchema = new mongoose.Schema(
    {
        ticketId: {
            type: String,
            unique: true,
            required: true
        },
        subject: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ["order", "product", "payment", "shipping", "account", "seller", "other"],
            default: "other"
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        },
        status: {
            type: String,
            enum: ["open", "in_progress", "waiting", "resolved", "closed"],
            default: "open",
            index: true
        },
        // Who created the ticket
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        createdByRole: {
            type: String,
            enum: ["customer", "seller"],
            required: true
        },
        // Related entities (optional)
        relatedOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        },
        relatedProduct: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
        // Assigned admin/staff
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        // Messages/conversation thread
        messages: [ticketMessageSchema],
        // Resolution
        resolvedAt: Date,
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        resolutionNote: String,
        // Customer satisfaction rating
        satisfactionRating: {
            type: Number,
            min: 1,
            max: 5
        },
        satisfactionFeedback: String
    },
    {
        timestamps: true
    }
);

// Auto-generate ticket ID
ticketSchema.pre("save", async function (next) {
    if (!this.ticketId) {
        const count = await mongoose.model("Ticket").countDocuments();
        this.ticketId = `TKT-${String(count + 1).padStart(6, "0")}`;
    }
    next();
});

// Indexes
ticketSchema.index({ createdBy: 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ createdAt: -1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
