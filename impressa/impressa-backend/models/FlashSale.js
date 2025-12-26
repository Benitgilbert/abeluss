import mongoose from "mongoose";

const flashSaleProductSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    flashSalePrice: {
        type: Number,
        required: [true, "Flash sale price is required"],
        min: [0, "Price cannot be negative"]
    },
    stockLimit: {
        type: Number,
        default: null, // null means unlimited
        min: [0, "Stock limit cannot be negative"]
    },
    soldCount: {
        type: Number,
        default: 0,
        min: 0
    }
});

const flashSaleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Flash sale name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"]
        },
        description: {
            type: String,
            maxlength: [500, "Description cannot exceed 500 characters"]
        },
        startDate: {
            type: Date,
            required: [true, "Start date is required"]
        },
        endDate: {
            type: Date,
            required: [true, "End date is required"]
        },
        products: [flashSaleProductSchema],
        isActive: {
            type: Boolean,
            default: true
        },
        bannerImage: {
            type: String,
            default: null
        },
        bannerColor: {
            type: String,
            default: "from-red-500 to-orange-500" // Tailwind gradient
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual to check if sale is currently active
flashSaleSchema.virtual("isCurrentlyActive").get(function () {
    const now = new Date();
    return this.isActive && now >= this.startDate && now <= this.endDate;
});

// Virtual to get sale status
flashSaleSchema.virtual("status").get(function () {
    const now = new Date();
    if (!this.isActive) return "inactive";
    if (now < this.startDate) return "upcoming";
    if (now > this.endDate) return "ended";
    return "active";
});

// Virtual for time remaining (in milliseconds)
flashSaleSchema.virtual("timeRemaining").get(function () {
    const now = new Date();
    if (now > this.endDate) return 0;
    if (now < this.startDate) return this.endDate - this.startDate;
    return this.endDate - now;
});

// Validate end date is after start date
flashSaleSchema.pre("save", function (next) {
    if (this.endDate <= this.startDate) {
        const error = new Error("End date must be after start date");
        error.statusCode = 400;
        return next(error);
    }
    next();
});

// Static method to get currently active flash sales
flashSaleSchema.statics.getActiveSales = async function () {
    const now = new Date();
    return this.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
    }).populate("products.product");
};

// Static method to get upcoming flash sales
flashSaleSchema.statics.getUpcomingSales = async function () {
    const now = new Date();
    return this.find({
        isActive: true,
        startDate: { $gt: now }
    }).populate("products.product");
};

// Instance method to check if a product is available
flashSaleSchema.methods.isProductAvailable = function (productId) {
    const saleProduct = this.products.find(
        (p) => p.product.toString() === productId.toString()
    );
    if (!saleProduct) return false;
    if (saleProduct.stockLimit === null) return true;
    return saleProduct.soldCount < saleProduct.stockLimit;
};

// Instance method to increment sold count
flashSaleSchema.methods.incrementSoldCount = async function (productId, quantity = 1) {
    const saleProduct = this.products.find(
        (p) => p.product.toString() === productId.toString()
    );
    if (saleProduct) {
        saleProduct.soldCount += quantity;
        await this.save();
    }
};

// Indexes
flashSaleSchema.index({ startDate: 1, endDate: 1 });
flashSaleSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

const FlashSale = mongoose.model("FlashSale", flashSaleSchema);

export default FlashSale;
