import Shift from "../models/Shift.js";
import logger from "../config/logger.js";

// @desc    Start a new shift
// @route   POST /api/shifts/start
// @access  Private (Admin/Seller)
export const startShift = async (req, res) => {
    try {
        const { startingDrawerAmount } = req.body;

        if (startingDrawerAmount === undefined) {
            return res.status(400).json({ success: false, message: "Starting drawer amount is required" });
        }

        // Check if there is already an open shift for this user
        const existingShift = await Shift.findOne({ user: req.user.id, status: "open" });
        if (existingShift) {
            return res.status(400).json({ success: false, message: "You already have an open shift. Please close it first." });
        }

        const newShift = new Shift({
            user: req.user.id,
            startingDrawerAmount,
            expectedEndingDrawerAmount: startingDrawerAmount
        });

        await newShift.save();

        res.status(201).json({ success: true, data: newShift });
    } catch (error) {
        logger.error({ err: error }, "Failed to start shift");
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get current active shift for user
// @route   GET /api/shifts/current
// @access  Private (Admin/Seller)
export const getCurrentShift = async (req, res) => {
    try {
        const shift = await Shift.findOne({ user: req.user.id, status: "open" });
        
        if (!shift) {
            return res.status(200).json({ success: true, data: null });
        }

        res.status(200).json({ success: true, data: shift });
    } catch (error) {
        logger.error({ err: error }, "Failed to get current shift");
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Close current active shift
// @route   POST /api/shifts/close
// @access  Private (Admin/Seller)
export const closeShift = async (req, res) => {
    try {
        const { actualEndingDrawerAmount, notes } = req.body;

        if (actualEndingDrawerAmount === undefined) {
            return res.status(400).json({ success: false, message: "Actual ending drawer amount is required" });
        }

        const shift = await Shift.findOne({ user: req.user.id, status: "open" });
        if (!shift) {
            return res.status(404).json({ success: false, message: "No open shift found" });
        }

        shift.status = "closed";
        shift.endTime = Date.now();
        shift.actualEndingDrawerAmount = actualEndingDrawerAmount;
        if (notes) shift.notes = notes;

        await shift.save();

        res.status(200).json({ success: true, data: shift });
    } catch (error) {
        logger.error({ err: error }, "Failed to close shift");
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get shift report by ID
// @route   GET /api/shifts/:id/report
// @access  Private (Admin/Seller)
export const getShiftReport = async (req, res) => {
    try {
        const shift = await Shift.findById(req.params.id)
            .populate("orders", "orderNumber totalAmount paymentMethod status createdAt")
            .populate("user", "firstName lastName email");

        if (!shift) {
            return res.status(404).json({ success: false, message: "Shift not found" });
        }

        // Check if user is authorized (Admin or the shift owner)
        if (req.user.role !== "admin" && shift.user._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized to view this shift" });
        }

        res.status(200).json({ success: true, data: shift });
    } catch (error) {
        logger.error({ err: error }, "Failed to get shift report");
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
