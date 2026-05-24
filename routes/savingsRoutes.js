const express = require("express");
const router = express.Router();
const savingsController = require("../controllers/savingsController");

// 🚀 LINE 7: Ensure the controllers exist and match spelling exactly
router.post("/transaction", savingsController.handleManualSavingsTransaction);
router.post("/sweep", savingsController.sweepMonthlySurplus);

module.exports = router;