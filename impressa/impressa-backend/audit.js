import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';

dotenv.config();

async function audit() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({}, 'name visibility approvalStatus');
        console.log(`Total Products: ${products.length}`);
        products.forEach(p => {
            console.log(`- ${p.name} | Visibility: ${p.visibility} | Status: ${p.approvalStatus}`);
        });

        // Explicitly hide any product containing "Gift Card"
        const hideRes = await Product.updateMany(
            { name: /Gift Card/i },
            { $set: { visibility: 'hidden' } }
        );
        console.log('Final Hide Attempt Result:', JSON.stringify(hideRes));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

audit();
