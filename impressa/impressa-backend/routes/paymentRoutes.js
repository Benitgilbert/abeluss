import express from "express";
import {
  initiatePayment,
  checkPaymentStatus,
  handleWebhook,
  verifyAccountHolder,
  getBalance,
} from "../controllers/paymentController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes

/**
 * @route   POST /api/payments/mtn/initiate
 * @desc    Initiate MTN MoMo payment for an order
 * @access  Public (but requires valid orderId)
 * @body    { orderId: string, phoneNumber: string }
 */
router.post("/mtn/initiate", initiatePayment);

/**
 * @route   GET /api/payments/mtn/status/:orderId
 * @desc    Check payment status for an order
 * @access  Public (but requires valid orderId)
 */
router.get("/mtn/status/:orderId", checkPaymentStatus);

/**
 * @route   POST /api/payments/mtn/webhook
 * @desc    Handle MTN MoMo webhook callbacks
 * @access  Public (webhook endpoint - validated internally)
 */
router.post("/mtn/webhook", handleWebhook);

/**
 * @route   POST /api/payments/mtn/verify-account
 * @desc    Verify if phone number has active MTN MoMo account
 * @access  Public
 * @body    { phoneNumber: string }
 */
router.post("/mtn/verify-account", verifyAccountHolder);

// Admin routes

/**
 * @route   GET /api/payments/mtn/balance
 * @desc    Get MTN MoMo account balance
 * @access  Admin only
 */
router.get("/mtn/balance", verifyToken, verifyAdmin, getBalance);

export default router;
