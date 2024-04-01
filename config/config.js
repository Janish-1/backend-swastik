// config/database.js
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const moment = require("moment");
const cloudinary = require("cloudinary").v2;

// Specify the absolute path to your .env file
const envPath = path.resolve(__dirname, "../.env");
// Load environment variables from the specified .env file
dotenv.config({ path: envPath });

const connectDB = async () => {
  try {
    // MongoDB connection URL
    const uri = process.env.MONGODB_URI;

    loginDB = mongoose.createConnection(uri, {
      dbName: "logindatabase",
    });
    
    // Event handling for successful connection
    loginDB.on("connected", () => {
      console.log("Connected to loginDB");
    });
    
    // Event handling for disconnection
    loginDB.on("disconnected", () => {
      console.log("Disconnected from loginDB");
    });
    
    // Event handling for error
    loginDB.on("error", (err) => {
      console.error("Connection error:", err);
    });
  
    console.log('MongoDB Connected - Login Database');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
