import CommissionSettings from "../models/CommissionSettings.js";
import SellerEarning from "../models/SellerEarning.js";
import Payout from "../models/Payout.js";
import User from "../models/User.js";

/**
 * Get commission settings (admin)
 */
export const getCommissionSettings = async (req, res, next) => {
    try {
        const settings = await CommissionSettings.getSettings();
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update commission settings (admin)
 */
export const updateCommissionSettings = async (req, res, next) => {
    try {
        const { defaultRate, posRate, minimumPayoutAmount, payoutSchedule, payoutMethods, categoryRates } = req.body;

        const settings = await CommissionSettings.getSettings();

        if (defaultRate !== undefined) settings.defaultRate = defaultRate;
        if (posRate !== undefined) settings.posRate = posRate;
        if (minimumPayoutAmount !== undefined) settings.minimumPayoutAmount = minimumPayoutAmount;
        if (payoutSchedule !== undefined) settings.payoutSchedule = payoutSchedule;
        if (payoutMethods !== undefined) settings.payoutMethods = payoutMethods;
        if (categoryRates !== undefined) settings.categoryRates = categoryRates;
        settings.updatedBy = req.user._id;

        await settings.save();

        res.json({
            success: true,
            message: "Commission settings updated",
            data: settings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all seller earnings (admin) - with aggregation by seller
 */
export const getAllEarnings = async (req, res, next) => {
    try {
        const { sellerId, status, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (sellerId) filter.seller = sellerId;
        if (status) filter.status = status;

        const earnings = await SellerEarning.find(filter)
            .populate('seller', 'name email storeName')
            .populate('product', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await SellerEarning.countDocuments(filter);

        // Aggregate totals
        const aggregation = await SellerEarning.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalGross: { $sum: "$grossAmount" },
                    totalCommission: { $sum: "$commissionAmount" },
                    totalNet: { $sum: "$netAmount" }
                }
            }
        ]);

        const totals = aggregation[0] || { totalGross: 0, totalCommission: 0, totalNet: 0 };

        res.json({
            success: true,
            data: earnings,
            totals,
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
 * Get seller earnings summary (for dashboard)
 */
export const getSellerEarningsSummary = async (req, res, next) => {
    try {
        const sellerId = req.user._id;

        // Get pending earnings (not yet paid)
        const pendingEarnings = await SellerEarning.aggregate([
            { $match: { seller: sellerId, status: { $in: ["pending", "confirmed"] } } },
            { $group: { _id: null, total: { $sum: "$netAmount" }, count: { $sum: 1 } } }
        ]);

        // Get paid earnings
        const paidEarnings = await SellerEarning.aggregate([
            { $match: { seller: sellerId, status: "paid" } },
            { $group: { _id: null, total: { $sum: "$netAmount" }, count: { $sum: 1 } } }
        ]);

        // Get commission settings
        const settings = await CommissionSettings.getSettings();

        // Get pending payouts
        const pendingPayouts = await Payout.countDocuments({
            seller: sellerId,
            status: { $in: ["pending", "processing"] }
        });

        res.json({
            success: true,
            data: {
                availableBalance: pendingEarnings[0]?.total || 0,
                pendingOrders: pendingEarnings[0]?.count || 0,
                totalPaid: paidEarnings[0]?.total || 0,
                paidOrders: paidEarnings[0]?.count || 0,
                minimumPayout: settings.minimumPayoutAmount,
                pendingPayouts
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get dashboard stats for admin
 */
export const getCommissionDashboard = async (req, res, next) => {
    try {
        // Total platform earnings (commissions)
        const platformEarnings = await SellerEarning.aggregate([
            { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
        ]);

        // Pending payouts amount
        const pendingPayouts = await Payout.aggregate([
            { $match: { status: { $in: ["pending", "processing"] } } },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]);

        // Completed payouts
        const completedPayouts = await Payout.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]);

        // Active sellers with earnings
        const activeSellers = await SellerEarning.distinct("seller");

        res.json({
            success: true,
            data: {
                platformEarnings: platformEarnings[0]?.total || 0,
                pendingPayouts: {
                    amount: pendingPayouts[0]?.total || 0,
                    count: pendingPayouts[0]?.count || 0
                },
                completedPayouts: {
                    amount: completedPayouts[0]?.total || 0,
                    count: completedPayouts[0]?.count || 0
                },
                activeSellers: activeSellers.length
            }
        });
    } catch (error) {
        next(error);
    }
};
