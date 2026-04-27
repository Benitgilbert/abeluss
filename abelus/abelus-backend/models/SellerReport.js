import mongoose from "mongoose";

/**
 * SellerReport - Monthly performance reports for sellers
 */
const sellerReportSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        // Report period
        periodType: {
            type: String,
            enum: ["weekly", "monthly", "quarterly", "yearly"],
            default: "monthly"
        },
        periodStart: {
            type: Date,
            required: true
        },
        periodEnd: {
            type: Date,
            required: true
        },
        // Sales Metrics
        sales: {
            totalOrders: { type: Number, default: 0 },
            completedOrders: { type: Number, default: 0 },
            cancelledOrders: { type: Number, default: 0 },
            returnedOrders: { type: Number, default: 0 },
            grossRevenue: { type: Number, default: 0 },
            netRevenue: { type: Number, default: 0 },
            commissionPaid: { type: Number, default: 0 },
            averageOrderValue: { type: Number, default: 0 }
        },
        // Product Metrics
        products: {
            totalProducts: { type: Number, default: 0 },
            activeProducts: { type: Number, default: 0 },
            newProducts: { type: Number, default: 0 },
            lowStockProducts: { type: Number, default: 0 },
            outOfStockProducts: { type: Number, default: 0 }
        },
        // Performance Metrics
        performance: {
            averageRating: { type: Number, default: 0 },
            reviewCount: { type: Number, default: 0 },
            responseTime: { type: Number, default: 0 }, // hours
            fulfillmentTime: { type: Number, default: 0 }, // hours
            cancellationRate: { type: Number, default: 0 }, // %
            returnRate: { type: Number, default: 0 } // %
        },
        // Top Products
        topProducts: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            productName: String,
            unitsSold: Number,
            revenue: Number
        }],
        // Comparison to previous period
        comparison: {
            revenueChange: { type: Number, default: 0 }, // %
            ordersChange: { type: Number, default: 0 }, // %
            ratingChange: { type: Number, default: 0 }
        },
        // Status
        status: {
            type: String,
            enum: ["generating", "ready", "sent", "failed"],
            default: "generating"
        },
        // PDF file path
        pdfPath: String,
        sentAt: Date,
        error: String
    },
    {
        timestamps: true
    }
);

// Indexes
sellerReportSchema.index({ seller: 1, periodStart: -1 });
sellerReportSchema.index({ periodStart: 1, periodEnd: 1 });
sellerReportSchema.index({ status: 1, createdAt: -1 });

const SellerReport = mongoose.model("SellerReport", sellerReportSchema);

export default SellerReport;
