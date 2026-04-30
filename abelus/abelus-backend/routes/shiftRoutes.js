import express from "express";
import { startShift, getCurrentShift, closeShift, getShiftReport, getActiveShiftStats } from "../controllers/shiftController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", authMiddleware(["admin", "seller"]), startShift);
router.get("/current", authMiddleware(["admin", "seller"]), getCurrentShift);
router.get("/active-stats", authMiddleware(["admin", "seller"]), getActiveShiftStats);
router.post("/close", authMiddleware(["admin", "seller"]), closeShift);
router.get("/:id/report", authMiddleware(["admin", "seller"]), getShiftReport);

export default router;
