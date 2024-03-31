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

const createTransaction = async (req, res) => {
  try {
    const {
      date,
      member,
      accountNumber,
      currentBalancemoment,
      transactionAmount,
      debitOrCredit,
      status,
      description,
    } = req.body;

    // Validate the status provided in the request
    const validStatuses = ["Completed", "Pending", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" });
    }

    // Find the corresponding account using accountNumber
    const account = await AccountModel.findOne({ accountNumber });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Create a new transaction instance
    const newTransaction = new TransactionsModel({
      date,
      member,
      accountNumber,
      currentBalancemoment,
      transactionAmount,
      debitOrCredit,
      status,
      description,
    });

    // // // console.log('Current Balance:', account.currentBalance);
    // // // console.log('transacation amount:', transactionAmount);
    // // Before updating the balance, validate account.currentBalance is a valid number
    if (
      typeof account.currentBalance !== "number" ||
      isNaN(account.currentBalance)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid currentBalance value in the account" });
    }

    // Check if the transaction status is 'completed' to update the account balance
    if (status === "Completed") {
      // Update the account balance based on the transaction type (Debit/Credit)
      if (debitOrCredit === "Debit") {
        account.currentBalance -= parseFloat(transactionAmount);
      } else if (debitOrCredit === "Credit") {
        account.currentBalance += parseFloat(transactionAmount);
      }

      // Save the updated account balance
      await account.save();
    }

    newTransaction.currentBalancemoment = account.currentBalance;

    // Save the transaction details
    const savedTransaction = await newTransaction.save();
    res
      .status(200)
      .json({ message: "Transaction created", data: savedTransaction });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create transaction", error: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const allTransactions = await TransactionsModel.find();

    res.status(200).json({
      message: "All transactions retrieved successfully",
      data: allTransactions,
    });
  } catch (error) {
    // // console.error("Error retrieving transactions:", error);
    res.status(500).json({ message: "Error retrieving transactions" });
  }
};

const getTransactionsByMemberId = async (req, res) => {
  try {
    const memberId = req.params.id;

    // Find the member using the provided ID
    const member = await memberModel.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Retrieve the member number from the found member
    const memb1 = member.memberNo;

    // Fetch transactions by member number
    const transactions = await TransactionsModel.find({ member: memb1 });

    res.status(200).json({
      message: "Transactions retrieved successfully for the member",
      data: transactions,
    });
  } catch (error) {
    // // console.error("Error retrieving transactions:", error);
    res.status(500).json({ message: "Error retrieving transactions" });
  }
};

const getTransactionById = async (req, res) => {
  const transactionId = req.params.id;

  try {
    const transaction = await TransactionsModel.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({
      message: "Transaction retrieved successfully",
      data: transaction,
    });
  } catch (error) {
    // // console.error("Error retrieving transaction:", error);
    res.status(500).json({ message: "Error retrieving transaction" });
  }
};

const deleteTransaction = async (req, res) => {
  const transactionId = req.params.id;

  try {
    const deletedTransaction = await TransactionsModel.findByIdAndDelete(
      transactionId
    );

    if (!deletedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({
      message: "Transaction deleted successfully",
      data: deletedTransaction,
    });
  } catch (error) {
    // // console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Error deleting transaction" });
  }
};

const updateTransaction = async (req, res) => {
  const transactionId = req.params.id;

  try {
    const updatedTransaction = await TransactionsModel.findByIdAndUpdate(
      transactionId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({
      message: "Transaction updated successfully",
      data: updatedTransaction,
    });
  } catch (error) {
    // // console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Error updating transaction" });
  }
};

const getTransactionReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      transactionType,
      transactionStatus,
      accountNumber,
    } = req.query;
    let query = {};

    // Adding filters based on provided query parameters
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (transactionType) {
      query.debitOrCredit = transactionType;
    }

    if (transactionStatus) {
      query.status = transactionStatus;
    }

    if (accountNumber) {
      query.accountNumber = accountNumber;
    }

    // Fetching data based on query filters
    const transactions = await TransactionsModel.find(query)
      .select(
        "date member accountNumber transactionAmount debitOrCredit status"
      )
      .exec();

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const depositRequestsPendingHandler = async (req, res) => {
  try {
    const depositRequestsPending = await TransactionsModel.countDocuments({
      debitOrCredit: "Credit",
      status: "Pending",
    });

    res.status(200).json({ count: depositRequestsPending });
  } catch (error) {
    // // console.error("Error retrieving deposit requests pending:", error);
    res
      .status(500)
      .json({ message: "Error retrieving deposit requests pending" });
  }
};

const withdrawRequestsPendingHandler = async (req, res) => {
  try {
    const withdrawRequestsPending = await TransactionsModel.countDocuments({
      debitOrCredit: "Debit",
      status: "Pending",
    });

    res.status(200).json({ count: withdrawRequestsPending });
  } catch (error) {
    // // console.error("Error retrieving withdraw requests pending:", error);
    res
      .status(500)
      .json({ message: "Error retrieving withdraw requests pending" });
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionsByMemberId,
  getTransactionById,
  deleteTransaction,
  updateTransaction,
  getTransactionReport,
  depositRequestsPendingHandler,
  withdrawRequestsPendingHandler,
};
