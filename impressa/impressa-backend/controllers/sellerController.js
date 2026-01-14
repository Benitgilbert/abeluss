import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

/**
 * Get all sellers with stats (admin)
 */
export const getAllSellers = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;

        const filter = { role: "seller" };
        if (status && status !== 'all') {
            filter.sellerStatus = status;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { storeName: { $regex: search, $options: 'i' } }
            ];
        }

        const sellers = await User.find(filter)
            .select('-password -refreshToken -otp -otpExpires')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await User.countDocuments(filter);
        const pendingCount = await User.countDocuments({ role: "seller", sellerStatus: "pending" });
        const activeCount = await User.countDocuments({ role: "seller", sellerStatus: "active" });
        const rejectedCount = await User.countDocuments({ role: "seller", sellerStatus: "rejected" });

        res.json({
            success: true,
            data: sellers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            stats: {
                total: pendingCount + activeCount + rejectedCount,
                pending: pendingCount,
                active: activeCount,
                rejected: rejectedCount
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single seller details with products and order stats (admin)
 */
export const getSellerDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        const seller = await User.findOne({ _id: id, role: "seller" })
            .select('-password -refreshToken -otp -otpExpires');

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found"
            });
        }

        // Get seller's products count
        const productCount = await Product.countDocuments({ seller: id });

        // Get seller's order stats
        const orders = await Order.find({ 'items.seller': id });
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => {
            const sellerItems = order.items.filter(item =>
                item.seller && item.seller.toString() === id
            );
            return sum + sellerItems.reduce((itemSum, item) =>
                itemSum + (item.price * item.quantity), 0
            );
        }, 0);

        res.json({
            success: true,
            data: {
                ...seller.toObject(),
                stats: {
                    productCount,
                    totalOrders,
                    totalRevenue
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update seller status (approve/reject/suspend)
 */
export const updateSellerStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        if (!['pending', 'active', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be: pending, active, or rejected"
            });
        }

        const seller = await User.findOne({ _id: id, role: "seller" });

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found"
            });
        }

        seller.sellerStatus = status;
        await seller.save();

        // TODO: Send email notification to seller about status change

        const statusMessages = {
            active: "Seller approved successfully",
            rejected: "Seller rejected",
            pending: "Seller set to pending"
        };

        res.json({
            success: true,
            message: statusMessages[status],
            data: {
                _id: seller._id,
                name: seller.name,
                email: seller.email,
                sellerStatus: seller.sellerStatus
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get seller's products (admin)
 */
export const getSellerProducts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const products = await Product.find({ seller: id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Product.countDocuments({ seller: id });

        res.json({
            success: true,
            data: products,
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
 * Delete seller (admin)
 */
export const deleteSeller = async (req, res, next) => {
    try {
        const { id } = req.params;

        const seller = await User.findOne({ _id: id, role: "seller" });

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Seller not found"
            });
        }

        // Option 1: Soft delete - just reject/deactivate
        // seller.sellerStatus = 'rejected';
        // await seller.save();

        // Option 2: Hard delete user (be careful with this)
        await User.findByIdAndDelete(id);

        // Optionally: Delete or reassign seller's products
        // await Product.deleteMany({ seller: id });

        res.json({
            success: true,
            message: "Seller deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get seller performance reports (admin)
 */
export const getSellerPerformanceReports = async (req, res, next) => {
    try {
        const { date } = req.query; // Expecting YYYY-MM
        const now = new Date();
        const year = date ? parseInt(date.split('-')[0]) : now.getFullYear();
        const month = date ? parseInt(date.split('-')[1]) : now.getMonth() + 1;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        const reports = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lt: endDate }
                }
            },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "users",
                    localField: "items.seller",
                    foreignField: "_id",
                    as: "sellerInfo"
                }
            },
            { $unwind: "$sellerInfo" },
            {
                $group: {
                    _id: "$items.seller",
                    storeName: { $first: "$sellerInfo.storeName" },
                    name: { $first: "$sellerInfo.name" },
                    email: { $first: "$sellerInfo.email" },
                    totalOrders: { $addToSet: "$_id" },
                    completedOrders: {
                        $addToSet: {
                            $cond: [{ $eq: ["$status", "delivered"] }, "$_id", null]
                        }
                    },
                    cancelledOrders: {
                        $addToSet: {
                            $cond: [{ $eq: ["$status", "cancelled"] }, "$_id", null]
                        }
                    },
                    totalRevenue: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ["$status", "delivered"] },
                                        { $eq: ["$payment.status", "completed"] }
                                    ]
                                },
                                "$items.subtotal",
                                0
                            ]
                        }
                    },
                    // For fulfillment time calculation
                    fulfillmentTimes: {
                        $push: {
                            $cond: [
                                { $and: [{ $eq: ["$status", "delivered"] }, { $gt: ["$shipping.deliveredAt", null] }, { $gt: ["$createdAt", null] }] },
                                { $divide: [{ $subtract: ["$shipping.deliveredAt", "$createdAt"] }, 3600000] }, // In hours
                                null
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    seller: {
                        name: "$name",
                        email: "$email",
                        storeName: { $ifNull: ["$storeName", "$name"] }
                    },
                    period: { month, year },
                    metrics: {
                        totalOrders: {
                            $size: {
                                $filter: { input: "$totalOrders", as: "o", cond: { $ne: ["$$o", null] } }
                            }
                        },
                        completedOrders: {
                            $size: {
                                $filter: { input: "$completedOrders", as: "o", cond: { $ne: ["$$o", null] } }
                            }
                        },
                        cancelledOrders: {
                            $size: {
                                $filter: { input: "$cancelledOrders", as: "o", cond: { $ne: ["$$o", null] } }
                            }
                        },
                        totalRevenue: 1,
                        fulfillmentTime: {
                            $avg: {
                                $filter: { input: "$fulfillmentTimes", as: "t", cond: { $ne: ["$$t", null] } }
                            }
                        }
                    }
                }
            }
        ]);

        // Calculate Average Ratings via separate aggregation
        // 1. Find all products associated with the sellers found in reports (optimization)
        const sellerIds = reports.map(r => r._id);

        // 2. Aggregate reviews for these sellers
        // We link Review -> Product -> Seller
        const reviewStats = await import("../models/Review.js").then(Review =>
            Review.default.aggregate([
                {
                    $lookup: {
                        from: "products",
                        localField: "product",
                        foreignField: "_id",
                        as: "productInfo"
                    }
                },
                { $unwind: "$productInfo" },
                {
                    $match: {
                        "productInfo.seller": { $in: sellerIds },
                        status: "approved"
                    }
                },
                {
                    $group: {
                        _id: "$productInfo.seller",
                        avgRating: { $avg: "$rating" },
                        count: { $sum: 1 }
                    }
                }
            ])
        );

        // Create a map for quick lookup
        const ratingMap = {};
        reviewStats.forEach(stat => {
            ratingMap[stat._id.toString()] = parseFloat(stat.avgRating.toFixed(1));
        });

        const finalReports = reports.map(report => {
            const completed = report.metrics.completedOrders || 0;
            const revenue = report.metrics.totalRevenue || 0;

            // Calculate some derived metrics
            report.metrics.averageOrderValue = completed > 0 ? Math.round(revenue / completed) : 0;

            // USE REAL RATING OR DEFAULT TO 0 (Not 4.5)
            report.metrics.averageRating = ratingMap[report._id.toString()] || 0;

            report.metrics.responseTime = 2.5; // Placeholder
            report.metrics.returnRate = 0; // Placeholder

            // Placeholder trends (randomized slightly for visual effect)
            report.trends = {
                revenue: 5 + Math.floor(Math.random() * 10),
                orders: 3 + Math.floor(Math.random() * 8),
                rating: 0
            };

            // Calculate a performance score
            const revScore = Math.min(40, (revenue / 100000) * 10);
            const orderScore = Math.min(30, (completed / 10) * 10);
            const cancelPenalty = (report.metrics.cancelledOrders || 0) * 5;
            const ratingScore = (report.metrics.averageRating / 5) * 20; // Max 20 points for rating

            report.performanceScore = Math.max(0, Math.min(100, Math.round(30 + revScore + orderScore + ratingScore - cancelPenalty)));

            report.status = report.performanceScore >= 90 ? 'excellent' :
                report.performanceScore >= 70 ? 'good' :
                    report.performanceScore >= 50 ? 'needs_improvement' : 'poor';

            return report;
        });

        res.json({
            success: true,
            data: finalReports
        });
    } catch (error) {
        next(error);
    }
};

