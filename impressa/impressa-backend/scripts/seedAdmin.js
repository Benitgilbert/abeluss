import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const adminEmail = "byiringirobenitg@gmail.com";
        const adminPassword = "admin123";

        // Check if admin exists
        let admin = await User.findOne({ email: adminEmail });

        if (admin) {
            console.log("Admin user found. Updating password...");
            admin.password = adminPassword; // Pre-save hook will hash this
            admin.role = "admin"; // Ensure role is admin
            await admin.save();
            console.log("✅ Admin password updated successfully.");
        } else {
            console.log("Admin user not found. Creating new admin...");
            admin = new User({
                name: "Admin User",
                email: adminEmail,
                password: adminPassword,
                role: "admin",
                isVerified: true
            });
            await admin.save();
            console.log("✅ Admin user created successfully.");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();
