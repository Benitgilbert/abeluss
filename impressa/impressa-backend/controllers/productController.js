import Product from "../models/Product.js";

// Create product (seller only)
export const createProduct = async (req, res) => {
  try {
    const body = { ...req.body };

    // Assign seller from authenticated user
    body.seller = req.user.id;

    // Auto-approve if created by admin
    if (req.user.role === 'admin') {
      body.approvalStatus = 'approved';
      body.visibility = 'public';
    }

    // Parse JSON fields
    ["customizationOptions", "tags", "attributes", "variations", "crossSells", "upSells"].forEach(field => {
      if (typeof body[field] === "string") {
        try { body[field] = JSON.parse(body[field]); } catch { body[field] = []; }
      }
    });

    // Coerce booleans and numbers
    if (typeof body.customizable === "string") body.customizable = body.customizable === "true";
    if (typeof body.featured === "string") body.featured = body.featured === "true";
    if (typeof body.isDigital === "string") body.isDigital = body.isDigital === "true";
    if (typeof body.price === "string") body.price = Number(body.price);
    if (typeof body.stock === "string") body.stock = Number(body.stock);

    // Handle File Uploads
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === "image") {
          body.image = `/uploads/${file.filename}`;
        } else if (file.fieldname.startsWith("variation_image_")) {
          const index = parseInt(file.fieldname.split("_")[2]);
          if (body.variations && body.variations[index]) {
            body.variations[index].image = `/uploads/${file.filename}`;
          }
        }
      });
    }

    const product = new Product(body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all products (public)
export const getAllProducts = async (req, res) => {
  try {
    const q = {};
    if (typeof req.query.featured !== 'undefined') q.featured = req.query.featured === 'true';
    if (req.query.tags) q.tags = { $in: req.query.tags.split(',') };
    // Filter by seller (optional)
    if (req.query.seller) q.seller = req.query.seller;

    // Search
    if (req.query.search) {
      q.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Category
    if (req.query.category) {
      q.category = req.query.category;
    }

    // Price Range
    if (req.query.minPrice || req.query.maxPrice) {
      q.price = {};
      if (req.query.minPrice) q.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) q.price.$lte = Number(req.query.maxPrice);
    }

    const limit = Math.min(parseInt(req.query.limit) || 0, 100) || undefined;
    const sort = req.query.sort || undefined;

    let cursor = Product.find(q).populate("seller", "name storeName");
    if (sort) cursor = cursor.sort(sort);
    if (limit) cursor = cursor.limit(limit);

    const products = await cursor;
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 8, 50);
    const products = await Product.find({ featured: true })
      .populate("seller", "name storeName")
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductsByIds = async (req, res) => {
  try {
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (!ids.length) return res.json([]);
    const products = await Product.find({ _id: { $in: ids } })
      .populate("seller", "name storeName");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTrendingProducts = async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 30, 180);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    // aggregate orders to find top products
    const Order = (await import('../models/Order.js')).default;
    const top = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$product", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: Math.min(parseInt(req.query.limit) || 8, 50) },
    ]);
    const ids = top.map(t => t._id).filter(Boolean);
    const products = await Product.find({ _id: { $in: ids } })
      .populate("seller", "name storeName");
    // maintain ranking order
    const map = new Map(products.map(p => [String(p._id), p]));
    const ordered = ids.map(id => map.get(String(id))).filter(Boolean);

    if (ordered.length === 0) {
      const fallback = await Product.find({ featured: true })
        .populate("seller", "name storeName")
        .limit(5);
      if (fallback.length > 0) return res.json(fallback);

      const latest = await Product.find()
        .populate("seller", "name storeName")
        .sort({ createdAt: -1 })
        .limit(5);
      return res.json(latest);
    }

    res.json(ordered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("crossSells", "name price image slug")
      .populate("upSells", "name price image slug")
      .populate("seller", "name storeName storeDescription storeLogo sellerStatus");

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product (seller/admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Enforce ownership
    if (req.user.role !== 'admin' && product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied: You do not own this product" });
    }

    const body = { ...req.body };

    // Parse JSON fields
    ["customizationOptions", "tags", "attributes", "variations", "crossSells", "upSells"].forEach(field => {
      if (typeof body[field] === "string") {
        try { body[field] = JSON.parse(body[field]); } catch { body[field] = []; }
      }
    });

    // Coerce booleans and numbers
    if (typeof body.customizable === "string") body.customizable = body.customizable === "true";
    if (typeof body.featured === "string") body.featured = body.featured === "true";
    if (typeof body.isDigital === "string") body.isDigital = body.isDigital === "true";
    if (typeof body.price === "string") body.price = Number(body.price);
    if (typeof body.stock === "string") body.stock = Number(body.stock);

    // Handle File Uploads
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === "image") {
          body.image = `/uploads/${file.filename}`;
        } else if (file.fieldname.startsWith("variation_image_")) {
          const index = parseInt(file.fieldname.split("_")[2]);
          if (body.variations && body.variations[index]) {
            body.variations[index].image = `/uploads/${file.filename}`;
          }
        }
      });
    }

    Object.assign(product, body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete product (seller/admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Enforce ownership
    if (req.user.role !== 'admin' && product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied: You do not own this product" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get related products (same category or seller)
export const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const related = await Product.find({
      $and: [
        { _id: { $ne: product._id } },
        {
          $or: [
            { category: product.category },
            { seller: product.seller }
          ]
        }
      ]
    })
      .limit(4)
      .populate("seller", "name storeName");

    res.json(related);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};