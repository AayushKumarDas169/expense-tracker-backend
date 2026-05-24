const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// 🚀 Establish your MongoDB Atlas cloud database connection ONCE at server startup
connectDB()
  .then(() => console.log("Database successfully initialized in persistent container layer. 🚀"))
  .catch((err) => console.error("Database initialization failed at boot:", err.message));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // Fallback to allow all if CLIENT_URL is missing
    credentials: true,
  })
);

app.use(express.json());

// ❌ REMOVED: The heavy, repeating serverless 'connectDB' request middleware loop

app.get("/", (req, res) => {
  res.json({ message: "API is running successfully on a persistent cloud container!" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/savings", require("./routes/savingsRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running securely on port ${PORT}`);
});

module.exports = app;