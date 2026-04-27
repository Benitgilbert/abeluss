import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

// Helper to update account balances
const updateBalances = async (entries) => {
    for (const entry of entries) {
        const account = await Account.findById(entry.account);
        if (!account) continue;

        // Asset/Expense: Debit increases, Credit decreases
        // Liability/Equity/Revenue: Credit increases, Debit decreases
        const isDebitNormal = ["Asset", "Expense"].includes(account.type);

        if (isDebitNormal) {
            account.balance += (entry.debit || 0) - (entry.credit || 0);
        } else {
            account.balance += (entry.credit || 0) - (entry.debit || 0);
        }
        await account.save();
    }
};

export const recordTransaction = async ({ date, description, reference, entries, type, createdBy }) => {
    const transaction = new Transaction({
        date: date || new Date(),
        description,
        reference,
        type: type || "Journal",
        entries,
        createdBy
    });

    await transaction.save();
    await updateBalances(entries);
    return transaction;
};

export const createTransaction = async (req, res) => {
    try {
        const transaction = await recordTransaction({
            ...req.body,
            createdBy: req.user?._id
        });
        res.status(201).json(transaction);
    } catch (err) {
        console.error("Create transaction failed:", err);
        res.status(500).json({ message: err.message || "Failed to create transaction." });
    }
};

export const getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find().sort({ code: 1 });
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ message: "Failed to load accounts." });
    }
};

export const createAccount = async (req, res) => {
    try {
        const account = new Account(req.body);
        await account.save();
        res.status(201).json(account);
    } catch (err) {
        res.status(500).json({ message: "Failed to create account." });
    }
};

export const getLedger = async (req, res) => {
    try {
        const { accountId } = req.params;
        const transactions = await Transaction.find({ "entries.account": accountId })
            .sort({ date: -1 })
            .populate("entries.account", "name code");

        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: "Failed to load ledger." });
    }
};

export const getFinancialSummary = async (req, res) => {
    try {
        const accounts = await Account.find();

        const summary = {
            assets: 0,
            liabilities: 0,
            equity: 0,
            revenue: 0,
            expenses: 0,
            netIncome: 0
        };

        accounts.forEach(acc => {
            const balance = acc.balance || 0;
            switch (acc.type) {
                case "Asset": summary.assets += balance; break;
                case "Liability": summary.liabilities += balance; break;
                case "Equity": summary.equity += balance; break;
                case "Revenue": summary.revenue += balance; break;
                case "Expense": summary.expenses += balance; break;
            }
        });

        summary.netIncome = summary.revenue - summary.expenses;

        res.json(summary);
    } catch (err) {
        res.status(500).json({ message: "Failed to load financial summary." });
    }
};
