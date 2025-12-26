import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { processPayment, checkPaymentStatus, handleMomoWebhook } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/process", verifyToken, processPayment);
router.get("/status/:orderId", verifyToken, checkPaymentStatus);
router.post("/webhook/momo", handleMomoWebhook); // Public endpoint for MTN

export default router;
