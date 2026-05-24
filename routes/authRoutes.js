const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Post execution handlers linked to controller modules
router.post("/register", authController.register); //
router.post("/login", authController.login); //
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// 🚀 LINE 12: Safely maps to the freshly verified controller method
router.get("/user-profile", authController.getUserProfile);

// Keeping your original test route for quick diagnostics
router.get("/test", (req, res) => { //
  res.json({ message: "Auth route working" }); //
}); //

module.exports = router; //