import express from "express";
import * as shiftController from "../controllers/shiftController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", authMiddleware(["admin", "seller"]), shiftController.startShift);
router.get("/current", authMiddleware(["admin", "seller"]), shiftController.getCurrentShift);
router.post("/close", authMiddleware(["admin", "seller"]), shiftController.closeShift);
router.get("/:id/report", authMiddleware(["admin", "seller"]), shiftController.getShiftReport);

export default router;
