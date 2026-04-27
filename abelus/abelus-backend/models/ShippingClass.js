import mongoose from "mongoose";

const shippingClassSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const ShippingClass = mongoose.model("ShippingClass", shippingClassSchema);

export default ShippingClass;
