const { memberModel, loansModel, repaymentModel, AccountModel, TransactionsModel, RepaymentDetails } = require('../../models/database');
const { allusersModel, ExpenseModel, categoryModel, Revenue, walletModel, memberidsModel, loanidModel, accountidModel } = require("../../models/database");
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

const createAccount = async (req, res) => {
  try {
    const account = await AccountModel.create(req.body);
    try {
      await accountidModel.create({ accountNumber: account.accountNumber });
    } catch (error) {
      // // console.error(error);
    }
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllAccounts = async (req, res) => {
  try {
    const allAccounts = await AccountModel.find();

    res.status(200).json({
      message: "All accounts retrieved successfully",
      data: allAccounts,
    });
  } catch (error) {
    // // console.error("Error retrieving accounts:", error);
    res.status(500).json({ message: "Error retrieving accounts" });
  }
};

const getAccountById = async (req, res) => {
  const accountId = req.params.id;

  try {
    const account = await AccountModel.findById(accountId);

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res
      .status(200)
      .json({ message: "Account retrieved successfully", data: account });
  } catch (error) {
    // // console.error("Error retrieving account:", error);
    res.status(500).json({ message: "Error retrieving account" });
  }
};

const getAccountIds = async (req, res) => {
  try {
    const accountNumbers = await AccountModel.find(
      { accountType: "Loan" },
      "accountNumber"
    );

    if (!accountNumbers || accountNumbers.length === 0) {
      return res.status(404).json({
        message: "No account numbers found with the account type as loan",
      });
    }

    // Extract accountNumbers from the fetched data
    const numbers = accountNumbers.map((account) => account.accountNumber);

    res.status(200).json({
      message:
        "Account numbers with the account type as loan retrieved successfully",
      data: numbers,
    });
  } catch (error) {
    // // console.error("Error retrieving account numbers:", error);
    res.status(500).json({ message: "Error retrieving account numbers" });
  }
};

const getApprovedAccountIds = async (req, res) => {
  try {
    // Fetch only approved accounts by adding the status condition
    const approvedAccountNumbers = await AccountModel.find(
      { accountType: "Loan", approval: "Approved" },
      "accountNumber"
    );

    if (!approvedAccountNumbers || approvedAccountNumbers.length === 0) {
      return res.status(404).json({
        message:
          "No approved account numbers found with the account type as loan",
      });
    }

    // Extract accountNumbers from the fetched data
    const numbers = approvedAccountNumbers.map(
      (account) => account.accountNumber
    );

    res.status(200).json({
      message:
        "Approved account numbers with the account type as loan retrieved successfully",
      data: numbers,
    });
  } catch (error) {
    // Handle the error or log it
    // console.error("Error retrieving approved account numbers:", error);
    res
      .status(500)
      .json({ message: "Error retrieving approved account numbers" });
  }
};

const updateAccount = async (req, res) => {
  try {
    const account = await AccountModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const readAccountNumbers = async (req, res) => {
  try {
    const accountNumbers = await AccountModel.find({}, "accountNumber");
    const numbers = accountNumbers.map((account) => account.accountNumber);
    res.json(numbers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const account = await AccountModel.findByIdAndDelete(req.params.id);
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAccountStatement = async (req, res) => {
  try {
    const { startDate, endDate, accountNumber } = req.query;

    // Convert start and end dates to JavaScript Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch transactions based on the provided criteria
    const transactions = await TransactionsModel.find(
      {
        date: { $gte: start, $lte: end },
        accountNumber: accountNumber,
      },
      "date description transactionAmount debitOrCredit currentBalancemoment"
    );

    // Format the transactions to match the required response format
    const formattedTransactions = transactions.map((transaction) => {
      let debit = 0;
      let credit = 0;

      if (transaction.debitOrCredit === "Debit") {
        debit = transaction.transactionAmount;
      } else if (transaction.debitOrCredit === "Credit") {
        credit = transaction.transactionAmount;
      }

      return {
        Date: transaction.date,
        Description: transaction.description,
        Debit: debit,
        Credit: credit,
        Balance: transaction.currentBalancemoment, // Assuming this field contains the calculated balance
      };
    });

    // Return the formatted data
    res.status(200).json(formattedTransactions);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch transactions", error: error.message });
  }
};

const accountDetailsHandler = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    const account = await AccountModel.findOne({ accountNumber });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const transactions = await TransactionsModel.find({ accountNumber });
    let currentBalance = account.openingBalance;
    transactions.forEach((transaction) => {
      if (transaction.debitOrCredit === "Credit") {
        currentBalance += transaction.transactionAmount;
      } else {
        currentBalance -= transaction.transactionAmount;
      }
    });

    // Modify the query to fetch associated loan IDs based on the accountNumber
    const associatedLoans = await loansModel
      .find({ account: accountNumber })
      .distinct("loanId"); // Assuming 'accountNumber' is the correct field in your repaymentModel

    return res.status(200).json({
      accountNumber: account.accountNumber,
      availableBalance: currentBalance,
      currentBalance: account.currentBalance,
      associatedLoanIds: associatedLoans,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const memberAccountDetailsHandler = async (req, res) => {
  try {
    const memberId = req.params.id;

    const member = await memberModel.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const memberNo = member.memberNo;

    const account = await AccountModel.findOne({ memberNo });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const accountNumber = account.accountNumber;

    const transactions = await TransactionsModel.find({ accountNumber });
    let currentBalance = parseFloat(account.openingBalance);

    transactions.forEach((transaction) => {
      if (transaction.debitOrCredit === "Credit") {
        currentBalance += parseFloat(transaction.transactionAmount);
      } else {
        currentBalance -= parseFloat(transaction.transactionAmount);
      }
    });

    // Fetch associated loan IDs based on the accountNumber
    const associatedLoans = await loansModel
      .find({ account: accountNumber })
      .distinct("loanId");

    return res.status(200).json({
      accountNumber: account.accountNumber,
      availableBalance: parseFloat(currentBalance.toFixed(2)), // Rounding balance
      currentBalance: parseFloat(account.currentBalance),
      associatedLoanIds: associatedLoans.join(", "),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getTotalCurrentBalanceHandler = async (req, res) => {
  try {
    const totalCurrentBalance = await AccountModel.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$currentBalance" },
        },
      },
    ]);

    if (totalCurrentBalance.length > 0) {
      res.json({ totalCurrentBalance: totalCurrentBalance[0].totalBalance });
    } else {
      res.json({ totalCurrentBalance: 0 });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAccountHandler = async (req, res) => {
  try {
    const newAccount = new AccountModel(req.body);
    const createdAccount = await newAccount.save();
    res.status(201).json(createdAccount);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAllAccountsHandler = async (req, res) => {
  try {
    const accounts = await AccountModel.find();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAccountByIdHandler = async (req, res) => {
  try {
    const accountId = req.params.id;
    const account = await AccountModel.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAccountHandler = async (req, res) => {
  try {
    const accountId = req.params.id;
    const updatedAccount = await AccountModel.findByIdAndUpdate(
      accountId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json(updatedAccount);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteAccountHandler = async (req, res) => {
  try {
    const accountId = req.params.id;
    const deletedAccount = await AccountModel.findByIdAndDelete(accountId);
    if (!deletedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDetailsByAccountNumberHandler = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    // Assuming you have an 'accounts' collection in your database
    const accountDetails = await AccountModel.findOne({ accountNumber });

    if (!accountDetails) {
      return res.status(404).json({ message: "Account details not found" });
    }

    // Extract necessary details like account number and borrower name
    const { memberNo, memberName } = accountDetails;

    res.status(200).json({ memberNo, memberName });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching account details",
      error: error.message,
    });
  }
};

const getDetailsByMemberIdHandler = async (req, res) => {
  try {
    const { memberId } = req.params; // Corrected from { memberNo }

    const accountDetails = await AccountModel.findOne({ memberNo: memberId });

    if (!accountDetails) {
      return res.status(404).json({ message: "Account details not found" });
    }

    const { accountNumber, memberName } = accountDetails;

    res.status(200).json({ accountNumber, memberName });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching account details",
      error: error.message,
    });
  }
};

const getAllAccountImagesHandler = async (req, res) => {
  try {
    // Find all documents in the 'accounts' collection where 'photo' and 'idProof' fields exist and are not null or empty
    const allAccountImages = await AccountModel.find(
      {
        $or: [
          { photo: { $exists: true, $ne: null, $ne: "" } },
          { idProof: { $exists: true, $ne: null, $ne: "" } },
        ],
      },
      ["photo", "idProof"]
    );

    // Extract image URLs from the retrieved documents
    const imageUrls = allAccountImages.reduce((acc, account) => {
      if (account.photo) {
        acc.push(account.photo);
      }
      if (account.idProof) {
        acc.push(account.idProof);
      }
      return acc;
    }, []);

    res.status(200).json({ imageUrls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveAccountHandler = async (req, res) => {
  const { accountId } = req.params;

  try {
    // Assuming you have a LoanModel or a similar model/schema
    const account = await AccountModel.findByIdAndUpdate(
      accountId,
      { approval: "Approved" },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res
      .status(200)
      .json({ message: "Account status updated to Approved", account });
  } catch (error) {
    res.status(500).json({
      message: "Error updating Account status to Approved",
      error: error.message,
    });
  }
};

const cancelAccountHandler = async (req, res) => {
  const { accountId } = req.params;

  try {
    const account = await AccountModel.findByIdAndUpdate(
      accountId,
      { approval: "Cancelled" },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res
      .status(200)
      .json({ message: "Account status updated to Cancelled", account });
  } catch (error) {
    res.status(500).json({
      message: "Error updating Account status to Cancelled",
      error: error.message,
    });
  }
};

module.exports = {
  createAccount,
  getAllAccounts,
  getAccountById,
  getAccountIds,
  getApprovedAccountIds,
  updateAccount,
  readAccountNumbers,
  deleteAccount,
  getAccountStatement,
  accountDetailsHandler,
  memberAccountDetailsHandler,
  getTotalCurrentBalanceHandler,
  createAccountHandler,
  getAllAccountsHandler,
  getAccountByIdHandler,
  updateAccountHandler,
  deleteAccountHandler,
  getDetailsByAccountNumberHandler,
  getDetailsByMemberIdHandler,
  getAllAccountImagesHandler,
  approveAccountHandler,
  cancelAccountHandler
}