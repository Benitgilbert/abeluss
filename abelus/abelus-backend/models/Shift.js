import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["open", "closed"],
            default: "open",
        },
        startTime: {
            type: Date,
            default: Date.now,
        },
        endTime: {
            type: Date,
        },
        startingDrawerAmount: {
            type: Number,
            required: true,
        },
        expectedEndingDrawerAmount: {
            type: Number,
            default: function () {
                return this.startingDrawerAmount;
            },
        },
        actualEndingDrawerAmount: {
            type: Number,
        },
        totalCashSales: {
            type: Number,
            default: 0,
        },
        totalMomoSales: {
            type: Number,
            default: 0,
        },
        totalOtherSales: {
            type: Number,
            default: 0,
        },
        orders: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
            },
        ],
        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

const Shift = mongoose.model("Shift", shiftSchema);

export default Shift;
