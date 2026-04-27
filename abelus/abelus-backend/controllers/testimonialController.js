import Testimonial from "../models/Testimonial.js";

/**
 * Get all testimonials (admin)
 */
export const getAllTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            count: testimonials.length,
            data: testimonials
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get active testimonials for public display
 */
export const getActiveTestimonials = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const testimonials = await Testimonial.getActiveTestimonials(limit);

        res.json({
            success: true,
            count: testimonials.length,
            data: testimonials
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single testimonial
 */
export const getTestimonialById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const testimonial = await Testimonial.findById(id);

        if (!testimonial) {
            const error = new Error("Testimonial not found");
            error.statusCode = 404;
            return next(error);
        }

        res.json({
            success: true,
            data: testimonial
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create testimonial
 */
export const createTestimonial = async (req, res, next) => {
    try {
        const { name, role, content, avatar, rating, isActive, order, featured } = req.body;

        const testimonial = await Testimonial.create({
            name,
            role,
            content,
            avatar,
            rating: rating || 5,
            isActive: isActive !== false,
            order: order || 0,
            featured: featured || false
        });

        res.status(201).json({
            success: true,
            message: "Testimonial created successfully",
            data: testimonial
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update testimonial
 */
export const updateTestimonial = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const testimonial = await Testimonial.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!testimonial) {
            const error = new Error("Testimonial not found");
            error.statusCode = 404;
            return next(error);
        }

        res.json({
            success: true,
            message: "Testimonial updated successfully",
            data: testimonial
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete testimonial
 */
export const deleteTestimonial = async (req, res, next) => {
    try {
        const { id } = req.params;
        const testimonial = await Testimonial.findByIdAndDelete(id);

        if (!testimonial) {
            const error = new Error("Testimonial not found");
            error.statusCode = 404;
            return next(error);
        }

        res.json({
            success: true,
            message: "Testimonial deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle testimonial active status
 */
export const toggleTestimonialStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const testimonial = await Testimonial.findById(id);

        if (!testimonial) {
            const error = new Error("Testimonial not found");
            error.statusCode = 404;
            return next(error);
        }

        testimonial.isActive = !testimonial.isActive;
        await testimonial.save();

        res.json({
            success: true,
            message: `Testimonial ${testimonial.isActive ? "activated" : "deactivated"} successfully`,
            data: testimonial
        });
    } catch (error) {
        next(error);
    }
};
