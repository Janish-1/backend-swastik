const { memberModel, loansModel, repaymentModel, AccountModel, TransactionsModel, RepaymentDetails } = require('../../models/restdb');
const { allusersModel, ExpenseModel, categoryModel, Revenue, walletModel, memberidsModel, loanidModel, accountidModel } = require("../../models/logindb");
const mongoose = require('mongoose');

const createTransaction = async (req, res) => {
  try {
    const { date, member, accountNumber, currentBalancemoment, transactionAmount, debitOrCredit, status, description } = req.body;
    const validStatuses = ["Completed", "Pending", "Cancelled"];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid status provided" });
    const account = await AccountModel.findOne({ accountNumber });
    if (!account) return res.status(404).json({ message: "Account not found" });
    const newTransaction = new TransactionsModel({ date, member, accountNumber, currentBalancemoment, transactionAmount, debitOrCredit, status, description });
    if (typeof account.currentBalance !== "number" || isNaN(account.currentBalance)) return res.status(400).json({ message: "Invalid currentBalance value in the account" });
    if (status === "Completed") {
      if (debitOrCredit === "Debit") account.currentBalance -= parseFloat(transactionAmount);
      else if (debitOrCredit === "Credit") account.currentBalance += parseFloat(transactionAmount);
      await account.save();
    }
    newTransaction.currentBalancemoment = account.currentBalance;
    const savedTransaction = await newTransaction.save();
    res.status(200).json({ message: "Transaction created", data: savedTransaction });
  } catch (error) {
    res.status(500).json({ message: "Failed to create transaction", error: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const allTransactions = await TransactionsModel.find();
    res.status(200).json({ message: "All transactions retrieved successfully", data: allTransactions });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving transactions", error: error.message });
  }
};

const getTransactionsByMemberId = async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await memberModel.findById(memberId);
    if (!member) return res.status(404).json({ message: "Member not found" });
    const memb1 = member.memberNo;
    const transactions = await TransactionsModel.find({ member: memb1 });
    res.status(200).json({ message: "Transactions retrieved successfully for the member", data: transactions });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving transactions", error: error.message });
  }
};
const getTransactionById = async (req, res) => {
  const transactionId = req.params.id;
  try {
    const transaction = await TransactionsModel.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    res.status(200).json({ message: "Transaction retrieved successfully", data: transaction });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving transaction", error: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  const transactionId = req.params.id;
  try {
    const deletedTransaction = await TransactionsModel.findByIdAndDelete(transactionId);
    if (!deletedTransaction) return res.status(404).json({ message: "Transaction not found" });
    res.status(200).json({ message: "Transaction deleted successfully", data: deletedTransaction });
  } catch (error) {
    res.status(500).json({ message: "Error deleting transaction", error: error.message });
  }
};

const updateTransaction = async (req, res) => {
  const transactionId = req.params.id;
  try {
    const updatedTransaction = await TransactionsModel.findByIdAndUpdate(transactionId, req.body, { new: true, runValidators: true });
    if (!updatedTransaction) return res.status(404).json({ message: "Transaction not found" });
    res.status(200).json({ message: "Transaction updated successfully", data: updatedTransaction });
  } catch (error) {
    res.status(500).json({ message: "Error updating transaction", error: error.message });
  }
};

const getTransactionReport = async (req, res) => {
  try {
    const { startDate, endDate, transactionType, transactionStatus, accountNumber } = req.query;
    let query = {};
    if (startDate && endDate) query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    if (transactionType) query.debitOrCredit = transactionType;
    if (transactionStatus) query.status = transactionStatus;
    if (accountNumber) query.accountNumber = accountNumber;
    const transactions = await TransactionsModel.find(query).select("date member accountNumber transactionAmount debitOrCredit status").exec();
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
    res.status(500).json({ message: "Error retrieving deposit requests pending" });
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
    res.status(500).json({ message: "Error retrieving withdraw requests pending" });
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
