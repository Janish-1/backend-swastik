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

const createExpense = async (req, res) => {
  try {
    const { date, category, amount, reference, note, branchName } = req.body;
    const newExpense = new ExpenseModel({
      date,
      category,
      amount,
      reference,
      note,
      branchName,
    });
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating expense", error: error.message });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expenses = await ExpenseModel.find();
    res.json(expenses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving expenses", error: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, category, amount, reference, note } = req.body;
    const updatedExpense = await ExpenseModel.findByIdAndUpdate(
      id,
      { date, category, amount, reference, note },
      { new: true }
    );
    res.json(updatedExpense);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating expense", error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await ExpenseModel.findByIdAndDelete(id);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting expense", error: error.message });
  }
};

const reportExpensesHandler = async (req, res) => {
  try {
    const { startDate, endDate, expenseType, sortBy, sortOrder } = req.query;

    // Construct the query based on provided parameters
    let query = {};

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (expenseType) {
      query.category = expenseType; // Assuming 'category' holds the expense type
    }

    const sortOptions = {};

    if (sortBy && sortOrder) {
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      // Default sorting by date in descending order if no sort options provided
      sortOptions.date = -1;
    }

    const expenses = await ExpenseModel.find(query).sort(sortOptions);
    res.json(expenses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving expenses", error: error.message });
  }
};

const getExpensePerYearHandler = async (req, res) => {
  try {
    const expenseData = await ExpenseModel.aggregate([
      {
        $group: {
          _id: { $year: "$date" },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Calculate the total expense from the aggregated data
    const totalExpense = expenseData.reduce(
      (total, item) => total + item.totalAmount,
      0
    );

    const formattedData = expenseData.map((item) => ({
      x: item._id.toString(), // Convert year to string
      y: item.totalAmount,
      text: `${((item.totalAmount / totalExpense) * 100).toFixed(2)}%`, // Calculate percentage
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStackedChartDataHandler = async (req, res) => {
  try {
    const yearlyProfits = await Revenue.aggregate([
      {
        $group: {
          _id: "$year", // Grouping by year
          totalProfit: { $sum: "$monthlyRevenue" }, // Calculating yearly profit
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id field from the result
          x: "$_id", // Rename _id to x
          y: "$totalProfit", // Yearly profit as y value
        },
      },
    ]);

    res.json(yearlyProfits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  updateExpense,
  deleteExpense,
  reportExpensesHandler,
  getExpensePerYearHandler,
  getStackedChartDataHandler
};
