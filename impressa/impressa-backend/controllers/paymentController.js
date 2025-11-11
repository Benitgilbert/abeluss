import mtnMomoService from "../services/mtnMomoService.js";
import Order from "../models/Order.js";
import logger from "../config/logger.js";

/**
 * Initiate MTN MoMo payment for an order
 * 
 * POST /api/payments/mtn/initiate
 * Body: { orderId, phoneNumber }
 */
export const initiatePayment = async (req, res, next) => {
  try {
    const { orderId, phoneNumber } = req.body;

    // Validate inputs
    if (!orderId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Order ID and phone number are required",
      });
    }

    // Find order
    const order = await Order.findOne({ publicId: orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order is already paid
    if (order.payment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Order has already been paid",
      });
    }

    // Check if there's already a pending payment for this order
    if (order.payment.status === "pending" && order.payment.transactionId) {
      return res.status(400).json({
        success: false,
        message: "A payment is already pending for this order",
        transactionId: order.payment.transactionId,
      });
    }

    // Format phone number if needed (ensure no spaces, dashes, etc.)
    const formattedPhone = phoneNumber.replace(/[\s\-()]/g, "");

    // Validate phone number format (Rwanda: 250XXXXXXXXX)
    if (!formattedPhone.match(/^250\d{9}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format. Use format: 250XXXXXXXXX",
      });
    }

    // Initiate payment with MTN MoMo
    const paymentResult = await mtnMomoService.requestToPay({
      amount: order.totals.grandTotal,
      currency: "RWF",
      phoneNumber: formattedPhone,
      externalId: order.publicId,
      payerMessage: `Payment for order ${order.publicId}`,
      payeeNote: `Order ${order.publicId} - ${order.items.length} item(s)`,
    });

    // Update order with payment information
    order.payment.method = "mtn_momo";
    order.payment.status = "pending";
    order.payment.transactionId = paymentResult.referenceId;
    
    await order.save();

    logger.info({
      orderId: order.publicId,
      transactionId: paymentResult.referenceId,
    }, "MTN MoMo payment initiated");

    res.status(200).json({
      success: true,
      message: "Payment initiated successfully. Please check your phone to complete the payment.",
      data: {
        orderId: order.publicId,
        transactionId: paymentResult.referenceId,
        amount: order.totals.grandTotal,
        currency: "RWF",
        status: "PENDING",
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Payment initiation failed");
    next(error);
  }
};

/**
 * Check payment status
 * 
 * GET /api/payments/mtn/status/:orderId
 */
export const checkPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Find order
    const order = await Order.findOne({ publicId: orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // If no transaction ID, payment not initiated
    if (!order.payment.transactionId) {
      return res.status(400).json({
        success: false,
        message: "No payment has been initiated for this order",
      });
    }

    // If already completed, return cached status
    if (order.payment.status === "completed") {
      return res.status(200).json({
        success: true,
        data: {
          orderId: order.publicId,
          transactionId: order.payment.transactionId,
          status: "SUCCESSFUL",
          amount: order.totals.grandTotal,
          currency: "RWF",
          paidAt: order.payment.paidAt,
        },
      });
    }

    // Check status from MTN MoMo
    const transactionStatus = await mtnMomoService.getTransactionStatus(
      order.payment.transactionId
    );

    // Update order based on status
    if (transactionStatus.status === "SUCCESSFUL") {
      order.payment.status = "completed";
      order.payment.paidAt = new Date();
      order.status = "processing"; // Move order to processing
      await order.save();

      logger.info({
        orderId: order.publicId,
        transactionId: order.payment.transactionId,
      }, "Payment successful");
    } else if (transactionStatus.status === "FAILED") {
      order.payment.status = "failed";
      await order.save();

      logger.warn({
        orderId: order.publicId,
        transactionId: order.payment.transactionId,
        reason: transactionStatus.reason,
      }, "Payment failed");
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order.publicId,
        transactionId: order.payment.transactionId,
        status: transactionStatus.status,
        amount: transactionStatus.amount,
        currency: transactionStatus.currency,
        reason: transactionStatus.reason,
        paidAt: order.payment.paidAt,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to check payment status");
    next(error);
  }
};

/**
 * Handle MTN MoMo webhook callback
 * 
 * POST /api/payments/mtn/webhook
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const webhookData = req.body;

    logger.info({ webhookData }, "Received MTN MoMo webhook");

    // Validate webhook (basic validation)
    if (!mtnMomoService.validateWebhook(req.headers, webhookData)) {
      return res.status(401).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    // Extract data from webhook
    const { referenceId, externalId, status } = webhookData;

    // Find order by publicId (externalId)
    const order = await Order.findOne({ publicId: externalId });

    if (!order) {
      logger.warn({ externalId }, "Order not found for webhook");
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order based on payment status
    if (status === "SUCCESSFUL") {
      order.payment.status = "completed";
      order.payment.paidAt = new Date();
      order.status = "processing";
      
      await order.save();

      logger.info({
        orderId: order.publicId,
        transactionId: referenceId,
      }, "Payment completed via webhook");
    } else if (status === "FAILED") {
      order.payment.status = "failed";
      
      await order.save();

      logger.warn({
        orderId: order.publicId,
        transactionId: referenceId,
      }, "Payment failed via webhook");
    }

    // Always return 200 to acknowledge webhook receipt
    res.status(200).json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    logger.error({ err: error }, "Webhook processing failed");
    
    // Still return 200 to prevent webhook retries
    res.status(200).json({
      success: false,
      message: "Webhook processing error",
    });
  }
};

/**
 * Verify MTN MoMo account holder
 * 
 * POST /api/payments/mtn/verify-account
 * Body: { phoneNumber }
 */
export const verifyAccountHolder = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Format phone number
    const formattedPhone = phoneNumber.replace(/[\s\-()]/g, "");

    // Validate phone number format
    if (!formattedPhone.match(/^250\d{9}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format. Use format: 250XXXXXXXXX",
      });
    }

    // Verify account with MTN MoMo
    const verification = await mtnMomoService.validateAccountHolder(formattedPhone);

    res.status(200).json({
      success: true,
      data: {
        phoneNumber: formattedPhone,
        isActive: verification.isActive,
        canReceivePayments: verification.isActive,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Account verification failed");
    next(error);
  }
};

/**
 * Get account balance (admin only)
 * 
 * GET /api/payments/mtn/balance
 */
export const getBalance = async (req, res, next) => {
  try {
    const balance = await mtnMomoService.getAccountBalance();

    res.status(200).json({
      success: true,
      data: balance,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to get balance");
    next(error);
  }
};
