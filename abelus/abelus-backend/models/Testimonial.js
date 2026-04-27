import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Customer name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"]
        },
        role: {
            type: String,
            trim: true,
            maxlength: [100, "Role cannot exceed 100 characters"],
            default: "Customer"
        },
        content: {
            type: String,
            required: [true, "Testimonial content is required"],
            maxlength: [500, "Content cannot exceed 500 characters"]
        },
        avatar: {
            type: String,
            default: null
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: 5
        },
        isActive: {
            type: Boolean,
            default: true
        },
        order: {
            type: Number,
            default: 0
        },
        featured: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Index for ordering
testimonialSchema.index({ isActive: 1, order: 1, featured: -1 });

// Static method to get active testimonials
testimonialSchema.statics.getActiveTestimonials = async function (limit = 10) {
    return this.find({ isActive: true })
        .sort({ featured: -1, order: 1, createdAt: -1 })
        .limit(limit);
};

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;
