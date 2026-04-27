import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const dropIndex = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected.");

        const collection = mongoose.connection.collection("products");
        const indexName = "variations.sku_1";

        console.log(`Dropping index: ${indexName}...`);
        try {
            await collection.dropIndex(indexName);
            console.log("Index dropped successfully.");
        } catch (e) {
            if (e.code === 27) {
                console.log("Index not found, skipping.");
            } else {
                console.error("Error dropping index:", e.message);
            }
        }

        console.log("Done.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

dropIndex();
