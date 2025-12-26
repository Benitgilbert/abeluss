import mongoose from "mongoose";
import Order from "../models/Order.js";

export const getWeeklyProfit = async (req, res) => {
  try {
    const weeklyProfit = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          profit: { $sum: "$totals.grandTotal" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Format the response to match frontend expectations
    // MongoDB $dayOfWeek returns 1 (Sunday) to 7 (Saturday)
    const formattedData = weeklyProfit.map((item) => ({
      day: item._id,
      profit: item.profit
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("Weekly profit data fetch failed:", err);
    res.status(500).json({ message: "Failed to load weekly profit data." });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("items.product customer");

    res.json(recentOrders);
  } catch (err) {
    console.error("Recent orders fetch failed:", err);
    res.status(500).json({ message: "Failed to load recent orders." });
  }
};

export const getCustomizationDemand = async (req, res) => {
  try {
    const demandData = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          customText: { $sum: { $cond: [{ $ifNull: ["$items.customizations.customText", false] }, 1, 0] } },
          customFile: { $sum: { $cond: [{ $ifNull: ["$items.customizations.customFile", false] }, 1, 0] } },
          cloudLink: { $sum: { $cond: [{ $ifNull: ["$items.customizations.cloudLink", false] }, 1, 0] } }
        }
      }
    ]);

    const result = demandData[0] || { customText: 0, customFile: 0, cloudLink: 0 };
    const total = result.customText + result.customFile + result.cloudLink;

    res.json({
      customText: result.customText,
      customFile: result.customFile,
      cloudLink: result.cloudLink,
      total
    });
  } catch (err) {
    console.error("Customization demand fetch failed:", err);
    res.status(500).json({ message: "Failed to load customization demand." });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          productName: { $ifNull: ["$product.name", "Unknown Product"] },
          totalQuantity: 1,
          totalOrders: 1
        }
      }
    ]);

    res.json(topProducts);
  } catch (err) {
    console.error("Top products fetch failed:", err);
    res.status(500).json({ message: "Failed to load top products." });
  }
};

export const getRevenueData = async (req, res) => {
  try {
    const { period = "month" } = req.query;
    let groupId;
    let matchStage = { status: "delivered" };
    let sortStage = { "_id": 1 };

    const now = new Date();

    if (period === "day") {
      // Last 30 days
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      matchStage.createdAt = { $gte: thirtyDaysAgo };
      groupId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    } else if (period === "week") {
      // Last 12 weeks
      const twelveWeeksAgo = new Date(now);
      twelveWeeksAgo.setDate(now.getDate() - 12 * 7);
      matchStage.createdAt = { $gte: twelveWeeksAgo };
      groupId = { $isoWeek: "$createdAt" };
    } else {
      // Default: Month (Last 12 months)
      const twelveMonthsAgo = new Date(now);
      twelveMonthsAgo.setMonth(now.getMonth() - 12);
      matchStage.createdAt = { $gte: twelveMonthsAgo };
      groupId = { $month: "$createdAt" };
    }

    const revenueData = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupId,
          revenue: { $sum: "$totals.grandTotal" },
          sales: { $sum: { $sum: "$items.quantity" } }
        }
      },
      { $sort: sortStage }
    ]);

    // Format response
    const formattedData = revenueData.map((item) => {
      let label = item._id;
      if (period === "month") {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        label = months[item._id - 1] || item._id;
      } else if (period === "week") {
        label = `Week ${item._id}`;
      }
      // For 'day', label is already YYYY-MM-DD
      return {
        label,
        revenue: item.revenue,
        sales: item.sales
      };
    });

    res.json(formattedData);
  } catch (err) {
    console.error("Revenue data fetch failed:", err);
    res.status(500).json({ message: "Failed to load revenue data." });
  }
};

export const getSellerRevenueData = async (req, res) => {
  try {
    const { period = "day" } = req.query;
    const sellerId = req.user.id;

    // Default to last 30 days for seller dashboard
    let groupId;
    let matchCreate = {};
    const now = new Date();

    if (period === "week") {
      const twelveWeeksAgo = new Date(now);
      twelveWeeksAgo.setDate(now.getDate() - 12 * 7);
      matchCreate = { createdAt: { $gte: twelveWeeksAgo } };
      groupId = { $isoWeek: "$createdAt" };
    } else if (period === "month") {
      const twelveMonthsAgo = new Date(now);
      twelveMonthsAgo.setMonth(now.getMonth() - 12);
      matchCreate = { createdAt: { $gte: twelveMonthsAgo } };
      groupId = { $month: "$createdAt" };
    } else {
      // Default day/30days
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      matchCreate = { createdAt: { $gte: thirtyDaysAgo } };
      groupId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          status: "delivered", // Only count delivered orders as realized revenue
          ...matchCreate
        }
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.seller": new mongoose.Types.ObjectId(sellerId)
        }
      },
      {
        $group: {
          _id: groupId,
          revenue: { $sum: "$items.subtotal" },
          sales: { $sum: "$items.quantity" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Format response (fill gaps if needed, but for now just return data)
    const formattedData = revenueData.map((item) => {
      let label = item._id;
      if (period === "month") {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        label = months[item._id - 1] || item._id;
      } else if (period === "week") {
        label = `Week ${item._id}`;
      }
      return {
        label,
        revenue: item.revenue,
        sales: item.sales
      };
    });

    res.json(formattedData);

  } catch (err) {
    console.error("Seller revenue data fetch failed:", err);
    res.status(500).json({ message: "Failed to load seller revenue data." });
  }
};
