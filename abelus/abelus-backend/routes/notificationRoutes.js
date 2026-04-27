import express from "express";
import {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
} from "../controllers/notificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication (any role)
router.get("/", authMiddleware(["customer", "seller", "admin"]), getMyNotifications);
router.get("/unread-count", authMiddleware(["customer", "seller", "admin"]), getUnreadCount);
router.put("/:id/read", authMiddleware(["customer", "seller", "admin"]), markAsRead);
router.put("/mark-all-read", authMiddleware(["customer", "seller", "admin"]), markAllAsRead);
router.delete("/:id", authMiddleware(["customer", "seller", "admin"]), deleteNotification);
router.delete("/", authMiddleware(["customer", "seller", "admin"]), clearAllNotifications);

export default router;
