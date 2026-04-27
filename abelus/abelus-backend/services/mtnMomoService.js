import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import logger from "../config/logger.js";

/**
 * MTN Mobile Money (MoMo) Payment Service
 * 
 * API Documentation: https://momodeveloper.mtn.com/
 * 
 * Environment Variables Required:
 * - MTN_MOMO_ENVIRONMENT: sandbox | production
 * - MTN_MOMO_BASE_URL: API base URL
 * - MTN_MOMO_SUBSCRIPTION_KEY: Primary or secondary key
 * - MTN_MOMO_API_USER: API user ID (UUID)
 * - MTN_MOMO_API_KEY: API key for authentication
 * - MTN_MOMO_CALLBACK_URL: Your webhook URL for payment notifications
 */

class MTNMoMoService {
  constructor() {
    this.environment = process.env.MTN_MOMO_ENVIRONMENT || "sandbox";
    this.baseURL = process.env.MTN_MOMO_BASE_URL || "https://sandbox.momodeveloper.mtn.com";
    this.subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
    this.apiUser = process.env.MTN_MOMO_API_USER;
    this.apiKey = process.env.MTN_MOMO_API_KEY;
    this.callbackUrl = process.env.MTN_MOMO_CALLBACK_URL;
    
    // Collections API endpoint
    this.collectionsBaseURL = `${this.baseURL}/collection`;
    
    // Token cache
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get OAuth access token
   */
  async getAccessToken() {
    try {
      // Return cached token if still valid
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      // Generate Basic Auth token
      const authString = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString("base64");

      const response = await axios.post(
        `${this.collectionsBaseURL}/token/`,
        {},
        {
          headers: {
            "Authorization": `Basic ${authString}`,
            "Ocp-Apim-Subscription-Key": this.subscriptionKey,
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Token expires in 1 hour, refresh 5 minutes before
      this.tokenExpiry = Date.now() + (55 * 60 * 1000);

      logger.info("MTN MoMo access token obtained");
      return this.accessToken;
    } catch (error) {
      logger.error({ err: error }, "Failed to get MTN MoMo access token");
      throw new Error("Failed to authenticate with MTN MoMo");
    }
  }

  /**
   * Request to Pay - Initiate payment from customer
   * 
   * @param {Object} paymentData
   * @param {string} paymentData.amount - Amount to charge
   * @param {string} paymentData.currency - Currency code (RWF, UGX, etc.)
   * @param {string} paymentData.phoneNumber - Customer phone number (format: 256XXXXXXXXX)
   * @param {string} paymentData.externalId - Your order/transaction ID
   * @param {string} paymentData.payerMessage - Message to show customer
   * @param {string} paymentData.payeeNote - Internal note
   */
  async requestToPay(paymentData) {
    try {
      const {
        amount,
        currency = "RWF",
        phoneNumber,
        externalId,
        payerMessage = "Payment for order",
        payeeNote = "Order payment",
      } = paymentData;

      // Validate inputs
      if (!amount || !phoneNumber || !externalId) {
        throw new Error("Missing required payment parameters");
      }

      // Generate unique transaction reference
      const referenceId = uuidv4();

      // Get access token
      const token = await this.getAccessToken();

      // Prepare request body
      const requestBody = {
        amount: amount.toString(),
        currency,
        externalId,
        payer: {
          partyIdType: "MSISDN",
          partyId: phoneNumber,
        },
        payerMessage,
        payeeNote,
      };

      logger.info({ referenceId, externalId, amount }, "Initiating MTN MoMo payment");

      // Make request to pay
      const response = await axios.post(
        `${this.collectionsBaseURL}/v1_0/requesttopay`,
        requestBody,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "X-Reference-Id": referenceId,
            "X-Target-Environment": this.environment,
            "Ocp-Apim-Subscription-Key": this.subscriptionKey,
            "Content-Type": "application/json",
          },
        }
      );

      // Request to Pay returns 202 Accepted on success
      if (response.status === 202) {
        return {
          success: true,
          referenceId,
          externalId,
          status: "PENDING",
          message: "Payment request sent successfully",
        };
      }

      throw new Error("Unexpected response from MTN MoMo");
    } catch (error) {
      logger.error({ err: error }, "MTN MoMo payment request failed");
      
      if (error.response) {
        throw new Error(error.response.data?.message || "Payment request failed");
      }
      
      throw error;
    }
  }

  /**
   * Get payment status
   * 
   * @param {string} referenceId - Transaction reference ID
   */
  async getTransactionStatus(referenceId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.collectionsBaseURL}/v1_0/requesttopay/${referenceId}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "X-Target-Environment": this.environment,
            "Ocp-Apim-Subscription-Key": this.subscriptionKey,
          },
        }
      );

      const data = response.data;

      return {
        referenceId: data.financialTransactionId,
        externalId: data.externalId,
        amount: data.amount,
        currency: data.currency,
        status: data.status, // PENDING, SUCCESSFUL, FAILED
        reason: data.reason,
        payerMessage: data.payerMessage,
        payeeNote: data.payeeNote,
      };
    } catch (error) {
      logger.error({ err: error, referenceId }, "Failed to get transaction status");
      
      if (error.response?.status === 404) {
        throw new Error("Transaction not found");
      }
      
      throw new Error("Failed to fetch transaction status");
    }
  }

  /**
   * Validate webhook callback
   * 
   * @param {Object} headers - Request headers
   * @param {Object} body - Request body
   */
  validateWebhook(headers, body) {
    // MTN MoMo doesn't use signature validation in sandbox
    // In production, you should validate the callback origin
    
    if (this.environment === "production") {
      // Add your webhook validation logic here
      // Check IP whitelist, validate signature, etc.
    }

    return true;
  }

  /**
   * Check account balance (for admin/monitoring)
   */
  async getAccountBalance() {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.collectionsBaseURL}/v1_0/account/balance`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "X-Target-Environment": this.environment,
            "Ocp-Apim-Subscription-Key": this.subscriptionKey,
          },
        }
      );

      return {
        availableBalance: response.data.availableBalance,
        currency: response.data.currency,
      };
    } catch (error) {
      logger.error({ err: error }, "Failed to get account balance");
      throw new Error("Failed to fetch account balance");
    }
  }

  /**
   * Check if account is active
   */
  async validateAccountHolder(phoneNumber) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.collectionsBaseURL}/v1_0/accountholder/msisdn/${phoneNumber}/active`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "X-Target-Environment": this.environment,
            "Ocp-Apim-Subscription-Key": this.subscriptionKey,
          },
        }
      );

      return {
        isActive: response.data.result === true,
        phoneNumber,
      };
    } catch (error) {
      logger.error({ err: error, phoneNumber }, "Failed to validate account holder");
      return {
        isActive: false,
        phoneNumber,
      };
    }
  }
}

// Export singleton instance
const mtnMomoService = new MTNMoMoService();
export default mtnMomoService;
