import GiftCardProduct from "../models/GiftCardProduct.js";
import logger from "../config/logger.js";

/**
 * Get all active gift card products (Public)
 */
export const getActiveProducts = async (req, res, next) => {
    try {
        const products = await GiftCardProduct.find({ isActive: true })
            .sort({ order: 1 })
            .select("-createdAt -updatedAt -__v");

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all gift card products (Admin)
 */
export const getAllProducts = async (req, res, next) => {
    try {
        const products = await GiftCardProduct.find()
            .sort({ order: 1 });

        res.json({
            success: true,
            data: products,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create gift card product (Admin)
 */
export const createProduct = async (req, res, next) => {
    try {
        const { label, amount, color, isCustom, isActive, expiryDays } = req.body;

        // Get max order
        const maxOrder = await GiftCardProduct.findOne().sort({ order: -1 }).select("order");
        const newOrder = maxOrder ? maxOrder.order + 1 : 0;

        const product = new GiftCardProduct({
            label,
            amount: amount || 0,
            color: color || "from-violet-500 to-indigo-600",
            isCustom: isCustom || false,
            isActive: isActive !== false,
            expiryDays: expiryDays || 365,
            order: newOrder,
        });

        await product.save();

        logger.info({ label, amount }, "Gift Card Product Created");

        res.status(201).json({
            success: true,
            message: "Gift Card Product created successfully",
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update gift card product (Admin)
 */
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { label, amount, color, isCustom, isActive, order, expiryDays } = req.body;

        const product = await GiftCardProduct.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (label !== undefined) product.label = label;
        if (amount !== undefined) product.amount = amount;
        if (color !== undefined) product.color = color;
        if (isCustom !== undefined) product.isCustom = isCustom;
        if (isActive !== undefined) product.isActive = isActive;
        if (order !== undefined) product.order = order;
        if (expiryDays !== undefined) product.expiryDays = expiryDays;

        await product.save();

        logger.info({ id, changes: req.body }, "Gift Card Product Updated");

        res.json({
            success: true,
            message: "Gift Card Product updated successfully",
            data: product,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete gift card product (Admin)
 */
export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await GiftCardProduct.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        await GiftCardProduct.findByIdAndDelete(id);

        logger.info({ id, label: product.label }, "Gift Card Product Deleted");

        res.json({
            success: true,
            message: "Gift Card Product deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reorder gift card products (Admin)
 */
export const reorderProducts = async (req, res, next) => {
    try {
        const { orderedIds } = req.body; // Array of IDs in new order

        if (!Array.isArray(orderedIds)) {
            return res.status(400).json({ success: false, message: "orderedIds must be an array" });
        }

        // Update each product's order
        const updates = orderedIds.map((id, index) =>
            GiftCardProduct.findByIdAndUpdate(id, { order: index })
        );

        await Promise.all(updates);

        logger.info({ count: orderedIds.length }, "Gift Card Products Reordered");

        res.json({
            success: true,
            message: "Products reordered successfully",
        });
    } catch (error) {
        next(error);
    }
};
