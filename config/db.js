const mongoose = require("mongoose");

let isConnected = false; 

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing database connection pool.");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    
    isConnected = db.connections[0].readyState;
    console.log("New MongoDB Atlas connection established successfully.");
  } catch (err) {
    console.error("Database connection failure context crash error: " + err.message);
    throw err; 
  }
};

module.exports = connectDB;