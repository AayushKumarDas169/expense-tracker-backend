const express = require("express");
const router = express.Router();
const { 
  getTransactions, 
  addTransaction, 
  deleteTransaction, 
  getTransactionSummary, 
  updateTransaction,
  exportTransactionsToPDF 
} = require("../controllers/transactionController");
const protect = require("../middleware/authMiddleware"); 

router.get("/summary", protect, getTransactionSummary);
router.get("/pdf", protect, exportTransactionsToPDF); // 🚀 NEW: PDF Stream Endpoint

router.route("/")
  .get(protect, getTransactions)
  .post(protect, addTransaction);

router.route("/:id")
  .delete(protect, deleteTransaction)
  .put(protect, updateTransaction);

module.exports = router;