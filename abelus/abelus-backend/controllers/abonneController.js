import ClientAbonne from "../models/ClientAbonne.js";
import AbonneTransaction from "../models/AbonneTransaction.js";
import logger from "../config/logger.js";

// @desc    Get all Client Abonnes
// @route   GET /api/abonnes
// @access  Private (Admin/Seller)
export const getAbonnes = async (req, res) => {
    try {
        const abonnes = await ClientAbonne.find({ status: "active" }).sort({ name: 1 });
        res.status(200).json({ success: true, data: abonnes });
    } catch (error) {
        logger.error({ err: error }, "Failed to get abonnes");
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Create new Client Abonne
// @route   POST /api/abonnes
// @access  Private (Admin/Seller)
export const createAbonne = async (req, res) => {
    try {
        const { name, phone, email } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        const newAbonne = await ClientAbonne.create({ name, phone, email });
        res.status(201).json({ success: true, data: newAbonne });
    } catch (error) {
        logger.error({ err: error }, "Failed to create abonne");
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get Fiche (Unpaid Transactions) for a Client
// @route   GET /api/abonnes/:id/fiche
// @access  Private (Admin/Seller)
export const getAbonneFiche = async (req, res) => {
    try {
        const client = await ClientAbonne.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ success: false, message: "Client not found" });
        }

        const transactions = await AbonneTransaction.find({ 
            client: req.params.id,
            status: { $in: ["unpaid", "partially_paid"] }
        })
        .populate("responsible", "name")
        .sort({ date: 1 });

        res.status(200).json({ 
            success: true, 
            client,
            transactions 
        });
    } catch (error) {
        logger.error({ err: error }, "Failed to get abonne fiche");
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Record Debt Payment for a Client
// @route   POST /api/abonnes/:id/pay
// @access  Private (Admin/Seller)
export const payAbonneDebt = async (req, res) => {
    try {
        const { amount } = req.body;
        const clientId = req.params.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Valid payment amount is required" });
        }

        const client = await ClientAbonne.findById(clientId);
        if (!client) {
            return res.status(404).json({ success: false, message: "Client not found" });
        }

        // Get all unpaid/partially paid transactions sorted by oldest first
        const transactions = await AbonneTransaction.find({ 
            client: clientId,
            status: { $in: ["unpaid", "partially_paid"] }
        }).sort({ date: 1 });

        let remainingPayment = Number(amount);

        // Apply payment to oldest transactions first
        for (let tx of transactions) {
            if (remainingPayment <= 0) break;

            if (remainingPayment >= tx.debtAmount) {
                // Fully pay this transaction
                remainingPayment -= tx.debtAmount;
                tx.amountPaid += tx.debtAmount;
                tx.debtAmount = 0;
                tx.status = "paid";
            } else {
                // Partially pay this transaction
                tx.amountPaid += remainingPayment;
                tx.debtAmount -= remainingPayment;
                tx.status = "partially_paid";
                remainingPayment = 0;
            }
            await tx.save();
        }

        // Update total debt
        client.totalDebt = Math.max(0, client.totalDebt - Number(amount));
        await client.save();

        res.status(200).json({ success: true, data: client, message: "Payment recorded successfully" });
    } catch (error) {
        logger.error({ err: error }, "Failed to record abonne payment");
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
