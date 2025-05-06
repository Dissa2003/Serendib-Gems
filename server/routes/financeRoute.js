import express from "express";
import { 
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransactionStatus,
  getFinancialSummary
} from "../controller/financeController.js";

const router = express.Router();

// Create new transaction
router.post("/", createTransaction);

// Get all transactions
router.get("/", getAllTransactions);

// Get financial summary
router.get("/summary", getFinancialSummary);

// Get transaction by ID
router.get("/:id", getTransactionById);

// Update transaction status
router.patch("/:id", updateTransactionStatus);

export default router;