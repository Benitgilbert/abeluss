import mongoose from 'mongoose';

const violationSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['high_cancellation_rate', 'slow_fulfillment', 'low_rating', 'policy_violation'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['active', 'warning', 'review', 'suspension', 'dismissed'],
        default: 'active'
    },
    penaltyPoints: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        required: true
    },
    metrics: {
        currentValue: Number,
        threshold: Number
    },
    adminNotes: String,
    resolvedAt: Date
}, {
    timestamps: true
});

const Violation = mongoose.model('Violation', violationSchema);
export default Violation;
