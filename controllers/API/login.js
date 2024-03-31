const { memberModel, loansModel, repaymentModel, AccountModel, TransactionsModel, RepaymentDetails } = require('../../models/restdb');
const { allusersModel, ExpenseModel, categoryModel, Revenue, walletModel, memberidsModel, loanidModel, accountidModel } = require("../../models/logindb");
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

// MongoDB connection URL
const uri = process.env.MONGODB_URI;

const alllogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await allusersModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        let database = ""; // Define dbName here

        // Check if the user is an admin, if so, set the global variable
        if (user.userType === "admin") {
            database = "admindatabase";
            // Update the user's dbName in the database
            await allusersModel.findByIdAndUpdate(
                user._id, // user's ID
                { $set: { dbName: database } }, // setting dbName field to dbName determined above
                { new: true } // to return the updated document
            );
            const Connection = mongoose.createConnection(process.env.MONGODB_URI, {
                dbName: database,
            });

            Connection.on("connected", () => {
                console.log("Connected to MongoDB - Secondary Connection");
            });

            Connection.on("disconnected", () => {
                console.log("Disconnected from MongoDB - Secondary Connection");
            });

            Connection.on("error", (err) => {
                console.error("Connection error:", err);
            });
        } else if (user.userType === "manager") {
            dbName = `manager_${user._id.toString()}`; // Prefix with "manager_"
            database = dbName;
            // Update the user's dbName in the database
            await allusersModel.findByIdAndUpdate(
                user._id, // user's ID
                { $set: { dbName: database } }, // setting dbName field to dbName determined above
                { new: true } // to return the updated document
            );
            const Connection = mongoose.createConnection(process.env.MONGODB_URI, {
                dbName: database,
            });

            Connection.on("connected", () => {
                console.log("Connected to MongoDB - Secondary Connection");
            });

            Connection.on("disconnected", () => {
                console.log("Disconnected from MongoDB - Secondary Connection");
            });

            Connection.on("error", (err) => {
                console.error("Connection error:", err);
            });
        } else if (user.userType === "agent") {
            dbName = `agent_${user._id.toString()}`; // Prefix with "manager_"
            database = dbName;
            // Update the user's dbName in the database
            await allusersModel.findByIdAndUpdate(
                user._id, // user's ID
                { $set: { dbName: database } }, // setting dbName field to dbName determined above
                { new: true } // to return the updated document
            );
            const Connection = mongoose.createConnection(process.env.MONGODB_URI, {
                dbName: database,
            });

            Connection.on("connected", () => {
                console.log("Connected to MongoDB - Secondary Connection");
            });

            Connection.on("disconnected", () => {
                console.log("Disconnected from MongoDB - Secondary Connection");
            });

            Connection.on("error", (err) => {
                console.error("Connection error:", err);
            });
        } else {
            console.error("Invalid Role");
        }

        // Update the user object with dbName
        user.database = database;

        // User authentication successful, create payload for JWT
        const payload = {
            userId: user._id,
            email: user.email,
            username: user.name, // Make sure to replace this with the correct user field for username
            role: user.userType,
            db: user.database,
            branch: user.branchName,
            // Add other necessary user information to the payload
        };

        const token = jwt.sign(payload, "yourSecretKey", { expiresIn: "1h" });

        res.json({ message: "Login Success!", token });
    } catch (error) {
        // // // console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await userModel.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Admin Franchise agent User
      // This is not secure - comparing passwords in plaintext
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid Password" });
      }
  
      // If the passwords match, create a JWT
      const payload = {
        userId: user._id,
        email: user.email,
        username: user.firstName,
        password: user.password,
        branch: user.branchName,
      };
  
      const token = jwt.sign(payload, "yourSecretKey", { expiresIn: "1h" }); // Set your own secret key and expiration time
  
      res.json({ message: "Login Success!", token });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
};

const verify_token = async (req, res) => {
    const token = req.header("Authorization").replace("Bearer ", "");

    // Verify the token
    jwt.verify(token, "yourSecretKey", (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token is not valid" });
      }
  
      // Token is valid
      // You might perform additional checks or operations based on the decoded token data
  
      res.status(200).json({ message: "Token is valid" });
    });
};

module.exports = { alllogin, login, verify_token };