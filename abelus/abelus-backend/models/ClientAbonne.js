import mongoose from "mongoose";

const clientAbonneSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
        totalDebt: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    { timestamps: true }
);

const ClientAbonne = mongoose.model("ClientAbonne", clientAbonneSchema);

export default ClientAbonne;
