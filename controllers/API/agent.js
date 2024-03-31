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

const createAgentHandler = async (req, res) => {
  const {
    name,
    memberNo,
    qualification,
    image, // Assuming this is a URL or path to the image file
    photo, // Assuming this is another image URL or path
    fatherName,
    maritalStatus,
    dob,
    age,
    aadhar,
    panCard,
    address,
    permanentAddress,
    email,
    mobile,
    nomineeName,
    nomineeRelationship,
    nomineeDob,
    nomineeMobile,
    password,
    branchName,
  } = req.body;

  try {
    const newAgent = new allusersModel({
      memberNo,
      name,
      qualification,
      image,
      photo,
      fatherName,
      maritalStatus,
      dob,
      age,
      aadhar,
      panCard,
      address,
      permanentAddress,
      email,
      mobile,
      nomineeName,
      nomineeRelationship,
      nomineeDob,
      nomineeMobile,
      password,
      branchName,
      userType: "agent",
    });

    await newAgent.save();

    res
      .status(200)
      .json({ message: "Agent data saved to MongoDB", data: newAgent });
  } catch (error) {
    // // console.error("Error saving agent data:", error);
    res.status(500).json({ message: "Error saving agent data" });
  }
};

const updateAgentHandler = async (req, res) => {
  const agentId = req.params.id;

  try {
    const agent = await allusersModel.findById(agentId);

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Destructure the fields from the request body
    const {
      memberNo,
      name,
      qualification,
      fatherName,
      maritalStatus,
      dob,
      age,
      aadhar,
      panCard,
      address,
      permanentAddress,
      email,
      mobile,
      nomineeName,
      nomineeRelationship,
      nomineeDob,
      nomineeMobile,
      password,
      image,
      photo,
      branchName,
    } = req.body;

    // Update agent object with new values
    agent.memberNo = memberNo || agent.memberNo;
    agent.name = name || agent.name;
    agent.qualification = qualification || agent.qualification;
    agent.fatherName = fatherName || agent.fatherName;
    agent.maritalStatus = maritalStatus || agent.maritalStatus;
    agent.dob = dob || agent.dob;
    agent.age = age || agent.age;
    agent.aadhar = aadhar || agent.aadhar;
    agent.panCard = panCard || agent.panCard;
    agent.address = address || agent.address;
    agent.permanentAddress = permanentAddress || agent.permanentAddress;
    agent.email = email || agent.email;
    agent.mobile = mobile || agent.mobile;
    agent.nomineeName = nomineeName || agent.nomineeName;
    agent.nomineeRelationship = nomineeRelationship || agent.nomineeRelationship;
    agent.nomineeDob = nomineeDob || agent.nomineeDob;
    agent.nomineeMobile = nomineeMobile || agent.nomineeMobile;
    agent.password = password || agent.password;
    agent.image = image || agent.image;
    agent.photo = photo || agent.photo;
    agent.branchName = branchName || agent.branchName;

    // Save the updated agent
    await agent.save();

    res.status(200).json({ message: "Agent data updated", data: agent });
  } catch (error) {
    // // console.error("Error updating agent data:", error);
    res.status(500).json({ message: "Error updating agent data" });
  }
};

module.exports = {
  createAgentHandler,
  updateAgentHandler
};