import GiftCard from "../models/GiftCard.js";
import logger from "../config/logger.js";

/**
 * Check Gift Card Balance (Public)
 */
export const checkBalance = async (req, res, next) => {
    try {
        const { code } = req.params;
        if (!code) {
            return res.status(400).json({ success: false, message: "Code is required" });
        }

        const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

        if (!giftCard) {
            return res.status(404).json({ success: false, message: "Invalid Gift Card code" });
        }

        if (giftCard.status !== "Active") {
            return res.status(400).json({ success: false, message: `This gift card is ${giftCard.status.toLowerCase()}` });
        }

        if (new Date() > giftCard.expiryDate) {
            giftCard.status = "Expired";
            await giftCard.save();
            return res.status(400).json({ success: false, message: "This gift card has expired" });
        }

        res.json({
            success: true,
            data: {
                balance: giftCard.currentBalance,
                expiryDate: giftCard.expiryDate,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Validate and get balance (Internal/Redemption)
 */
export const validateGiftCard = async (req, res, next) => {
    try {
        const { code } = req.body;
        const giftCard = await GiftCard.findOne({ code: code.toUpperCase(), status: "Active" });

        if (!giftCard) {
            return res.status(404).json({ success: false, message: "Valid active Gift Card not found" });
        }

        if (new Date() > giftCard.expiryDate) {
            giftCard.status = "Expired";
            await giftCard.save();
            return res.status(400).json({ success: false, message: "Gift Card has expired" });
        }

        res.json({ success: true, data: giftCard });
    } catch (error) {
        next(error);
    }
};

/**
 * Create/Purchase Gift Card (Protected)
 * This is called after a successful order payment for a gift card product
 */
export const createGiftCard = async (req, res, next) => {
    try {
        const { initialAmount, recipientEmail, message } = req.body;
        const sender = req.user.id;

        const code = GiftCard.generateCode();

        const giftCard = new GiftCard({
            code,
            initialAmount,
            currentBalance: initialAmount,
            sender,
            recipientEmail,
            message,
            status: "Active", // Usually would be 'Pending' until payment confirmed
        });

        await giftCard.save();

        logger.info({ code, amount: initialAmount, recipient: recipientEmail }, "Gift Card Created");

        res.status(201).json({
            success: true,
            message: "Gift Card created successfully",
            data: giftCard,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Redeem Gift Card (Internal use by checkout)
 */
export const redeemGiftCard = async (req, res, next) => {
    try {
        const { code, amount } = req.body;
        const giftCard = await GiftCard.findOne({ code: code.toUpperCase(), status: "Active" });

        if (!giftCard || giftCard.currentBalance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient Gift Card balance or invalid code" });
        }

        giftCard.currentBalance -= amount;
        if (giftCard.currentBalance === 0) {
            giftCard.status = "Redeemed";
        }

        await giftCard.save();

        logger.info({ code, redeemed: amount, remaining: giftCard.currentBalance }, "Gift Card Redeemed");

        res.json({
            success: true,
            message: "Gift card applied successfully",
            data: {
                redeemedAmount: amount,
                remainingBalance: giftCard.currentBalance,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all Gift Cards (Admin)
 */
export const getAllGiftCards = async (req, res, next) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
        const query = {};

        if (status && status !== "all") {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { code: { $regex: search, $options: "i" } },
                { recipientEmail: { $regex: search, $options: "i" } },
            ];
        }

        const giftCards = await GiftCard.find(query)
            .populate("sender", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await GiftCard.countDocuments(query);

        res.json({
            success: true,
            data: giftCards,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Gift Card (Admin) - Full CRUD
 */
export const updateGiftCardStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, expiryDate, currentBalance, recipientEmail, message } = req.body;

        const giftCard = await GiftCard.findById(id);
        if (!giftCard) {
            return res.status(404).json({ success: false, message: "Gift Card not found" });
        }

        // Update all provided fields
        if (status) giftCard.status = status;
        if (expiryDate) giftCard.expiryDate = new Date(expiryDate);
        if (currentBalance !== undefined && currentBalance >= 0) {
            giftCard.currentBalance = currentBalance;
            // If balance is zero, mark as redeemed
            if (currentBalance === 0 && giftCard.status === "Active") {
                giftCard.status = "Redeemed";
            }
        }
        if (recipientEmail) giftCard.recipientEmail = recipientEmail;
        if (message !== undefined) giftCard.message = message;

        await giftCard.save();

        logger.info({ id, changes: req.body }, "Gift Card Updated by Admin");

        res.json({
            success: true,
            message: "Gift Card updated successfully",
            data: giftCard,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Gift Card (Admin)
 */
export const deleteGiftCard = async (req, res, next) => {
    try {
        const { id } = req.params;

        const giftCard = await GiftCard.findById(id);
        if (!giftCard) {
            return res.status(404).json({ success: false, message: "Gift Card not found" });
        }

        await GiftCard.findByIdAndDelete(id);

        logger.info({ id, code: giftCard.code }, "Gift Card Deleted by Admin");

        res.json({
            success: true,
            message: "Gift Card deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
