import express from "express";
import {
  getDashboardAnalytics,
  getForecast,
  getProductRecommendations,
  getAnomalies,
  handleChatbotQueryLLM // ✅ use only this
} from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/analytics", authMiddleware(["admin", "seller", "cashier"]), getDashboardAnalytics);
router.get("/forecast", authMiddleware(["admin", "seller", "cashier"]), getForecast);
router.get("/recommendations", authMiddleware(["admin", "seller", "cashier"]), getProductRecommendations);
router.get("/anomalies", authMiddleware(["admin", "seller", "cashier"]), getAnomalies);

router.post("/chatbot", authMiddleware(["admin", "seller"]), handleChatbotQueryLLM); // ✅ single chatbot route

export default router;