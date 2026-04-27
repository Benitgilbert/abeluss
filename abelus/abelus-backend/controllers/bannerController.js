import Banner from "../models/Banner.js";

/**
 * Get all banners (admin)
 */
export const getAllBanners = async (req, res, next) => {
    try {
        const banners = await Banner.find().sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            count: banners.length,
            data: banners
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get active banners for public display
 */
export const getActiveBanners = async (req, res, next) => {
    try {
        const { position } = req.query;
        const banners = await Banner.getActiveBanners(position || null);

        res.json({
            success: true,
            count: banners.length,
            data: banners
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single banner by ID
 */
export const getBannerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findById(id);

        if (!banner) {
            const error = new Error("Banner not found");
            error.statusCode = 404;
            return next(error);
        }

        res.json({
            success: true,
            data: banner
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create new banner
 */
export const createBanner = async (req, res, next) => {
    try {
        const {
            title,
            subtitle,
            badge,
            buttonText,
            buttonLink,
            backgroundImage,
            gradientFrom,
            gradientTo,
            startDate,
            endDate,
            isActive,
            order,
            position
        } = req.body;

        const banner = await Banner.create({
            title,
            subtitle,
            badge,
            buttonText,
            buttonLink,
            backgroundImage,
            gradientFrom,
            gradientTo,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            isActive: isActive !== false,
            order: order || 0,
            position: position || "hero"
        });

        res.status(201).json({
            success: true,
            message: "Banner created successfully",
            data: banner
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update banner
 */
export const updateBanner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };

        // Convert dates
        if (updates.startDate) {
            updates.startDate = updates.startDate ? new Date(updates.startDate) : null;
        }
        if (updates.endDate) {
            updates.endDate = updates.endDate ? new Date(updates.endDate) : null;
        }

        const banner = await Banner.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!banner) {
            const error = new Error("Banner not found");
            error.statusCode = 404;
            return next(error);
        }

        res.json({
            success: true,
            message: "Banner updated successfully",
            data: banner
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete banner
 */
export const deleteBanner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByIdAndDelete(id);

        if (!banner) {
            const error = new Error("Banner not found");
            error.statusCode = 404;
            return next(error);
        }

        res.json({
            success: true,
            message: "Banner deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reorder banners
 */
export const reorderBanners = async (req, res, next) => {
    try {
        const { banners } = req.body; // Array of { id, order }

        if (!Array.isArray(banners)) {
            const error = new Error("Invalid banners array");
            error.statusCode = 400;
            return next(error);
        }

        const updatePromises = banners.map(({ id, order }) =>
            Banner.findByIdAndUpdate(id, { order })
        );

        await Promise.all(updatePromises);

        res.json({
            success: true,
            message: "Banners reordered successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle banner active status
 */
export const toggleBannerStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findById(id);

        if (!banner) {
            const error = new Error("Banner not found");
            error.statusCode = 404;
            return next(error);
        }

        banner.isActive = !banner.isActive;
        await banner.save();

        res.json({
            success: true,
            message: `Banner ${banner.isActive ? "activated" : "deactivated"} successfully`,
            data: banner
        });
    } catch (error) {
        next(error);
    }
};
