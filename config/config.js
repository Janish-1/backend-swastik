// config/database.js
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const path = require("path");

// Specify the absolute path to your .env file
const envPath = path.resolve(__dirname, "../.env");
// Load environment variables from the specified .env file
dotenv.config({ path: envPath });

const connectDB = async () => {
  try {
    // MongoDB connection URL
    const uri = process.env.MONGODB_URI;

    await mongoose.connect(uri, { dbName: "logindatabase" });

    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
