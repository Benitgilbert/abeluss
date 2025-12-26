import cron from "node-cron";
import Payout from "../models/Payout.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import SiteSettings from "../models/SiteSettings.js";

/**
 * Process automated payouts for sellers
 * Runs based on configured schedule
 */
export const processAutomatedPayouts = async () => {
    console.log("[Payout Cron] Starting automated payout processing...");

    try {
        const settings = await SiteSettings.getSettings();
        const { autoPayoutEnabled, minimumAmount, maxAutoPayoutAmount } = settings.payoutSettings || {};
        const commissionRate = settings.commissionRate || 10;

        if (!autoPayoutEnabled) {
            console.log("[Payout Cron] Auto payouts disabled. Skipping.");
            return { success: true, message: "Auto payouts disabled", processed: 0 };
        }

        // Get all active sellers
        const activeSellers = await User.find({
            role: "seller",
            sellerStatus: "active"
        });

        console.log(`[Payout Cron] Processing ${activeSellers.length} active sellers...`);

        let processed = 0;
        let skipped = 0;
        const results = [];

        for (const seller of activeSellers) {
            try {
                // Get seller's pending balance
                const balance = await Payout.getSellerPendingBalance(seller._id);

                // Skip if below minimum
                if (balance.balance < (minimumAmount || 10000)) {
                    skipped++;
                    continue;
                }

                // Calculate commission and net amount
                const grossAmount = balance.balance;
                const platformFee = Math.round(grossAmount * (commissionRate / 100));
                const netAmount = grossAmount - platformFee;

                // Check max auto payout limit
                if (netAmount > (maxAutoPayoutAmount || 500000)) {
                    console.log(`[Payout Cron] Seller ${seller._id} exceeds max auto payout. Requires manual review.`);
                    skipped++;
                    continue;
                }

                // Create payout record
                const payout = new Payout({
                    seller: seller._id,
                    amount: netAmount,
                    grossAmount: grossAmount,
                    platformFee: platformFee,
                    commissionRate: commissionRate,
                    orders: balance.orderIds,
                    orderCount: balance.orderCount,
                    periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                    periodEnd: new Date(),
                    status: "pending",
                    isAutomatic: true,
                    paymentMethod: seller.storePhone ? "mobile_money" : "bank_transfer",
                    paymentDetails: {
                        mobileNumber: seller.storePhone,
                        mobileOperator: "MTN" // Default, should be from seller profile
                    }
                });

                await payout.save();
                processed++;

                results.push({
                    sellerId: seller._id,
                    storeName: seller.storeName,
                    payoutId: payout.payoutId,
                    amount: netAmount,
                    status: "created"
                });

                console.log(`[Payout Cron] Created payout ${payout.payoutId} for seller ${seller.storeName}: ${netAmount} RWF`);

            } catch (err) {
                console.error(`[Payout Cron] Error processing seller ${seller._id}:`, err.message);
                results.push({
                    sellerId: seller._id,
                    error: err.message
                });
            }
        }

        console.log(`[Payout Cron] Complete. Processed: ${processed}, Skipped: ${skipped}`);

        return {
            success: true,
            processed,
            skipped,
            results
        };

    } catch (error) {
        console.error("[Payout Cron] Fatal error:", error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get cron schedule based on frequency setting
 */
const getCronSchedule = (frequency) => {
    switch (frequency) {
        case "daily":
            return "0 6 * * *"; // Every day at 6 AM
        case "weekly":
            return "0 6 * * 1"; // Every Monday at 6 AM
        case "biweekly":
            return "0 6 1,15 * *"; // 1st and 15th of each month at 6 AM
        case "monthly":
            return "0 6 1 * *"; // 1st of each month at 6 AM
        default:
            return "0 6 * * 1"; // Default to weekly
    }
};

/**
 * Initialize payout cron job
 * Call this from your main server file
 */
export const initPayoutCron = async () => {
    try {
        const settings = await SiteSettings.getSettings();
        const frequency = settings.payoutSettings?.frequency || "weekly";
        const schedule = getCronSchedule(frequency);

        console.log(`[Payout Cron] Initializing with schedule: ${schedule} (${frequency})`);

        cron.schedule(schedule, async () => {
            console.log(`[Payout Cron] Running scheduled payout at ${new Date().toISOString()}`);
            await processAutomatedPayouts();
        });

        console.log("[Payout Cron] Initialized successfully");
        return true;
    } catch (error) {
        console.error("[Payout Cron] Failed to initialize:", error);
        return false;
    }
};

/**
 * Manually trigger payout processing (for testing/admin use)
 */
export const triggerManualPayout = async (sellerId = null) => {
    if (sellerId) {
        // Process single seller
        const seller = await User.findById(sellerId);
        if (!seller || seller.role !== "seller") {
            return { success: false, message: "Seller not found" };
        }

        const settings = await SiteSettings.getSettings();
        const commissionRate = settings.commissionRate || 10;
        const balance = await Payout.getSellerPendingBalance(sellerId);

        if (balance.balance <= 0) {
            return { success: false, message: "No pending balance" };
        }

        const grossAmount = balance.balance;
        const platformFee = Math.round(grossAmount * (commissionRate / 100));
        const netAmount = grossAmount - platformFee;

        const payout = new Payout({
            seller: sellerId,
            amount: netAmount,
            grossAmount: grossAmount,
            platformFee: platformFee,
            commissionRate: commissionRate,
            orders: balance.orderIds,
            orderCount: balance.orderCount,
            periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            periodEnd: new Date(),
            status: "pending",
            isAutomatic: false,
            paymentMethod: seller.storePhone ? "mobile_money" : "bank_transfer",
            paymentDetails: {
                mobileNumber: seller.storePhone
            }
        });

        await payout.save();

        return {
            success: true,
            payout: {
                payoutId: payout.payoutId,
                amount: netAmount,
                grossAmount,
                platformFee
            }
        };
    }

    // Process all sellers
    return await processAutomatedPayouts();
};

export default {
    initPayoutCron,
    processAutomatedPayouts,
    triggerManualPayout
};
