import Violation from '../models/Violation.js';
import User from '../models/User.js';

// Get violations with filtering
export const getViolations = async (req, res) => {
    try {
        const { status, type, page = 1, limit = 10 } = req.query;
        const query = {};

        if (status && status !== 'all') query.status = status;
        if (type && type !== 'all') query.type = type;

        const violations = await Violation.find(query)
            .populate('seller', 'name email storeName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Violation.countDocuments(query);

        // Stats
        const stats = {
            total: await Violation.countDocuments(),
            active: await Violation.countDocuments({ status: 'active' }),
            warning: await Violation.countDocuments({ status: 'warning' }),
            suspension: await Violation.countDocuments({ status: 'suspension' }) // Fixed typo from 'review' to match enum if needed, but simple count is fine
        };

        res.json({
            violations,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            stats
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update violation status (Dismiss, Escalate)
export const updateViolationStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const violation = await Violation.findById(req.params.id);

        if (!violation) return res.status(404).json({ message: 'Violation not found' });

        violation.status = status;
        if (adminNotes) violation.adminNotes = adminNotes;

        if (status === 'dismissed') {
            violation.resolvedAt = new Date();
            // In a real system, you might restore penalty points here
        }

        await violation.save();
        res.json(violation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Generate Sample Violations (For Demo Purpose)
export const generateSampleViolations = async (req, res) => {
    try {
        const sellers = await User.find({ role: 'seller' }).limit(3);
        if (sellers.length === 0) return res.status(400).json({ message: 'No sellers found to violate' });

        const violation = new Violation({
            seller: sellers[0]._id,
            type: 'high_cancellation_rate',
            severity: 'high',
            status: 'active',
            penaltyPoints: 5,
            description: 'Cancellation rate (25%) exceeds threshold (20%)',
            metrics: { currentValue: 25, threshold: 20 }
        });
        await violation.save();

        res.status(201).json({ message: 'Sample violation generated', violation });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
