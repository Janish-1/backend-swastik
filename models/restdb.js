// models.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    memberNo: { type: String, required: true, unique: true },
    branchName: { type: String, required: true },
    fullName: { type: String, required: true },
    photo: { type: String }, // This could be a URL or path to the image file
    email: { type: String, required: true, unique: true },
    fatherName: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Others"] },
    maritalStatus: { type: String },
    dateOfBirth: { type: Date },
    currentAddress: { type: String },
    permanentAddress: { type: String },
    whatsAppNo: { type: Number },
    idProof: { type: String }, // Aadhar, Passport, Electricity Bill, etc.
    nomineeName: { type: String },
    relationship: { type: String },
    nomineeMobileNo: { type: Number },
    nomineeDateOfBirth: { type: Date },
    walletId: { type: Number, required: true, unique: true },
    numberOShares: { type: Number },
    signature: { type: String, required: true },
  },
  { collection: "members" }
);

const loanSchema = new mongoose.Schema(
  {
    loanId: { type: Number, required: true, unique: true },
    loanProduct: { type: String, required: true },
    memberName: { type: String, required: true },
    memberNo: { type: String, required: true },
    pan: { type: String, required: true },
    aadhar: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    appliedAmount: { type: Number, required: true },
    status: { type: String, required: true },
    account: { type: String, ref: "AccountModel", required: true },
    endDate: { type: Date }, // Optional field for the end date of the loan
    durationMonths: { type: Number }, // Optional field for the duration of the loan in months
    objections: { type: String },
  },
  { collection: "loans" }
);

const repaymentSchema = new mongoose.Schema(
  {
    loanId: { type: Number, ref: "loansModel", required: true },
    paymentDate: { type: Date },
    dueDate: { type: Date, required: true },
    dueAmount: { type: Number, required: true },
    principalAmount: { type: Number, required: true },
    interest: { type: Number, required: true },
    latePenalties: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    loanRepaymentStatus: { type: String, required: true },
    monthstatus: { type: String, required: true },
  },
  { collection: "repayments" }
);

const accountSchema = new mongoose.Schema(
  {
    accountNumber: { type: Number, required: true, unique: true },
    memberName: { type: String, required: true },
    memberNo: { type: String, required: true },
    email: { type: String, required: true },
    branchName: { type: String, required: true },
    accountType: { type: String },
    openingBalance: { type: Number, required: true },
    currentBalance: { type: Number, default: 0 },
    photo: { type: String }, // Assuming photo is stored as a String (URL, file path, etc.)
    fatherName: { type: String },
    gender: { type: String },
    maritalStatus: { type: String },
    dateOfBirth: { type: Date },
    currentAddress: { type: String },
    permanentAddress: { type: String },
    whatsAppNo: { type: String },
    idProof: { type: String }, // Assuming idProof is stored as a String (URL, file path, etc.)
    nomineeName: { type: String },
    relationship: { type: String },
    nomineeMobileNo: { type: String },
    nomineeDateOfBirth: { type: Date },
    approval: { type: String },
  },
  { collection: "accounts" }
);

const transactionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    member: { type: String, required: true },
    accountNumber: { type: String, required: true },
    currentBalancemoment: { type: Number, required: true },
    transactionAmount: { type: Number, required: true },
    debitOrCredit: { type: String, enum: ["Debit", "Credit"], required: true },
    status: { type: String, required: true },
    description: { type: String, required: true },
  },
  { collection: "transactions" }
);

const repaymentDetailsSchema = new mongoose.Schema(
  {
    repaymentId: { type: String, ref: "repaymentModel" },
    loanId: { type: String, ref: "loansModel" },
    accountId: { type: String, ref: "AccountModel" },
    paymentDate: { type: Date, default: Date.now },
    dueAmountPaid: { type: Number },
  },
  { collection: "RepaymentDetails" }
);

const memberModel = mongoose.model("Member", memberSchema);
const loansModel = mongoose.model("Loan", loanSchema);
const repaymentModel = mongoose.model("Repayment", repaymentSchema);
const AccountModel = mongoose.model("Account", accountSchema);
const TransactionsModel = mongoose.model("Transaction", transactionSchema);
const RepaymentDetails = mongoose.model("RepaymentDetails", repaymentDetailsSchema);

module.exports = {
  memberModel,
  loansModel,
  repaymentModel,
  AccountModel,
  TransactionsModel,
  RepaymentDetails
};
