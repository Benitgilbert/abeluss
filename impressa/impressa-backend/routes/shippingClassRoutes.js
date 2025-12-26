import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import {
    getShippingClasses,
    createShippingClass,
    updateShippingClass,
    deleteShippingClass,
} from "../controllers/shippingClassController.js";

const router = express.Router();

router.route("/")
    .get(getShippingClasses) // Public or Admin? Usually Admin for management, but maybe public for listing? Let's say public for now or Admin. Actually, usually only Admin manages these.
    .post(verifyToken, verifyAdmin, createShippingClass);

router.route("/:id")
    .put(verifyToken, verifyAdmin, updateShippingClass)
    .delete(verifyToken, verifyAdmin, deleteShippingClass);

export default router;
