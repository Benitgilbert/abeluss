import mongoose from "mongoose";

const shippingMethodSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Standard Shipping", "Express"
    type: {
        type: String,
        enum: ["flat_rate", "free_shipping", "local_pickup"],
        required: true
    },
    cost: { type: Number, default: 0 },
    minOrderAmount: { type: Number, default: 0 }, // For free shipping
    minOrderAmount: { type: Number, default: 0 }, // For free shipping
    isActive: { type: Boolean, default: true },
    classCosts: {
        type: Map,
        of: Number,
        default: {}
    } // Map of ShippingClass ID -> Cost
});

const shippingZoneSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true }, // e.g., "Kigali City Zone", "Eastern Province Zone"
        regions: [{
            province: { type: String, required: true }, // Required - e.g., "Kigali City", "Eastern Province"
            district: { type: String, default: null },  // Optional - null means all districts in province
            sector: { type: String, default: null },    // Optional - null means all sectors in district
            cell: { type: String, default: null }       // Optional - null means all cells in sector
        }],
        methods: [shippingMethodSchema],
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const ShippingZone = mongoose.model("ShippingZone", shippingZoneSchema);

export default ShippingZone;
