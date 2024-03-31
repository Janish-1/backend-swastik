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

// Create Function for User
const create = async (req, res) => {
  const {
    firstName,
    lastName,
    businessName,
    email,
    branch,
    countryCode,
    mobile,
    password,
    gender,
    city,
    state,
    zipCode,
    address,
    creditSource,
  } = req.body;

  let role = "user";
  const userEmailDomain = email.split("@")[1];
  if (userEmailDomain === "yourcompany.com") {
    role = "admin";
  }

  try {
    const newUser = new userModel({
      firstName,
      lastName,
      businessName,
      email,
      branch,
      countryCode,
      mobile,
      password,
      gender,
      city,
      state,
      zipCode,
      address,
      creditSource,
      role,
    });

    await newUser.save();

    res
      .status(200)
      .json({ message: "User data saved to MongoDB", data: newUser });
  } catch (error) {
    // // // console.error("Error saving user data:", error);
    res.status(500).json({ message: "Error saving user data" });
  }
};

const readUsers = async (req, res) => {
  try {
    const agents = await allusersModel.find();
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, password, role, security } = req.body;

  try {
    const filter = { _id: id }; // Filter to find the user by id
    const update = { firstName, lastName, email, password, role, security }; // Creates a new updated object

    const updatedUser = await userModel.findOneAndUpdate(
      filter,
      update,
      { new: true } // Returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User data updated", data: updatedUser });
  } catch (error) {
    // // // console.error("Error updating user data:", error);
    res.status(500).json({ message: "Error updating user data" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await userModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", data: deletedUser });
  } catch (error) {
    // // // // console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

const getUsernameData = (req, res) => {
  const { token } = req.body;
  // Check if the token exists
  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }

  try {
    // Verify and decode the token to extract the username
    const decoded = jwt.verify(token, "yourSecretKey");

    // Extract the username from the decoded token payload
    const { username } = decoded;

    // Send the decoded username back to the client
    res.json({ username });
  } catch (err) {
    // Handle token verification or decoding errors
    // // // console.error("Token verification error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, userType, imageUrl, memberNo } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "No image URL provided" });
    }

    // Create a new user object with Mongoose User model
    const newUser = new allusersModel({
      name,
      email,
      password,
      userType,
      image: imageUrl, // Assign the Cloudinary URL to the user's image property
      memberNo,
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    res
      .status(201)
      .json({ message: "User created successfully!", user: savedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
};

const getAllAgents = async (req, res) => {
  try {
    const agents = await allusersModel.find();
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await allusersModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUsera = async (req, res) => {
  try {
    const userId = req.params.id; // Extract the user ID from the request parameters
    const {
      name,
      email,
      password,
      userType,
      memberNo,
      image,
      // Add other fields you want to update here
    } = req.body;

    // Fetch the existing user from the database
    const user = await allusersModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user object with new values
    user.name = name || user.name;
    user.email = email || user.email;
    user.password = password || user.password;
    user.userType = userType || user.userType;
    user.memberNo = memberNo || user.memberNo;
    user.image = image || user.image;
    // Update other fields similarly as needed

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "User data updated", data: user });
  } catch (error) {
    // // console.error("Error updating user data:", error);
    res.status(500).json({ message: "Error updating user data" });
  }
};

const deleteUsera = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find and delete the user entry from the database
    const deletedUser = await allusersModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ deletedUser, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUserHandler = async (req, res) => {
  try {
    const { name, email, password, userType, imageUrl, memberNo } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "No image URL provided" });
    }

    // Create a new user object with Mongoose User model
    const newUser = new allusersModel({
      name,
      email,
      password,
      userType,
      image: imageUrl, // Assign the Cloudinary URL to the user's image property
      memberNo,
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    res
      .status(201)
      .json({ message: "User created successfully!", user: savedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
};

const updateUserHandler = async (req, res) => {
  try {
    const userId = req.params.id; // Extract the user ID from the request parameters
    const {
      name,
      email,
      password,
      userType,
      memberNo,
      image,
      // Add other fields you want to update here
    } = req.body;

    // Fetch the existing user from the database
    const user = await allusersModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user object with new values
    user.name = name || user.name;
    user.email = email || user.email;
    user.password = password || user.password;
    user.userType = userType || user.userType;
    user.memberNo = memberNo || user.memberNo;
    user.image = image || user.image;
    // Update other fields similarly as needed

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "User data updated", data: user });
  } catch (error) {
    // // console.error("Error updating user data:", error);
    res.status(500).json({ message: "Error updating user data" });
  }
};

const deleteUserHandler = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find and delete the user entry from the database
    const deletedUser = await allusersModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ deletedUser, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsersHandler = async (req, res) => {
  try {
    const agents = await allusersModel.find();
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserByIdHandler = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await allusersModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserByEmailHandler = async (req, res) => {
  try {
    const { email } = req.params;
    const { name, newEmail, password, userType, memberNo } = req.body;

    // Find the user by their email
    const user = await allusersModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's information
    user.name = name || user.name; // Update name if provided, otherwise keep the existing name
    user.email = newEmail || user.email; // Update email if provided, otherwise keep the existing email
    user.password = password || user.password; // Update password if provided, otherwise keep the existing password
    user.userType = userType;
    user.memberNo = memberNo || user.memberNo;
    // user.image = image || user.image;

    // Save the updated user document
    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUserImagesHandler = async (req, res) => {
  try {
    // Find all documents in the 'members' collection where 'photo' and 'idProof' fields exist and are not null or empty
    const allMemberImages = await memberModel.find(
      {
        $or: [
          { photo: { $exists: true, $ne: null, $ne: "" } },
          { idProof: { $exists: true, $ne: null, $ne: "" } },
        ],
      },
      ["photo", "idProof"]
    );

    // Extract image URLs from the retrieved documents
    const imageUrls = allMemberImages.reduce((acc, member) => {
      if (member.photo) {
        acc.push(member.photo);
      }
      if (member.idProof) {
        acc.push(member.idProof);
      }
      return acc;
    }, []);

    res.status(200).json({ imageUrls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  create,
  readUsers,
  updateUser,
  deleteUser,
  getUsernameData,
  createUser,
  getAllAgents,
  getUserById,
  updateUsera,
  deleteUsera,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserByEmailHandler,
  getAllUserImagesHandler,
};
