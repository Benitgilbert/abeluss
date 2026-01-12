import Product from "../models/Product.js";

/**
 * Get pending products for approval (admin)
 */
export const getPendingProducts = async (req, res, next) => {
    try {
        const { status = 'pending', page = 1, limit = 20, search } = req.query;

        const filter = {};
        if (status !== 'all') {
            if (status === 'pending') {
                filter.$or = [{ approvalStatus: 'pending' }, { approvalStatus: { $exists: false } }];
            } else {
                filter.approvalStatus = status;
            }
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(filter)
            .populate('seller', 'name email storeName')
            .populate('categories', 'name')
            .select('name slug price stock image seller categories approvalStatus approvalNote createdAt')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(filter);

        // Stats
        const pendingCount = await Product.countDocuments({
            $or: [{ approvalStatus: 'pending' }, { approvalStatus: { $exists: false } }]
        });
        const approvedCount = await Product.countDocuments({ approvalStatus: 'approved' });
        const rejectedCount = await Product.countDocuments({ approvalStatus: 'rejected' });

        res.json({
            success: true,
            data: products,
            stats: {
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount
            },
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
 * Get single product for review (admin)
 */
export const getProductForReview = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate('seller', 'name email storeName storePhone')
            .populate('categories', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Approve product (admin)
 */
export const approveProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        product.approvalStatus = 'approved';
        product.approvalNote = note || '';
        product.approvedBy = req.user.id;
        product.approvedAt = new Date();
        product.visibility = 'public'; // Make visible when approved

        await product.save();

        res.json({
            success: true,
            message: "Product approved successfully",
            data: {
                _id: product._id,
                name: product.name,
                approvalStatus: product.approvalStatus
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reject product (admin)
 */
export const rejectProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        product.approvalStatus = 'rejected';
        product.approvalNote = reason;
        product.approvedBy = req.user.id;
        product.approvedAt = new Date();
        product.visibility = 'hidden'; // Hide rejected products

        await product.save();

        res.json({
            success: true,
            message: "Product rejected",
            data: {
                _id: product._id,
                name: product.name,
                approvalStatus: product.approvalStatus,
                approvalNote: product.approvalNote
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Bulk approve products (admin)
 */
export const bulkApproveProducts = async (req, res, next) => {
    try {
        const { productIds } = req.body;

        if (!productIds || !productIds.length) {
            return res.status(400).json({
                success: false,
                message: "No products specified"
            });
        }

        const result = await Product.updateMany(
            { _id: { $in: productIds }, approvalStatus: 'pending' },
            {
                approvalStatus: 'approved',
                visibility: 'public',
                approvedBy: req.user.id,
                approvedAt: new Date()
            }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} products approved`,
            count: result.modifiedCount
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Bulk reject products (admin)
 */
export const bulkRejectProducts = async (req, res, next) => {
    try {
        const { productIds, reason } = req.body;

        if (!productIds || !productIds.length) {
            return res.status(400).json({
                success: false,
                message: "No products specified"
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }

        const result = await Product.updateMany(
            { _id: { $in: productIds }, approvalStatus: 'pending' },
            {
                approvalStatus: 'rejected',
                visibility: 'hidden',
                approvalNote: reason,
                approvedBy: req.user.id,
                approvedAt: new Date()
            }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} products rejected`,
            count: result.modifiedCount
        });
    } catch (error) {
        next(error);
    }
};
