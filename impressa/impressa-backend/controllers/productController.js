import Product from "../models/Product.js";

// Create product (admin only)
export const createProduct = async (req, res) => {
  try {
    const body = { ...req.body };
    // Coerce booleans and arrays if coming from multipart/form-data
    if (typeof body.customizable === "string") body.customizable = body.customizable === "true";
    if (typeof body.customizationOptions === "string") {
      try { body.customizationOptions = JSON.parse(body.customizationOptions); } catch { body.customizationOptions = []; }
    }
    if (typeof body.featured === "string") body.featured = body.featured === "true";
    if (typeof body.tags === "string") {
      try { body.tags = JSON.parse(body.tags); } catch { body.tags = []; }
    }
    if (req.file) {
      body.image = `/uploads/${req.file.filename}`;
    }
    if (typeof body.price === "string") body.price = Number(body.price);
    if (typeof body.stock === "string") body.stock = Number(body.stock);
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
    const limit = Math.min(parseInt(req.query.limit)||0, 100) || undefined;
    const sort = req.query.sort || undefined;
    let cursor = Product.find(q);
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
    const limit = Math.min(parseInt(req.query.limit)||8, 50);
    const products = await Product.find({ featured: true }).sort({ createdAt: -1 }).limit(limit);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductsByIds = async (req, res) => {
  try {
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (!ids.length) return res.json([]);
    const products = await Product.find({ _id: { $in: ids } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTrendingProducts = async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days)||30, 180);
    const since = new Date(Date.now() - days*24*60*60*1000);
    // aggregate orders to find top products
    const Order = (await import('../models/Order.js')).default;
    const top = await Order.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$product", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: Math.min(parseInt(req.query.limit)||8, 50) },
    ]);
    const ids = top.map(t => t._id).filter(Boolean);
    const products = await Product.find({ _id: { $in: ids } });
    // maintain ranking order
    const map = new Map(products.map(p => [String(p._id), p]));
    const ordered = ids.map(id => map.get(String(id))).filter(Boolean);
    res.json(ordered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product (admin only)
export const updateProduct = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.customizable === "string") body.customizable = body.customizable === "true";
    if (typeof body.customizationOptions === "string") {
      try { body.customizationOptions = JSON.parse(body.customizationOptions); } catch { body.customizationOptions = []; }
    }
    if (typeof body.featured === "string") body.featured = body.featured === "true";
    if (typeof body.tags === "string") {
      try { body.tags = JSON.parse(body.tags); } catch { body.tags = []; }
    }
    if (req.file) {
      body.image = `/uploads/${req.file.filename}`;
    }
    if (typeof body.price === "string") body.price = Number(body.price);
    if (typeof body.stock === "string") body.stock = Number(body.stock);
    const product = await Product.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};