import express from "express";
import * as productController from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", productController.getAllProducts);
router.get("/featured/list", productController.getFeaturedProducts);
router.get("/trending", productController.getTrendingProducts);
router.get("/by-ids", productController.getProductsByIds);
router.get("/:id", productController.getProductById);
router.get("/:id/related", productController.getRelatedProducts);

// Admin-only routes
router.post("/", authMiddleware(["admin"]), upload.any(), productController.createProduct);
router.put("/:id", authMiddleware(["admin"]), upload.any(), productController.updateProduct);
router.delete("/:id", authMiddleware(["admin"]), productController.deleteProduct);

export default router;