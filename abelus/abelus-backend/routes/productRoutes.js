import express from "express";
import * as productController from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/suggestions", productController.getSuggestions);
router.get("/recommendations", productController.getProductRecommendations); // New Engine
router.get("/", productController.getAllProducts);
router.get("/featured/list", productController.getFeaturedProducts);
router.get("/trending", productController.getTrendingProducts);
router.get("/by-ids", productController.getProductsByIds);
router.get("/:id", productController.getProductById);
router.get("/:id/related", productController.getRelatedProducts);


// Seller/Staff routes
router.get("/seller/my-products", authMiddleware(["seller", "admin", "inventory"]), productController.getSellerProducts);

// Admin/Seller/Staff routes
router.post("/", authMiddleware(["admin", "seller", "inventory"]), upload.any(), productController.createProduct);
router.put("/:id", authMiddleware(["admin", "seller", "inventory"]), upload.any(), productController.updateProduct);
router.delete("/:id", authMiddleware(["admin", "seller", "inventory"]), productController.deleteProduct);

export default router;