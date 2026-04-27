import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const MOMO_API_URL = process.env.MOMO_API_URL || "https://sandbox.momodeveloper.mtn.com";
const MOMO_SUBSCRIPTION_KEY = process.env.MOMO_SUBSCRIPTION_KEY;
const MOMO_API_USER = process.env.MOMO_API_USER;
const MOMO_API_KEY = process.env.MOMO_API_KEY;
const MOMO_CALLBACK_URL = process.env.MOMO_CALLBACK_URL || "http://localhost:5000/api/payments/webhook/momo";

// Create axios instance
const momoClient = axios.create({
    baseURL: MOMO_API_URL,
    headers: {
        "Ocp-Apim-Subscription-Key": MOMO_SUBSCRIPTION_KEY,
        "X-Target-Environment": process.env.MOMO_ENV || "sandbox",
    },
});

let cachedToken = null;
let tokenExpiry = null;

// Get Access Token
export const getMomoToken = async () => {
    if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
        return cachedToken;
    }

    try {
        console.log("🔄 Fetching MoMo Token...");
        console.log("   User:", MOMO_API_USER);
        // console.log("   Key:", MOMO_API_KEY); // Hide sensitive key

        const authString = Buffer.from(`${MOMO_API_USER}:${MOMO_API_KEY}`).toString("base64");

        const response = await momoClient.post(
            "/collection/token/",
            {},
            {
                headers: {
                    Authorization: `Basic ${authString}`,
                },
            }
        );

        console.log("✅ MoMo Token Fetched Successfully!");
        cachedToken = response.data.access_token;
        const expiresIn = response.data.expires_in || 3600;
        tokenExpiry = new Date(new Date().getTime() + (expiresIn - 60) * 1000);

        return cachedToken;
    } catch (error) {
        console.error("❌ Error fetching MoMo token:");
        console.error("   Status:", error.response?.status);
        console.error("   Data:", JSON.stringify(error.response?.data, null, 2));
        console.error("   Message:", error.message);
        throw new Error("Failed to authenticate with MTN MoMo");
    }
};

// Request to Pay (Collections)
export const requestToPay = async ({ amount, currency = "RWF", phone, orderId }) => {
    try {
        console.log(`🚀 Initiating RequestToPay for Order #${orderId} - Amount: ${amount} ${currency} - Phone: ${phone}`);

        const token = await getMomoToken();
        const referenceId = uuidv4();

        const payload = {
            amount: amount.toString(),
            currency,
            externalId: orderId.toString(),
            payer: {
                partyIdType: "MSISDN",
                partyId: phone,
            },
            payerMessage: `Payment for Order #${orderId}`,
            payeeNote: "Abelus Payment",
        };

        console.log("   Payload:", JSON.stringify(payload, null, 2));

        const response = await momoClient.post("/collection/v1_0/requesttopay", payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Reference-Id": referenceId,
                "X-Callback-Url": MOMO_CALLBACK_URL,
            },
        });

        console.log("✅ Payment Request Sent! Status:", response.status);
        console.log("   Reference ID:", referenceId);

        return {
            success: true,
            referenceId,
            status: "PENDING",
            message: "Payment request sent to user's phone",
        };
    } catch (error) {
        console.error("❌ Error requesting payment:");
        console.error("   Status:", error.response?.status);
        console.error("   Data:", JSON.stringify(error.response?.data, null, 2));
        console.error("   Message:", error.message);
        throw new Error("Failed to initiate MoMo payment: " + (error.response?.data?.message || error.message));
    }
};

// Get Transaction Status
export const getTransactionStatus = async (referenceId) => {
    try {
        const token = await getMomoToken();

        const response = await momoClient.get(`/collection/v1_0/requesttopay/${referenceId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data; // Returns { status: "SUCCESSFUL" | "FAILED" | "PENDING", ... }
    } catch (error) {
        console.error("Error checking status:", error.response?.data || error.message);
        throw new Error("Failed to check payment status");
    }
};
