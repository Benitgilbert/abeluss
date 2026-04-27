import mongoose from "mongoose";

const brandPartnerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Brand name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"]
        },
        logo: {
            type: String,
            default: null // URL to brand logo image
        },
        websiteUrl: {
            type: String,
            default: null // Optional link when clicking the brand
        },
        isActive: {
            type: Boolean,
            default: true
        },
        order: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Static method to get active brand partners for display
brandPartnerSchema.statics.getActivePartners = async function () {
    return this.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
};

// Indexes
brandPartnerSchema.index({ isActive: 1, order: 1 });

const BrandPartner = mongoose.model("BrandPartner", brandPartnerSchema);

export default BrandPartner;
