import TaxRate from "../models/TaxRate.js";

// Get all rates (Admin)
export const getTaxRates = async (req, res, next) => {
    try {
        const rates = await TaxRate.find().sort({ priority: 1, createdAt: -1 });
        res.json({ success: true, data: rates });
    } catch (error) {
        next(error);
    }
};

// Create rate (Admin)
export const createTaxRate = async (req, res, next) => {
    try {
        const rate = await TaxRate.create(req.body);
        res.status(201).json({ success: true, data: rate });
    } catch (error) {
        next(error);
    }
};

// Update rate (Admin)
export const updateTaxRate = async (req, res, next) => {
    try {
        const rate = await TaxRate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!rate) {
            const error = new Error("Tax rate not found");
            error.statusCode = 404;
            throw error;
        }
        res.json({ success: true, data: rate });
    } catch (error) {
        next(error);
    }
};

// Delete rate (Admin)
export const deleteTaxRate = async (req, res, next) => {
    try {
        const rate = await TaxRate.findByIdAndDelete(req.params.id);
        if (!rate) {
            const error = new Error("Tax rate not found");
            error.statusCode = 404;
            throw error;
        }
        res.json({ success: true, message: "Tax rate deleted" });
    } catch (error) {
        next(error);
    }
};

// Calculate taxes for an order (Public)
export const calculateTax = async (req, res, next) => {
    try {
        const { province, district, sector, cell, subtotal, shippingCost } = req.body;

        // Find matching tax rates using cascading hierarchy
        // Priority: More specific matches take precedence over generic ones
        const rates = await TaxRate.find().sort({ priority: 1 });

        let totalTax = 0;
        const taxes = [];

        for (const rate of rates) {
            // Check if this rate matches the address using cascading logic
            // A wildcard (*) means "applies to all" at that level

            // Province match
            if (rate.province !== "*" && rate.province !== province) continue;

            // District match (only check if rate specifies a district)
            if (rate.district !== "*") {
                if (!district || rate.district !== district) continue;
            }

            // Sector match (only check if rate specifies a sector)
            if (rate.sector !== "*") {
                if (!sector || rate.sector !== sector) continue;
            }

            // Cell match (only check if rate specifies a cell)
            if (rate.cell !== "*") {
                if (!cell || rate.cell !== cell) continue;
            }

            // Calculate tax amount
            let taxableAmount = subtotal;
            if (rate.shipping) {
                taxableAmount += shippingCost;
            }

            const taxAmount = taxableAmount * (rate.rate / 100);
            totalTax += taxAmount;

            taxes.push({
                name: rate.name,
                amount: taxAmount,
                rate: rate.rate
            });
        }

        res.json({ success: true, data: { totalTax, taxes } });
    } catch (error) {
        next(error);
    }
};

// 🔄 Mock Fetch Live Rates (Rwanda Tax Simulation)
export const fetchLiveRates = async (req, res, next) => {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock Rwanda tax data
        const liveRates = [
            {
                name: "Rwanda VAT",
                province: "*",  // Applies to all provinces
                district: "*",
                sector: "*",
                cell: "*",
                rate: 18.0,
                priority: 1,
                shipping: true
            },
            // Example: Special tax zone for Kigali
            {
                name: "Kigali City Tax",
                province: "Kigali City",
                district: "*",
                sector: "*",
                cell: "*",
                rate: 0.5,  // Additional 0.5% for Kigali
                priority: 2,
                shipping: false
            }
        ];

        const addedRates = [];

        for (const rateData of liveRates) {
            // Check if exists to avoid duplicates (simple check by name)
            const exists = await TaxRate.findOne({
                name: rateData.name,
                province: rateData.province
            });
            if (!exists) {
                const newRate = await TaxRate.create(rateData);
                addedRates.push(newRate);
            }
        }

        res.json({
            success: true,
            message: `Successfully fetched and synced ${addedRates.length} new rates.`,
            data: addedRates
        });
    } catch (error) {
        next(error);
    }
};
