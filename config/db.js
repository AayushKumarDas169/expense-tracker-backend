const mongoose = require("mongoose");

let isConnected = false; // 🚀 Cache state variable for serverless optimization

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing MongoDB Atlas connection link! 🛰️");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log("New MongoDB Atlas connection cluster established successfully! 🛰️🚀");
  } catch (err) {
    console.error("Database connection failure context crash error: " + err.message);
    throw err;
  }
};

module.exports = connectDB;