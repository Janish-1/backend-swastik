const { memberModel, loansModel, repaymentModel, AccountModel, TransactionsModel, RepaymentDetails } = require('../../models/restdb');
const { allusersModel, ExpenseModel, categoryModel, Revenue, walletModel, memberidsModel, loanidModel, accountidModel } = require("../../models/logindb");
const mongoose = require('mongoose');

const createRepayment = async (req, res) => {
  try {
    const { loanId, paymentDate, dueDate, dueAmount, principalAmount, interest, latePenalties, totalAmount } = req.body;
    const newRepayment = new repaymentModel({ loanId, paymentDate, dueDate, dueAmount, principalAmount, interest, latePenalties, totalAmount, loanRepaymentStatus: "ongoing", monthstatus: "unpaid" });
    const savedRepayment = await newRepayment.save();
    res.status(200).json({ message: "Repayment record created", data: savedRepayment });
  } catch (error) {
    res.status(500).json({ message: "Failed to create repayment record", error: error.message });
  }
};

const getAllRepayments = async (req, res) => {
  try {
    const allRepayments = await repaymentModel.find({ loanRepaymentStatus: { $ne: "completed" } });
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    allRepayments.forEach((repayment) => {
      const dueDate = new Date(repayment.dueDate);
      const dueMonth = dueDate.getMonth() + 1;
      if (dueMonth !== currentMonth) {
        repayment.monthstatus = "paid";
      } else {
        repayment.monthstatus = "unpaid";
      }
    });
    res.status(200).json({ message: "All repayment records retrieved successfully", data: allRepayments });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving repayment records", error: error.message });
  }
};

const getRepaymentById = async (req, res) => {
  const repaymentId = req.params.id;
  try {
    const repayment = await repaymentModel.findById(repaymentId);
    if (!repayment) return res.status(404).json({ message: "Repayment record not found" });
    res.status(200).json({ message: "Repayment record retrieved successfully", data: repayment });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving repayment record", error: error.message });
  }
};

const updateRepayment = async (req, res) => {
  try {
    const repaymentId = req.params.id;
    const { loanId, paymentDate, dueDate, principalAmount, interest, latePenalties, totalAmount } = req.body;
    const updatedRepayment = await repaymentModel.findByIdAndUpdate(repaymentId, { loanId, paymentDate, dueDate, principalAmount, interest, latePenalties, totalAmount }, { new: true });
    if (!updatedRepayment) return res.status(404).json({ message: "Repayment record not found" });
    res.status(200).json({ message: "Repayment record updated", data: updatedRepayment });
  } catch (error) {
    res.status(500).json({ message: "Failed to update repayment record", error: error.message });
  }
};

const deleteRepayment = async (req, res) => {
  const repaymentId = req.params.id;
  try {
    const deletedRepayment = await repaymentModel.findByIdAndDelete(repaymentId);
    if (!deletedRepayment) return res.status(404).json({ message: "Repayment record not found" });
    res.status(200).json({ message: "Repayment record deleted successfully", data: deletedRepayment });
  } catch (error) {
    res.status(500).json({ message: "Error deleting repayment record", error: error.message });
  }
};
const checkRepaymentExistsHandler = async (req, res) => {
  try {
    const { loanId } = req.params;

    // Get the current month in 'YYYY-MM' format
    const currentMonth = moment().format("YYYY-MM");

    // Find a repayment for the specified loanId within the current month
    const repayment = await RepaymentDetails.findOne({
      loanId,
      paymentDate: {
        $gte: new Date(`${currentMonth}-01`), // Start of the current month
        $lte: new Date(moment(`${currentMonth}-01`).endOf("month").toDate()), // End of the current month
      },
    });

    const repaymentExistsForCurrentMonth = !!repayment;
    res.json({ exists: repaymentExistsForCurrentMonth });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getRepaymentLoanIdHandler = async (req, res) => {
  const repaymentId = req.params.id;

  try {
    const repayment = await repaymentModel.findById(repaymentId);

    if (!repayment) {
      return res.status(404).json({ message: "Repayment record not found" });
    }

    const loanId = repayment.loanId; // Assuming loanId is a field in the repayment model

    res.status(200).json({
      message: "Loan ID retrieved successfully",
      data: { repaymentId, loanId },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving loan ID from repayment record",
      error: error.message,
    });
  }
};
module.exports = {
  createRepayment,
  getAllRepayments,
  getRepaymentById,
  updateRepayment,
  deleteRepayment,
  checkRepaymentExistsHandler,
  getRepaymentLoanIdHandler,
};
