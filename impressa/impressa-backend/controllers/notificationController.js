import Notification from "../models/Notification.js";

/**
 * Get user's notifications
 */
export const getMyNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, unreadOnly } = req.query;

        const filter = { recipient: req.user._id };
        if (unreadOnly === 'true') filter.isRead = false;

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false
        });

        res.json({
            success: true,
            data: notifications,
            unreadCount,
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
 * Get unread count
 */
export const getUnreadCount = async (req, res, next) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false
        });

        res.json({
            success: true,
            count
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: req.user._id },
            { isRead: true, readAt: new Date() },
            { new: true }
        );

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Mark all as read
 */
export const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res, next) => {
    try {
        const { id } = req.params;

        await Notification.findOneAndDelete({
            _id: id,
            recipient: req.user._id
        });

        res.json({
            success: true,
            message: "Notification deleted"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (req, res, next) => {
    try {
        await Notification.deleteMany({ recipient: req.user._id });

        res.json({
            success: true,
            message: "All notifications cleared"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create notification (internal use / admin)
 */
export const createNotification = async (recipientId, data) => {
    try {
        const notification = await Notification.create({
            recipient: recipientId,
            type: data.type,
            title: data.title,
            message: data.message,
            link: data.link,
            relatedOrder: data.orderId,
            relatedProduct: data.productId,
            relatedTicket: data.ticketId,
            priority: data.priority || 'normal',
            icon: data.icon,
            color: data.color
        });
        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
        return null;
    }
};

// Notification helper functions for different events
export const notifyOrderPlaced = (userId, orderId, orderTotal) => {
    return createNotification(userId, {
        type: 'order_placed',
        title: 'Order Confirmed',
        message: `Your order has been placed successfully. Total: RWF ${orderTotal.toLocaleString()}`,
        link: `/orders/${orderId}`,
        orderId
    });
};

export const notifyOrderStatus = (userId, orderId, status) => {
    const statusMessages = {
        processing: 'Your order is being processed',
        shipped: 'Your order has been shipped',
        delivered: 'Your order has been delivered'
    };
    return createNotification(userId, {
        type: 'order_status',
        title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: statusMessages[status] || `Order status updated to ${status}`,
        link: `/orders/${orderId}`,
        orderId
    });
};

export const notifyProductApproved = (sellerId, productId, productName) => {
    return createNotification(sellerId, {
        type: 'product_approved',
        title: 'Product Approved',
        message: `Your product "${productName}" has been approved and is now live.`,
        link: `/seller/products`,
        productId
    });
};

export const notifyPayoutProcessed = (sellerId, amount, status) => {
    return createNotification(sellerId, {
        type: status === 'completed' ? 'payout_processed' : 'payout_rejected',
        title: status === 'completed' ? 'Payout Completed' : 'Payout Rejected',
        message: status === 'completed'
            ? `Your payout of RWF ${amount.toLocaleString()} has been processed.`
            : `Your payout request of RWF ${amount.toLocaleString()} was rejected.`,
        link: `/seller/payouts`,
        priority: 'high'
    });
};
