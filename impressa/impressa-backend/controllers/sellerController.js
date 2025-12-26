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
