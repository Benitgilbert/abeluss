
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected.');
        try {
            const count = await Product.countDocuments({});
            console.log(`Total Products: ${count}`);
            if (count > 0) {
                const p = await Product.findOne({});
                console.log('Sample Product:', JSON.stringify(p.toObject(), null, 2));
            } else {
                console.log('No products found in DB.');
            }
        } catch (e) {
            console.error(e);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
