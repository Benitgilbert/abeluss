import cron from "node-cron";
import SellerReport from "../models/SellerReport.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Payout from "../models/Payout.js";
import { sendEmail } from "../utils/emailService.js";

/**
 * Report Generation Cron - Monthly seller performance reports
 */

/**
 * Generate report for a single seller
 */
export const generateSellerReport = async (sellerId, periodStart, periodEnd) => {
    try {
        const seller = await User.findById(sellerId);
        if (!seller || seller.role !== "seller") {
            return { success: false, message: "Invalid seller" };
        }

        // Create report record
        const report = new SellerReport({
            seller: sellerId,
            periodType: "monthly",
            periodStart,
            periodEnd,
            status: "generating"
        });

        // Get orders in period
        const orders = await Order.find({
            "items.seller": sellerId,
            createdAt: { $gte: periodStart, $lte: periodEnd }
        });

        // Calculate sales metrics
        let totalOrders = 0;
        let completedOrders = 0;
        let cancelledOrders = 0;
        let grossRevenue = 0;

        orders.forEach(order => {
            const hasSellerItems = order.items.some(item =>
                item.seller && item.seller.toString() === sellerId.toString()
            );

            if (hasSellerItems) {
                totalOrders++;

                if (order.status === "delivered") {
                    completedOrders++;
                    order.items.forEach(item => {
                        if (item.seller && item.seller.toString() === sellerId.toString()) {
                            grossRevenue += item.price * item.quantity;
                        }
                    });
                } else if (order.status === "cancelled") {
                    cancelledOrders++;
                }
            }
        });

        // Get commission from payouts
        const payouts = await Payout.find({
            seller: sellerId,
            status: "completed",
            processedAt: { $gte: periodStart, $lte: periodEnd }
        });

        const commissionPaid = payouts.reduce((sum, p) => sum + (p.platformFee || 0), 0);
        const netRevenue = grossRevenue - commissionPaid;
        const averageOrderValue = completedOrders > 0 ? grossRevenue / completedOrders : 0;
        const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

        report.sales = {
            totalOrders,
            completedOrders,
            cancelledOrders,
            returnedOrders: 0,
            grossRevenue,
            netRevenue,
            commissionPaid,
            averageOrderValue
        };

        // Get product metrics
        const totalProducts = await Product.countDocuments({ seller: sellerId });
        const activeProducts = await Product.countDocuments({
            seller: sellerId,
            visibility: "public",
            approvalStatus: "approved"
        });
        const newProducts = await Product.countDocuments({
            seller: sellerId,
            createdAt: { $gte: periodStart, $lte: periodEnd }
        });
        const lowStockProducts = await Product.countDocuments({
            seller: sellerId,
            stock: { $gt: 0, $lte: 10 }
        });
        const outOfStockProducts = await Product.countDocuments({
            seller: sellerId,
            stock: 0
        });

        report.products = {
            totalProducts,
            activeProducts,
            newProducts,
            lowStockProducts,
            outOfStockProducts
        };

        // Calculate performance metrics
        report.performance = {
            averageRating: 0, // TODO: Calculate from reviews
            reviewCount: 0,
            responseTime: 0,
            fulfillmentTime: 0,
            cancellationRate,
            returnRate: 0
        };

        // Get top products
        const topProductsAgg = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: periodStart, $lte: periodEnd },
                    status: "delivered"
                }
            },
            { $unwind: "$items" },
            { $match: { "items.seller": sellerId } },
            {
                $group: {
                    _id: "$items.product",
                    unitsSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } }
        ]);

        report.topProducts = topProductsAgg.map(p => ({
            product: p._id,
            productName: p.productInfo?.name || "Unknown Product",
            unitsSold: p.unitsSold,
            revenue: p.revenue
        }));

        // Compare to previous period
        const prevPeriodStart = new Date(periodStart);
        prevPeriodStart.setMonth(prevPeriodStart.getMonth() - 1);
        const prevPeriodEnd = new Date(periodEnd);
        prevPeriodEnd.setMonth(prevPeriodEnd.getMonth() - 1);

        const prevReport = await SellerReport.findOne({
            seller: sellerId,
            periodStart: { $gte: prevPeriodStart },
            periodEnd: { $lte: prevPeriodEnd }
        });

        if (prevReport) {
            const prevRevenue = prevReport.sales?.grossRevenue || 1;
            const prevOrders = prevReport.sales?.totalOrders || 1;

            report.comparison = {
                revenueChange: ((grossRevenue - prevRevenue) / prevRevenue) * 100,
                ordersChange: ((totalOrders - prevOrders) / prevOrders) * 100,
                ratingChange: 0
            };
        }

        report.status = "ready";
        await report.save();

        return {
            success: true,
            reportId: report._id,
            summary: {
                totalOrders,
                completedOrders,
                grossRevenue,
                netRevenue
            }
        };

    } catch (error) {
        console.error(`[Report] Error generating for seller ${sellerId}:`, error);
        return { success: false, error: error.message };
    }
};

/**
 * Generate reports for all active sellers
 */
export const generateAllSellerReports = async () => {
    console.log("[Report Cron] Starting monthly report generation...");

    const now = new Date();
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59); // Last day of prev month
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0); // First day of prev month

    const sellers = await User.find({ role: "seller", sellerStatus: "active" });
    const results = [];

    for (const seller of sellers) {
        // Check if report already exists
        const existing = await SellerReport.findOne({
            seller: seller._id,
            periodStart: { $gte: periodStart },
            periodEnd: { $lte: periodEnd }
        });

        if (existing) {
            console.log(`[Report Cron] Report already exists for ${seller.storeName}`);
            continue;
        }

        const result = await generateSellerReport(seller._id, periodStart, periodEnd);
        results.push({
            sellerId: seller._id,
            storeName: seller.storeName,
            ...result
        });
    }

    console.log(`[Report Cron] Generated ${results.filter(r => r.success).length} reports`);
    return results;
};

/**
 * Send report email to seller
 */
export const sendReportEmail = async (reportId) => {
    const report = await SellerReport.findById(reportId).populate("seller", "name email storeName");

    if (!report || report.status !== "ready") {
        return { success: false, message: "Report not ready" };
    }

    const seller = report.seller;
    const monthName = report.periodStart.toLocaleString('default', { month: 'long', year: 'numeric' });

    const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">📊 Your ${monthName} Performance Report</h2>
        <p>Hi ${seller.name},</p>
        <p>Here's your monthly performance summary for <strong>${seller.storeName}</strong>:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Sales Overview</h3>
            <table style="width: 100%;">
                <tr><td>Total Orders</td><td style="text-align: right; font-weight: bold;">${report.sales.totalOrders}</td></tr>
                <tr><td>Completed Orders</td><td style="text-align: right; font-weight: bold;">${report.sales.completedOrders}</td></tr>
                <tr><td>Gross Revenue</td><td style="text-align: right; font-weight: bold;">${report.sales.grossRevenue.toLocaleString()} RWF</td></tr>
                <tr><td>Commission</td><td style="text-align: right; color: #ef4444;">-${report.sales.commissionPaid.toLocaleString()} RWF</td></tr>
                <tr style="border-top: 1px solid #d1d5db;"><td><strong>Net Revenue</strong></td><td style="text-align: right; font-weight: bold; color: #10b981;">${report.sales.netRevenue.toLocaleString()} RWF</td></tr>
            </table>
        </div>

        ${report.comparison.revenueChange !== 0 ? `
        <div style="background: ${report.comparison.revenueChange > 0 ? '#d1fae5' : '#fee2e2'}; padding: 12px 16px; border-radius: 8px; margin: 16px 0;">
            <strong>${report.comparison.revenueChange > 0 ? '📈' : '📉'} Revenue Change:</strong> 
            ${report.comparison.revenueChange > 0 ? '+' : ''}${report.comparison.revenueChange.toFixed(1)}% vs last month
        </div>
        ` : ''}

        <a href="${process.env.FRONTEND_URL}/seller/reports/${report._id}" 
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            View Full Report
        </a>
    </div>`;

    const result = await sendEmail({
        to: seller.email,
        subject: `📊 Your ${monthName} Performance Report - Abelus`,
        html
    });

    if (result.success) {
        report.status = "sent";
        report.sentAt = new Date();
        await report.save();
    }

    return result;
};

/**
 * Initialize monthly report cron job
 * Runs on the 1st of each month at 7 AM
 */
export const initReportCron = () => {
    cron.schedule("0 7 1 * *", async () => {
        console.log(`[Report Cron] Running monthly reports at ${new Date().toISOString()}`);
        const results = await generateAllSellerReports();

        // Send emails for generated reports
        for (const result of results) {
            if (result.success && result.reportId) {
                await sendReportEmail(result.reportId);
            }
        }
    });

    console.log("[Report Cron] Initialized - runs 1st of each month at 7 AM");
};

export default {
    generateSellerReport,
    generateAllSellerReports,
    sendReportEmail,
    initReportCron
};
