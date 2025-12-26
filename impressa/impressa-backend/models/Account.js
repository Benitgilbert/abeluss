import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ["Asset", "Liability", "Equity", "Revenue", "Expense"]
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    balance: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Account = mongoose.model("Account", accountSchema);

export default Account;
