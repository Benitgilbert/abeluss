import Attribute from "../models/Attribute.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @desc    Get all attributes
// @route   GET /api/attributes
// @access  Public
const getAttributes = asyncHandler(async (req, res) => {
    const attributes = await Attribute.find({ isActive: true });
    res.json(attributes);
});

// @desc    Get attribute by ID
// @route   GET /api/attributes/:id
// @access  Public
const getAttributeById = asyncHandler(async (req, res) => {
    const attribute = await Attribute.findById(req.params.id);

    if (attribute) {
        res.json(attribute);
    } else {
        res.status(404);
        throw new Error("Attribute not found");
    }
});

// @desc    Create a new attribute
// @route   POST /api/attributes
// @access  Private/Admin
const createAttribute = asyncHandler(async (req, res) => {
    const { name, type, values } = req.body;

    const attributeExists = await Attribute.findOne({ name });

    if (attributeExists) {
        res.status(400);
        throw new Error("Attribute already exists");
    }

    const attribute = await Attribute.create({
        name,
        type,
        values,
    });

    if (attribute) {
        res.status(201).json(attribute);
    } else {
        res.status(400);
        throw new Error("Invalid attribute data");
    }
});

// @desc    Update attribute
// @route   PUT /api/attributes/:id
// @access  Private/Admin
const updateAttribute = asyncHandler(async (req, res) => {
    const attribute = await Attribute.findById(req.params.id);

    if (attribute) {
        attribute.name = req.body.name || attribute.name;
        attribute.type = req.body.type || attribute.type;
        attribute.values = req.body.values || attribute.values;
        attribute.isActive = req.body.isActive !== undefined ? req.body.isActive : attribute.isActive;

        const updatedAttribute = await attribute.save();
        res.json(updatedAttribute);
    } else {
        res.status(404);
        throw new Error("Attribute not found");
    }
});

// @desc    Delete attribute
// @route   DELETE /api/attributes/:id
// @access  Private/Admin
const deleteAttribute = asyncHandler(async (req, res) => {
    const attribute = await Attribute.findById(req.params.id);

    if (attribute) {
        await attribute.deleteOne();
        res.json({ message: "Attribute removed" });
    } else {
        res.status(404);
        throw new Error("Attribute not found");
    }
});

export {
    getAttributes,
    getAttributeById,
    createAttribute,
    updateAttribute,
    deleteAttribute,
};
