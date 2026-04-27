import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
        },
        isActive: {
            type: Boolean,
            default: true
        },
        source: {
            type: String,
            enum: ['homepage', 'checkout', 'popup', 'footer', 'other'],
            default: 'homepage'
        },
        subscribedAt: {
            type: Date,
            default: Date.now
        },
        unsubscribedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Index for faster queries
subscriberSchema.index({ email: 1 });
subscriberSchema.index({ isActive: 1, subscribedAt: -1 });

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

export default Subscriber;
