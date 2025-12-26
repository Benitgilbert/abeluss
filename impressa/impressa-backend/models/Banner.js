import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Banner title is required"],
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"]
        },
        subtitle: {
            type: String,
            maxlength: [200, "Subtitle cannot exceed 200 characters"]
        },
        badge: {
            type: String,
            maxlength: [50, "Badge text cannot exceed 50 characters"],
            default: "Limited Time Offer"
        },
        buttonText: {
            type: String,
            default: "Shop Now",
            maxlength: [30, "Button text cannot exceed 30 characters"]
        },
        buttonLink: {
            type: String,
            default: "/shop"
        },
        // Background options
        backgroundImage: {
            type: String,
            default: null
        },
        gradientFrom: {
            type: String,
            default: "#8b5cf6" // violet-500
        },
        gradientTo: {
            type: String,
            default: "#d946ef" // fuchsia-500
        },
        // Scheduling
        startDate: {
            type: Date,
            default: null // null means always active
        },
        endDate: {
            type: Date,
            default: null // null means no end date
        },
        // Status & ordering
        isActive: {
            type: Boolean,
            default: true
        },
        order: {
            type: Number,
            default: 0
        },
        // Position on page
        position: {
            type: String,
            enum: ["hero", "middle", "bottom"],
            default: "hero"
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual to check if banner is currently active
bannerSchema.virtual("isCurrentlyActive").get(function () {
    if (!this.isActive) return false;

    const now = new Date();

    // Check start date
    if (this.startDate && now < this.startDate) return false;

    // Check end date
    if (this.endDate && now > this.endDate) return false;

    return true;
});

// Virtual for status
bannerSchema.virtual("status").get(function () {
    if (!this.isActive) return "inactive";

    const now = new Date();

    if (this.startDate && now < this.startDate) return "scheduled";
    if (this.endDate && now > this.endDate) return "expired";

    return "active";
});

// Static method to get active banners for display
bannerSchema.statics.getActiveBanners = async function (position = null) {
    const now = new Date();

    const query = {
        isActive: true,
        $or: [
            { startDate: null },
            { startDate: { $lte: now } }
        ],
        $and: [
            {
                $or: [
                    { endDate: null },
                    { endDate: { $gte: now } }
                ]
            }
        ]
    };

    if (position) {
        query.position = position;
    }

    return this.find(query).sort({ order: 1, createdAt: -1 });
};

// Indexes
bannerSchema.index({ isActive: 1, startDate: 1, endDate: 1, order: 1 });
bannerSchema.index({ position: 1, isActive: 1 });

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
