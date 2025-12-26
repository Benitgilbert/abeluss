import ShippingZone from "../models/ShippingZone.js";

// Get all zones (Admin)
export const getZones = async (req, res, next) => {
    try {
        const zones = await ShippingZone.find().sort({ createdAt: -1 });
        res.json({ success: true, data: zones });
    } catch (error) {
        next(error);
    }
};

// Create zone (Admin)
export const createZone = async (req, res, next) => {
    try {
        const zone = await ShippingZone.create(req.body);
        res.status(201).json({ success: true, data: zone });
    } catch (error) {
        next(error);
    }
};

// Update zone (Admin)
export const updateZone = async (req, res, next) => {
    try {
        const zone = await ShippingZone.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!zone) {
            const error = new Error("Zone not found");
            error.statusCode = 404;
            throw error;
        }
        res.json({ success: true, data: zone });
    } catch (error) {
        next(error);
    }
};

// Delete zone (Admin)
export const deleteZone = async (req, res, next) => {
    try {
        const zone = await ShippingZone.findByIdAndDelete(req.params.id);
        if (!zone) {
            const error = new Error("Zone not found");
            error.statusCode = 404;
            throw error;
        }
        res.json({ success: true, message: "Zone deleted" });
    } catch (error) {
        next(error);
    }
};

// Calculate shipping methods for an address (Public)
export const calculateShipping = async (req, res, next) => {
    try {
        const { province, district, sector, cell, total, items } = req.body;

        // 1. Find matching zone using cascading hierarchy
        // Priority: Cell > Sector > District > Province > Default
        let matchedZone = null;

        // Try to find most specific match first (all fields match)
        if (province && district && sector && cell) {
            matchedZone = await ShippingZone.findOne({
                isActive: true,
                "regions": {
                    $elemMatch: {
                        province: province,
                        district: district,
                        sector: sector,
                        cell: cell
                    }
                }
            });
        }

        // Fallback to sector-level match (cell is wildcard)
        if (!matchedZone && province && district && sector) {
            matchedZone = await ShippingZone.findOne({
                isActive: true,
                "regions": {
                    $elemMatch: {
                        province: province,
                        district: district,
                        sector: sector,
                        cell: null
                    }
                }
            });
        }

        // Fallback to district-level match (sector and cell are wildcards)
        if (!matchedZone && province && district) {
            matchedZone = await ShippingZone.findOne({
                isActive: true,
                "regions": {
                    $elemMatch: {
                        province: province,
                        district: district,
                        sector: null,
                        cell: null
                    }
                }
            });
        }

        // Fallback to province-level match (district, sector, cell are wildcards)
        if (!matchedZone && province) {
            matchedZone = await ShippingZone.findOne({
                isActive: true,
                "regions": {
                    $elemMatch: {
                        province: province,
                        district: null,
                        sector: null,
                        cell: null
                    }
                }
            });
        }

        // Final fallback to default zone
        if (!matchedZone) {
            matchedZone = await ShippingZone.findOne({
                isActive: true,
                name: "Default"
            });
        }

        if (!matchedZone) {
            return res.json({ success: true, data: [] });
        }

        // 2. Filter and Adjust methods based on shipping classes and conditions
        const methods = matchedZone.methods.map(method => {
            if (!method.isActive) return null;

            // Check free shipping threshold
            if (method.type === "free_shipping" && total < method.minOrderAmount) return null;

            let finalCost = method.cost;

            // Add class costs per item
            if (items && items.length > 0) {
                items.forEach(item => {
                    const shippingClassId = item.product?.shippingClass;
                    if (shippingClassId && method.classCosts && method.classCosts.has(shippingClassId)) {
                        const classCost = method.classCosts.get(shippingClassId);
                        finalCost += (classCost * item.quantity);
                    }
                });
            }

            return {
                ...method.toObject(),
                cost: finalCost
            };
        }).filter(Boolean);

        res.json({ success: true, data: methods });
    } catch (error) {
        next(error);
    }
};
