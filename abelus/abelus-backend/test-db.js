import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("Testing MongoDB Connection...");
console.log("URI:", process.env.MONGO_URI ? "Defined" : "Undefined");

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Successfully connected to MongoDB!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Connection failed:", err.message);
        if (err.cause) console.error("Cause:", err.cause);
        process.exit(1);
    });
