import mongoose from "mongoose";

const abonneTransactionSchema = new mongoose.Schema(
    {
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ClientAbonne",
            required: true,
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
        date: {
            type: Date,
            default: Date.now,
        },
        designation: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        pu: { // Prix Unitaire
            type: Number,
            required: true,
        },
        pt: { // Prix Total
            type: Number,
            required: true,
        },
        amountPaid: { // Upfront cash paid
            type: Number,
            default: 0,
        },
        debtAmount: { // Owed amount (pt - amountPaid)
            type: Number,
            required: true,
        },
        responsible: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["unpaid", "paid", "partially_paid"],
            default: "unpaid",
        },
    },
    { timestamps: true }
);

const AbonneTransaction = mongoose.model("AbonneTransaction", abonneTransactionSchema);

export default AbonneTransaction;
