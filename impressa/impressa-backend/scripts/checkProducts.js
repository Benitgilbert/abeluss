
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log('Connected to MongoDB');
        const count = await Product.countDocuments();
        console.log(`There are ${count} products in the database.`);
        const products = await Product.find().limit(5);
        console.log('First 5 products:', JSON.stringify(products, null, 2));
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
        process.exit(1);
    });
