import Review from "../models/Review.js";

/**
 * Get all reviews for admin (with filters)
 */
export const getAllReviews = async (req, res, next) => {
    try {
        const { status, rating, reported, page = 1, limit = 20, search } = req.query;

        const filter = {};
        if (status && status !== 'all') filter.status = status;
        if (rating) filter.rating = parseInt(rating);
        if (reported === 'true') filter.reported = true;

        const reviews = await Review.find(filter)
            .populate('user', 'name email')
            .populate('product', 'name image slug')
            .populate('moderatedBy', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Review.countDocuments(filter);

        // Stats
        const stats = {
            total: await Review.countDocuments(),
            pending: await Review.countDocuments({ status: 'pending' }),
            approved: await Review.countDocuments({ status: 'approved' }),
            rejected: await Review.countDocuments({ status: 'rejected' }),
            reported: await Review.countDocuments({ reported: true }),
        };

        // Average rating
        const avgRating = await Review.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]);

        stats.averageRating = avgRating[0]?.avg?.toFixed(1) || 0;

        res.json({
            success: true,
            data: reviews,
            stats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single review details
 */
export const getReviewDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id)
            .populate('user', 'name email')
            .populate('product', 'name image slug seller')
            .populate('moderatedBy', 'name')
            .populate('reply.author', 'name');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.json({
            success: true,
            data: review
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Approve review
 */
export const approveReview = async (req, res, next) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndUpdate(
            id,
            {
                status: 'approved',
                moderatedBy: req.user._id,
                moderatedAt: new Date(),
                reported: false,
                reportReason: ''
            },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.json({
            success: true,
            message: "Review approved",
            data: review
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reject review
 */
export const rejectReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const review = await Review.findByIdAndUpdate(
            id,
            {
                status: 'rejected',
                moderatedBy: req.user._id,
                moderatedAt: new Date(),
                moderationNote: reason || ''
            },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.json({
            success: true,
            message: "Review rejected",
            data: review
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reply to review
 */
export const replyToReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Reply text is required"
            });
        }

        const review = await Review.findByIdAndUpdate(
            id,
            {
                reply: {
                    text,
                    author: req.user._id,
                    createdAt: new Date()
                }
            },
            { new: true }
        ).populate('reply.author', 'name');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.json({
            success: true,
            message: "Reply added",
            data: review
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete review
 */
export const deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndDelete(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.json({
            success: true,
            message: "Review deleted"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Clear report flag
 */
export const clearReport = async (req, res, next) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndUpdate(
            id,
            { reported: false, reportReason: '' },
            { new: true }
        );

        res.json({
            success: true,
            message: "Report cleared",
            data: review
        });
    } catch (error) {
        next(error);
    }
};
