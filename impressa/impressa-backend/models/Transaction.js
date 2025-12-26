import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true
    },
    debit: {
        type: Number,
        default: 0,
        min: 0
    },
    credit: {
        type: Number,
        default: 0,
        min: 0
    }
}, { _id: false });

const transactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    },
    reference: {
        type: String, // e.g., "Order #12345"
        index: true
    },
    type: {
        type: String,
        enum: ["Journal", "Sales", "Expense", "Payment", "Transfer"],
        default: "Journal"
    },
    entries: {
        type: [entrySchema],
        validate: [
            function (entries) {
                if (!entries || entries.length < 2) return false;
                const totalDebit = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
                const totalCredit = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
                // Allow for small floating point errors
                return Math.abs(totalDebit - totalCredit) < 0.01;
            },
            "Total Debits must equal Total Credits"
        ]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
