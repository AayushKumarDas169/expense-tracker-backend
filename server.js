const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http"); // 🚀 Import the serverless bridge
const connectDB = require("./config/db");

// Load Environment Configuration Variables
require("dotenv").config();

const app = express();

// Global Pipeline Middlewares
app.use(cors());
app.use(express.json());

// Initialize MongoDB Atlas Connection Flow
connectDB();

// Register your functional routing maps
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/savings", require("./routes/savingsRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));

// Catch-all fallbacks for clean routing logs
app.get("/", (req, res) => {
  res.json({ message: "LedgerStatement Serverless Backend Core Operational! 🛰️" });
});

// ❌ REMOVE OR COMMENT OUT: Your old traditional port listener loop
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// 🚀 THE CRITICAL SERVERLESS EXPORT LINK:
module.exports = app;
module.exports.handler = serverless(app);