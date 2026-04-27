import express from "express";
import * as abonneController from "../controllers/abonneController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware(["admin", "seller"]), abonneController.getAbonnes);
router.post("/", authMiddleware(["admin", "seller"]), abonneController.createAbonne);
router.get("/:id/fiche", authMiddleware(["admin", "seller"]), abonneController.getAbonneFiche);
router.post("/:id/pay", authMiddleware(["admin", "seller"]), abonneController.payAbonneDebt);

export default router;
