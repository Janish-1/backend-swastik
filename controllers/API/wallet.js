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

const createWalletHandler = async (req, res) => {
  try {
    const { walletid, shares } = req.body;
    const createdWallet = await walletModel.create({ walletid, shares });
    res.status(201).json(createdWallet);
  } catch (error) {
    res.status(500).json({ error: "Error creating wallet" });
  }
};

const getWalletHandler = async (req, res) => {
  try {
    const walletId = req.params.walletId;
    const wallet = await walletModel.findOne({ walletid: walletId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: "Error fetching wallet" });
  }
};

const updateWalletHandler = async (req, res) => {
  try {
    const walletId = req.params.walletId;
    const { shares } = req.body;
    const updatedWallet = await walletModel.findOneAndUpdate(
      { walletid: walletId },
      { $set: { shares } },
      { new: true }
    );
    if (!updatedWallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    res.json(updatedWallet);
  } catch (error) {
    res.status(500).json({ error: "Error updating wallet shares" });
  }
};

const deleteWalletHandler = async (req, res) => {
  try {
    const walletId = req.params.walletId;
    const deletedWallet = await walletModel.findOneAndDelete({
      walletid: walletId,
    });
    if (!deletedWallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    res.json(deletedWallet);
  } catch (error) {
    res.status(500).json({ error: "Error deleting wallet" });
  }
};
module.exports = {
  createWalletHandler,
  getWalletHandler,
  updateWalletHandler,
  deleteWalletHandler,
};
