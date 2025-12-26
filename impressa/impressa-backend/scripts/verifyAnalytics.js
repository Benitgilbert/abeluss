import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { getTopProducts, getCustomizationDemand } from '../controllers/analyticsController.js';

dotenv.config();

const verifyAnalytics = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find or Create Seller
        let seller = await User.findOne({ role: "seller" });
        if (!seller) {
            // Create a dummy seller if none exists
            seller = await User.create({
                name: "Test Seller " + Date.now(),
                email: `seller_${Date.now()}@example.com`,
                password: "password123",
                role: "seller"
            });
            console.log('✅ Created test seller');
        }

        // 2. Create a dummy product
        let product = await Product.findOne({ name: "Analytics Test Product" });
        // Cleanup old test product if needed to avoid dupes or use it
        if (!product) {
            product = await Product.create({
                name: "Analytics Test Product",
                price: 100,
                costPrice: 50,
                stock: 100,
                slug: "analytics-test-product-" + Date.now(),
                description: "Test description for analytics",
                category: new mongoose.Types.ObjectId(), // Fake category ID
                seller: seller._id, // REQUIRED FIELD
                images: ["placeholder.jpg"]
            });
            console.log('✅ Created test product');
        }

        // 3. Create a dummy order with customization
        const order = await Order.create({
            publicId: `TEST-${Date.now()}`,
            items: [{
                product: product._id,
                productName: product.name,
                quantity: 5,
                price: 100,
                cost: 50,
                subtotal: 500,
                customizations: {
                    customText: "Happy Birthday",
                    customFile: "image.png"
                }
            }],
            totals: {
                grandTotal: 500
            },
            status: "delivered" // MUST BE DELIVERED or not cancelled
        });
        console.log('✅ Created test order with customizations');

        // 4. Test getCustomizationDemand logic
        const mockRes = {
            json: (data) => console.log('📊 Customization Demand Result:', JSON.stringify(data, null, 2)),
            status: (code) => ({ json: (data) => console.log(`❌ Error ${code}:`, data) })
        };

        console.log('Testing getCustomizationDemand...');
        await getCustomizationDemand({}, mockRes);

        // 5. Test getTopProducts logic
        console.log('Testing getTopProducts...');
        await getTopProducts({}, mockRes);

    } catch (err) {
        console.error('❌ Verification failed:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

verifyAnalytics();
