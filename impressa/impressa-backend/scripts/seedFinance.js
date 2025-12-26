import mongoose from "mongoose";
import dotenv from "dotenv";
import Account from "../models/Account.js";

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const systemAccounts = [
    {
        code: "1001",
        name: "Cash / Bank",
        type: "Asset",
        description: "Main operating bank account"
    },
    {
        code: "1100",
        name: "Payment Gateway Receivable",
        type: "Asset",
        description: "Funds held by Stripe/PayPal before payout"
    },
    {
        code: "2001",
        name: "Seller Payable",
        type: "Liability",
        description: "Funds owed to sellers for their sales"
    },
    {
        code: "4001",
        name: "Commission Revenue",
        type: "Revenue",
        description: "Platform commission earnings"
    },
    {
        code: "5001",
        name: "Platform Expenses",
        type: "Expense",
        description: "General platform operating expenses"
    }
];

const seedFinance = async () => {
    try {
        await connectDB();

        console.log("Seeding System Accounts...");

        for (const account of systemAccounts) {
            const exists = await Account.findOne({ code: account.code });
            if (!exists) {
                await Account.create(account);
                console.log(`Created account: ${account.code} - ${account.name}`);
            } else {
                console.log(`Account exists: ${account.code} - ${account.name}`);
            }
        }

        console.log("Finance seeding completed.");
        process.exit();
    } catch (error) {
        console.error("Error seeding finance:", error);
        process.exit(1);
    }
};

seedFinance();
