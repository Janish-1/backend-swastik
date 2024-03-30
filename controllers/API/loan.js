const { memberModel, loansModel, repaymentModel, AccountModel, TransactionsModel, RepaymentDetails } = require('../../models/restdb');
const { allusersModel, ExpenseModel, categoryModel, Revenue, walletModel, memberidsModel, loanidModel, accountidModel } = require("../../models/logindb");
const mongoose = require('mongoose');

const createLoan = async (req, res) => {
  const {
    loanId,
    loanProduct,
    memberName,
    memberNo,
    pan,
    aadhar,
    releaseDate,
    appliedAmount,
    status,
    account,
    endDate,
    durationMonths,
  } = req.body;

  try {
    const newLoan = new loansModel({
      loanId,
      loanProduct,
      memberName,
      memberNo,
      pan,
      aadhar,
      releaseDate,
      appliedAmount,
      status,
      account, // Convert account to ObjectId
      endDate,
      durationMonths,
    });

    await newLoan.save();

    try {
      await loanidModel.create({ loanId: loanId });
    } catch (error) {
      // // console.error(error);
    }

    res
      .status(200)
      .json({ message: "Loan data saved to MongoDB", data: newLoan });
  } catch (error) {
    // // console.error("Error saving loan data:", error);
    res.status(500).json({ message: "Error saving loan data" });
  }
};

const updateLoan = async (req, res) => {
  const loanId = req.params.id;
  const {
    loanProduct,
    memberName,
    memberNo,
    releaseDate,
    pan,
    aadhar,
    appliedAmount,
    status,
    account,
    endDate,
    durationMonths,
  } = req.body;

  try {
    const updatedLoan = await loansModel.findByIdAndUpdate(
      loanId,
      {
        loanProduct,
        memberName,
        memberNo,
        pan,
        aadhar,
        releaseDate,
        appliedAmount,
        status,
        account,
        endDate,
        durationMonths,
      },
      { new: true }
    );

    if (!updatedLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res
      .status(200)
      .json({ message: "Loan updated successfully", data: updatedLoan });
  } catch (error) {
    // // console.error("Error updating loan:", error);
    res.status(500).json({ message: "Error updating loan" });
  }
};

const deleteLoan = async (req, res) => {
  const loanId = req.params.id;
  try {
    const deletedLoan = await loansModel.findByIdAndDelete(loanId);

    if (!deletedLoan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res
      .status(200)
      .json({ message: "Loan deleted successfully", data: deletedLoan });
  } catch (error) {
    // // console.error("Error deleting loan:", error);
    res.status(500).json({ message: "Error deleting loan" });
  }
};

const getAllLoans = async (req, res) => {
  try {
    const allLoans = await loansModel.find();

    res
      .status(200)
      .json({ message: "All loans retrieved successfully", data: allLoans });
  } catch (error) {
    // // console.error("Error retrieving loans:", error);
    res.status(500).json({ message: "Error retrieving loans" });
  }
};

const getLoansByMember = async (req, res) => {
  try {
    const memberNo = req.params.memberNo;

    // Find loans based on the provided member number
    const loans = await loansModel.find({ memberNo });

    res.status(200).json({
      message: "Loans retrieved successfully for the member",
      data: loans,
    });
  } catch (error) {
    // // console.error("Error retrieving loans:", error);
    res.status(500).json({ message: "Error retrieving loans" });
  }
};

const getLoanById = async (req, res) => {
  const loanId = req.params.id;

  try {
    const loan = await loansModel.findById(loanId);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res
      .status(200)
      .json({ message: "Loan retrieved successfully", data: loan });
  } catch (error) {
    // // console.error("Error retrieving loan:", error);
    res.status(500).json({ message: "Error retrieving loan" });
  }
};

const getLoanMembers = async (req, res) => {
  try {
    const allMembers = await memberModel.find({}, { memberNo: 1, _id: 0 });

    const memberNumbers = allMembers.map((member) => member.memberNo);

    res.status(200).json({
      message: "All member numbers retrieved successfully",
      data: memberNumbers,
    });
  } catch (error) {
    // // console.error("Error retrieving member numbers:", error); // Log the specific error
    res.status(500).json({ message: "Error retrieving member numbers" });
  }
};

const getApprovedLoans = async (req, res) => {
  try {
    const approvedLoans = await loansModel.find(
      { status: "Approved" },
      { loanId: 1, _id: 0 }
    );
    repaymen;
    res.status(200).json({
      message: "Approved loans retrieved successfully",
      data: approvedLoans,
    });
  } catch (error) {
    // // console.error("Error fetching approved loans:", error);
    res.status(500).json({ message: "Error fetching approved loans" });
  }
};

const getApprovedLoansNotInRepayment = async (req, res) => {
  try {
    // Fetch all loan IDs in the repayment model
    const repaymentLoans = await repaymentModel.find({}, { loanId: 1, _id: 0 });
    const repaymentLoanIds = repaymentLoans.map(
      (repayment) => repayment.loanId
    );

    // Fetch approved loans that are not in the repayment model
    const approvedLoansNotInRepayment = await loansModel.find(
      { status: "Approved", loanId: { $nin: repaymentLoanIds } },
      { loanId: 1, _id: 0 }
    );

    res.status(200).json({
      message: "Approved loans not in repayment retrieved successfully",
      data: approvedLoansNotInRepayment,
    });
  } catch (error) {
    // Handle the error or log it
    // console.error("Error fetching approved loans not in repayment:", error);
    res
      .status(500)
      .json({ message: "Error fetching approved loans not in repayment" });
  }
};

const generateLoanReport = async (req, res) => {
  try {
    const { startDate, endDate, loanType, memberNo } = req.body;
    let query = {};

    // Adding filters based on provided request body
    if (startDate && endDate) {
      query.releaseDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (loanType) {
      query.status = loanType;
    }

    if (memberNo) {
      query.memberNo = memberNo;
    }

    // Filtering loans data based on query
    const loans = await loansModel.find(query);

    // Fetching dueAmount for each loanId
    const mergedData = await Promise.all(
      loans.map(async (loan) => {
        const repayment = await repaymentModel.findOne({ loanId: loan.loanId });
        return {
          loanId: loan.loanId,
          loanProduct: loan.loanProduct,
          memberName: loan.memberName,
          memberNo: loan.memberNo,
          releaseDate: loan.releaseDate,
          appliedAmount: loan.appliedAmount,
          status: loan.status,
          dueAmount: repayment ? repayment.dueAmount : null,
        };
      })
    );

    res.status(200).json(mergedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLoanDue = async (req, res) => {
  try {
    // Fetching loans data
    const loans = await loansModel.find({}, "loanId memberNo memberName");

    // Fetching repayments data with specific fields
    const repayments = await repaymentModel.find(
      {},
      "loanId totalAmount fieldName1 fieldName2"
    );

    // Processing the data to calculate total due for each loan
    const processedData = loans.map((loan) => {
      const loanRepayments = repayments.filter(
        (repayment) => repayment.loanId.toString() === loan.loanId.toString()
      );
      const totalDue = loanRepayments.reduce(
        (total, repayment) => total + repayment.totalAmount,
        0
      );
      return {
        loanId: loan.loanId,
        memberNo: loan.memberNo,
        memberName: loan.memberName,
        totalDue: totalDue,
      };
    });

    res.status(200).json(processedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const pendingLoansHandler = async (req, res) => {
  try {
    const pendingLoans = await loansModel.find({ status: "Pending" });

    res.status(200).json({ data: pendingLoans });
  } catch (error) {
    // // console.error("Error retrieving pending loans:", error);
    res.status(500).json({ message: "Error retrieving pending loans" });
  }
};

const totalLoansHandler = async (req, res) => {
  try {
    const totalLoans = await loansModel.countDocuments();

    res.status(200).json({ totalLoans });
  } catch (error) {
    // // console.error("Error retrieving total number of loans:", error);
    res.status(500).json({ message: "Error retrieving total number of loans" });
  }
};

const getTotalLoanAmountHandler = async (req, res) => {
  try {
    const totalLoanAmount = await loansModel.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$appliedAmount" },
        },
      },
    ]);

    if (totalLoanAmount.length > 0) {
      res.json({ totalLoanAmount: totalLoanAmount[0].totalAmount });
    } else {
      res.json({ totalLoanAmount: 0 });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const approveLoanHandler = async (req, res) => {
  const { loanId } = req.params;

  try {
    // Assuming you have a LoanModel or a similar model/schema
    const loan = await loansModel.findByIdAndUpdate(
      loanId,
      { status: "Approved" },
      { new: true }
    );

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json({ message: "Loan status updated to Approved", loan });
  } catch (error) {
    res.status(500).json({
      message: "Error updating loan status to Approved",
      error: error.message,
    });
  }
};

const cancelLoanHandler = async (req, res) => {
  const { loanId } = req.params;

  try {
    // Assuming you have a LoanModel or a similar model/schema
    const loan = await loansModel.findByIdAndUpdate(
      loanId,
      { status: "Cancelled" },
      { new: true }
    );

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res.status(200).json({ message: "Loan status updated to Cancelled", loan });
  } catch (error) {
    res.status(500).json({
      message: "Error updating loan status to Cancelled",
      error: error.message,
    });
  }
};

const updateObjectionHandler = async (req, res) => {
  const { loanId } = req.params;
  const { reason } = req.body;

  try {
    // Assuming you have a LoansModel or a similar model/schema
    const loan = await loansModel.findByIdAndUpdate(
      loanId,
      { objections: reason },
      { new: true }
    );

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    res
      .status(200)
      .json({ message: "Objection column updated successfully", loan });
  } catch (error) {
    res.status(500).json({
      message: "Error updating objection column",
      error: error.message,
    });
  }
};

const updatePaymentAndCreateDetailsHandler = async (req, res) => {
  try {
    const repaymentId = req.params.repaymentId;

    // Fetch repayment details using repayment ID
    const repayment = await repaymentModel.findOne({ _id: repaymentId });
    if (!repayment) {
      return res.status(404).json({ message: "Repayment not found" });
    }

    // Fetch associated loan using loanId from repayment
    const loan = await loansModel.findOne({ loanId: repayment.loanId });
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    const accountNumber = Number(loan.account);

    // Fetch associated account using memberNo from loan
    const account = await AccountModel.findOne({
      accountNumber: accountNumber,
    });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    // Deduct dueAmount from currentBalance, update payment data, and deduct from totalAmount
    account.currentBalance -= repayment.dueAmount;
    repayment.totalAmount -= repayment.dueAmount;
    repayment.paymentDate = new Date(); // Set payment date to current date or the date of payment

    // Calculate the next due date by adding a month to the current due date
    const dueDate = new Date(repayment.dueDate); // Clone the current due date
    dueDate.setMonth(dueDate.getMonth() + 1);

    // Update the repayment due date
    repayment.dueDate = dueDate;

    if (loan.endDate <= repayment.dueDate) {
      repayment.loanRepaymentStatus = "completed";
    }

    // Create RepaymentDetails document
    const repaymentDetails = new RepaymentDetails({
      repaymentId: repayment.repaymentId,
      loanId: repayment.loanId,
      accountId: account.accountNumber,
      paymentDate: repayment.paymentDate,
      dueAmountPaid: repayment.dueAmount,
    });

    // Save changes and create RepaymentDetails document
    await account.save();
    await repayment.save();
    await repaymentDetails.save();

    res.json({
      message:
        "Payment data updated and RepaymentDetails created successfully",
    });
  } catch (error) {
    // // console.error(
    //   "Error updating payment data and creating RepaymentDetails:",
    //   error
    // );
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createLoan,
  updateLoan,
  deleteLoan,
  getAllLoans,
  getLoansByMember,
  getLoanById,
  getLoanMembers,
  getApprovedLoans,
  getApprovedLoansNotInRepayment,
  generateLoanReport,
  getLoanDue,
  pendingLoansHandler,
  totalLoansHandler,
  getTotalLoanAmountHandler,
  approveLoanHandler,
  cancelLoanHandler,
  updateObjectionHandler,
  updatePaymentAndCreateDetailsHandler,
};
