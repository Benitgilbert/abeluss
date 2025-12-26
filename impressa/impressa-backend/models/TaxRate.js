import mongoose from "mongoose";

const taxRateSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // e.g., "VAT", "Rwanda Tax"
        province: { type: String, default: "*" }, // * for all provinces, or specific province
        district: { type: String, default: "*" }, // * for all districts in province
        sector: { type: String, default: "*" },   // * for all sectors in district
        cell: { type: String, default: "*" },     // * for all cells in sector
        rate: { type: Number, required: true }, // Percentage
        priority: { type: Number, default: 1 },
        compound: { type: Boolean, default: false }, // Applied on top of other taxes
        shipping: { type: Boolean, default: true }, // Applies to shipping cost
        class: { type: String, default: "standard" } // standard, reduced, zero
    },
    { timestamps: true }
);

const TaxRate = mongoose.model("TaxRate", taxRateSchema);

export default TaxRate;
