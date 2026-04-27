import express from "express";
import * as orderController from "../controllers/orderController.js";
import { authMiddleware, optionalAuth } from "../middleware/authMiddleware.js";
import { reportLimiter, analyticsLimiter } from "../middleware/rateLimiter.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Get all orders (admin)
router.get("/", authMiddleware(["admin"]), orderController.getOrders);

// Customer places an order (supports file upload)
router.post("/", authMiddleware(["customer"]), upload.single("customFile"), orderController.placeOrder);

// Create multi-item order (Cart Checkout)
router.post("/create", optionalAuth, orderController.createOrder); // Guests or Users

// Guest places an order (no auth)
router.post("/public", upload.single("customFile"), orderController.placeOrderGuest);

// Get my orders
router.get("/my-orders", authMiddleware(["customer", "admin"]), orderController.getMyOrders);

// Get Seller Orders
router.get("/seller", authMiddleware(["seller", "admin"]), orderController.getSellerOrders);

// Order Management (Detail, Status, Items, Notes)
router.get("/:id", authMiddleware(["admin", "seller"]), orderController.getOrderById);
router.put("/:id/status", authMiddleware(["admin", "seller"]), orderController.updateOrderStatus);
router.put("/:id/items", authMiddleware(["admin"]), orderController.updateOrderItems);
router.post("/:id/notes", authMiddleware(["admin", "seller"]), orderController.addOrderNote);

router.get("/report/logs", authMiddleware(["admin"]), reportLimiter, orderController.getReportLogs);
router.get("/analytics", authMiddleware(["admin"]), analyticsLimiter, orderController.getOrderAnalytics);

// Public order tracking
router.get("/track/:id", orderController.trackPublicOrder);

router.post("/report/logs/:id/view", authMiddleware(["admin"]), orderController.markReportViewed);
router.post("/report/logs/:id/download", authMiddleware(["admin"]), orderController.markReportDownloaded);

// POS Order (Admin only - for Abelus's own products)
router.post("/pos", authMiddleware(["admin"]), orderController.createPOSOrder);

// POS Order (Seller - for seller's own products)
router.post("/seller/pos", authMiddleware(["admin", "seller"]), orderController.createPOSOrder);

// Get seller's POS products (only their inventory)
router.get("/seller/pos-products", authMiddleware(["admin", "seller"]), orderController.getSellerPOSProducts);

// Get admin/Abelus's POS products (only company inventory)
router.get("/admin/pos-products", authMiddleware(["admin"]), orderController.getAdminPOSProducts);

// Get seller's orders
router.get("/seller/my-orders", authMiddleware(["admin", "seller"]), orderController.getSellerOrders);

// Barcode lookup for POS scanning
router.get("/pos/lookup", authMiddleware(["admin", "seller"]), orderController.lookupByBarcode);

export default router;