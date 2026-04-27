import express from "express";
import { verifyToken, optionalAuth } from "../middleware/authMiddleware.js";
import { processPayment, checkPaymentStatus, handleMomoWebhook } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/process", optionalAuth, processPayment);
router.get("/status/:orderId", optionalAuth, checkPaymentStatus);
router.post("/webhook/momo", handleMomoWebhook); // Public endpoint for MTN

export default router;
