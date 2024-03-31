const { memberModel } = require('../../models/restdb');
const { walletModel, memberidsModel } = require("../../models/logindb");
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

// Define multer storage and file upload settings
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

// Route for uploading images to Cloudinary and getting the URL in response
router.post("/uploadimage", upload.single("imageone"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const base64String = `data:${req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64String, {
      resource_type: "auto", // Specify the resource type if necessary
    });

    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    // // console.error("Error uploading image:", error);
    res.status(500).json({ message: "Error uploading image" });
  }
});

router.post("/uploadmultiple", upload.array("images", 2), async (req, res) => {
  try {
    const promises = req.files.map(async (file) => {
      const base64String = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;

      const result = await cloudinary.uploader.upload(base64String, {
        resource_type: "auto",
      });

      return result.secure_url;
    });

    const uploadedUrls = await Promise.all(promises);

    res.status(200).json({ urls: uploadedUrls });
  } catch (error) {
    res.status(500).json({
      message: "Error uploading files to Cloudinary",
      error: error.message,
    });
  }
});

// Handle file upload to Cloudinary
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Convert the buffer to a base64 data URL
    const base64String = `data:${req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64String, {
      resource_type: "auto", // Specify the resource type if necessary
    });

    // // // console.log(result);
    // Get the Cloudinary URL of the uploaded image
    const imageUrl = result.secure_url;
    // // // console.log(imageUrl);

    res.status(200).json({ url: imageUrl }); // Send the image URL back in the response
  } catch (error) {
    res.status(500).json({
      message: "Error uploading file to Cloudinary",
      error: error.message,
    });
  }
});

router.post("/uploadsignature", async (req, res) => {
  try {
    const { imageData } = req.body; // Assuming the base64 string is sent in the 'imageData' field

    if (!imageData) {
      return res.status(400).json({ message: "No image data provided" });
    }

    const result = await cloudinary.uploader.upload(imageData, {
      resource_type: "auto", // Specify the resource type if necessary
    });

    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Error uploading image" });
  }
});

router.post("/createmember", upload.single("image"), async (req, res) => {
  try {
    const {
      memberNo,
      fullName,
      email,
      branchName,
      photo,
      fatherName,
      gender,
      maritalStatus,
      dateOfBirth,
      currentAddress,
      permanentAddress,
      whatsAppNo,
      idProof,
      nomineeName,
      relationship,
      nomineeMobileNo,
      nomineeDateOfBirth,
      walletId,
      numberOfShares,
      signature,
    } = req.body;

    let imageUrl = "";

    // Check if there is an uploaded image
    if (req.file) {
      const base64String = `data:${req.file.mimetype
        };base64,${req.file.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(base64String, {
        resource_type: "auto",
      });
      imageUrl = result.secure_url;
    }

    // Create a new member instance
    const newMember = new memberModel({
      memberNo,
      fullName,
      email,
      branchName,
      photo,
      fatherName,
      gender,
      maritalStatus,
      dateOfBirth,
      currentAddress,
      permanentAddress,
      whatsAppNo,
      idProof,
      nomineeName,
      relationship,
      nomineeMobileNo,
      nomineeDateOfBirth,
      walletId,
      numberOfShares,
      signature,
    });

    // Save the new member to MongoDB
    await newMember.save();

    // Create a record in memberidsModel
    await memberidsModel.create({ memberNo });

    // Validate if walletId and numberOfShares are provided in the request body
    if (walletId === undefined || numberOfShares === undefined) {
      return res.status(400).json({
        error: "Wallet ID and shares are required in the request body.",
      });
    }

    // Create a wallet using the provided walletId and numberOfShares
    const response = await walletModel.create({ walletId, numberOfShares });

    // Respond with success message
    res
      .status(200)
      .json({ message: "Member data saved to MongoDB", data: newMember });
  } catch (error) {
    console.error("Error saving member data:", error);

    // Handle specific errors
    if (error.name === "ValidationError") {
      // Handle Mongoose validation errors
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      res.status(400).json({ error: validationErrors });
    } else {
      // Handle other types of errors
      res
        .status(500)
        .json({ error: "Error saving member data. Please try again later." });
    }
  }
});

module.exports = router;