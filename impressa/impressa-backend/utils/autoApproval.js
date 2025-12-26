import SiteSettings from "../models/SiteSettings.js";
import User from "../models/User.js";

/**
 * Calculate seller approval score based on profile completeness
 * @param {Object} user - User document
 * @param {Object} criteria - Scoring criteria from settings
 * @returns {Object} - { score, breakdown }
 */
export const calculateSellerScore = (user, criteria) => {
    const breakdown = {};
    let score = 0;

    // Email verified (always true if they can register as seller)
    if (user.email) {
        breakdown.emailVerified = criteria.emailVerified || 30;
        score += breakdown.emailVerified;
    }

    // Phone provided
    if (user.storePhone) {
        breakdown.phoneProvided = criteria.phoneProvided || 20;
        score += breakdown.phoneProvided;
    }

    // Store name set
    if (user.storeName && user.storeName.trim()) {
        breakdown.storeNameSet = criteria.storeNameSet || 20;
        score += breakdown.storeNameSet;
    }

    // Store description set
    if (user.storeDescription && user.storeDescription.trim()) {
        breakdown.storeDescriptionSet = criteria.storeDescriptionSet || 15;
        score += breakdown.storeDescriptionSet;
    }

    // Profile photo set
    if (user.storeLogo || user.profileImage) {
        breakdown.profilePhotoSet = criteria.profilePhotoSet || 15;
        score += breakdown.profilePhotoSet;
    }

    return { score, breakdown };
};

/**
 * Check if a seller should be auto-approved
 * @param {Object} user - User document
 * @returns {Object} - { shouldApprove, score, breakdown, minScore }
 */
export const checkAutoApproval = async (user) => {
    try {
        const settings = await SiteSettings.getSettings();
        const autoApproval = settings.sellerAutoApproval || {};

        if (!autoApproval.enabled) {
            return { shouldApprove: false, reason: 'Auto-approval disabled' };
        }

        const criteria = autoApproval.criteria || {};
        const minScore = autoApproval.minScore || 80;

        const { score, breakdown } = calculateSellerScore(user, criteria);

        return {
            shouldApprove: score >= minScore,
            score,
            minScore,
            breakdown,
            reason: score >= minScore
                ? 'Profile meets auto-approval criteria'
                : `Score ${score} below minimum ${minScore}`
        };
    } catch (error) {
        console.error('Auto-approval check failed:', error);
        return { shouldApprove: false, reason: 'Check failed', error: error.message };
    }
};

/**
 * Process seller auto-approval
 * @param {String} userId - User ID to check and potentially approve
 * @returns {Object} - Result of the operation
 */
export const processSellerAutoApproval = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user || user.role !== 'seller') {
            return { success: false, message: 'User not found or not a seller' };
        }

        if (user.sellerStatus !== 'pending') {
            return { success: false, message: 'Seller already processed' };
        }

        const result = await checkAutoApproval(user);

        if (result.shouldApprove) {
            user.sellerStatus = 'active';
            user.autoApproved = true;
            user.approvedAt = new Date();
            await user.save();

            return {
                success: true,
                approved: true,
                message: 'Seller auto-approved',
                score: result.score,
                breakdown: result.breakdown
            };
        }

        return {
            success: true,
            approved: false,
            message: 'Pending manual review',
            score: result.score,
            minScore: result.minScore,
            breakdown: result.breakdown
        };
    } catch (error) {
        console.error('Process auto-approval failed:', error);
        return { success: false, message: error.message };
    }
};

export default {
    calculateSellerScore,
    checkAutoApproval,
    processSellerAutoApproval
};
