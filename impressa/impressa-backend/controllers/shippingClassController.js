import ShippingClass from "../models/ShippingClass.js";
import slugify from "slugify";

// Get all shipping classes
export const getShippingClasses = async (req, res, next) => {
    try {
        const classes = await ShippingClass.find().sort({ name: 1 });
        res.json({ success: true, data: classes });
    } catch (error) {
        next(error);
    }
};

// Create shipping class
export const createShippingClass = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const slug = slugify(name, { lower: true, strict: true });

        const shippingClass = await ShippingClass.create({
            name,
            slug,
            description,
        });

        res.status(201).json({ success: true, data: shippingClass });
    } catch (error) {
        next(error);
    }
};

// Update shipping class
export const updateShippingClass = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const updateData = { name, description };

        if (name) {
            updateData.slug = slugify(name, { lower: true, strict: true });
        }

        const shippingClass = await ShippingClass.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!shippingClass) {
            const error = new Error("Shipping Class not found");
            error.statusCode = 404;
            throw error;
        }

        res.json({ success: true, data: shippingClass });
    } catch (error) {
        next(error);
    }
};

// Delete shipping class
export const deleteShippingClass = async (req, res, next) => {
    try {
        const shippingClass = await ShippingClass.findByIdAndDelete(req.params.id);

        if (!shippingClass) {
            const error = new Error("Shipping Class not found");
            error.statusCode = 404;
            throw error;
        }

        res.json({ success: true, message: "Shipping Class deleted" });
    } catch (error) {
        next(error);
    }
};
