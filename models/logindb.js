// models.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    reference: { type: String, required: true },
    note: { type: String, required: true },
    branchName: { type: String, required: true },
  },
  { collection: "expenses" }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { collection: "category" }
);

const revenueSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    monthlyRevenue: { type: Number, required: true },
  },
  { collection: "Revenue" }
);

const walletschema = mongoose.Schema(
  {
    walletId: { type: Number, required: true, unique: true },
    numberOfShares: { type: Number, required: true },
  },
  { collection: "Wallet" }
);

const userdetailsSchema = new mongoose.Schema(
  {
    image: { type: String },
    dbName: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: {
      type: String,
      enum: ["user", "admin", "agent", "franchise", "manager"],
      default: "agent",
      required: true,
    },
    branchName: { type: String },
    contactphone: { type: Number },
    branchaddress: { type: String },
    qualification: { type: String },
    fatherName: { type: String },
    maritalStatus: { type: String },
    dob: { type: String },
    age: { type: String },
    aadhar: { type: String },
    panCard: { type: String },
    address: { type: String },
    permanentAddress: { type: String },
    mobile: { type: String },
    nomineeName: { type: String },
    nomineeRelationship: { type: String },
    nomineeDob: { type: String },
    nomineeMobile: { type: String },
    photo: { type: String },
    memberNo: { type: Number },
    branchCode: { type: Number },
  },
  { collection: "allusers" }
);

const memberids = new mongoose.Schema(
  {
    memberNo: { type: Number, unique: true },
  },
  { collection: "membersids" }
);

const loanids = new mongoose.Schema(
  {
    loanId: { type: Number, unique: true },
  },
  { collection: "loanids" }
);

const accountids = new mongoose.Schema(
  {
    accountNumber: { type: Number, unique: true },
  },
  { collection: "accountids" }
);

const allusersModel = mongoose.model("allusers", userdetailsSchema);
const ExpenseModel = mongoose.model("expenses", expenseSchema);
const categoryModel = mongoose.model("category", categorySchema);
const Revenue = mongoose.model("Revenue", revenueSchema);
const walletModel = mongoose.model("wallet", walletschema);
const memberidsModel = mongoose.model("membersids", memberids);
const loanidModel = mongoose.model("loanids", loanids);
const accountidModel = mongoose.model("accountids", accountids);

module.exports = {
  allusersModel,
  ExpenseModel,
  categoryModel,
  Revenue,
  walletModel,
  memberidsModel,
  loanidModel,
  accountidModel
};
