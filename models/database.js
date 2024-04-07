const mongoose = require('mongoose');
const dotenv = require("dotenv");
const path = require("path");

// Specify the absolute path to your .env file
const envPath = path.resolve(__dirname, "../.env");

// Load environment variables from the specified .env file
dotenv.config({ path: envPath });

const uri = process.env.MONGODB_URI;

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

const memberModel = mongoose.model("members", memberSchema);
const loansModel = mongoose.model("loans", loanSchema);
const repaymentModel = mongoose.model("repayments", repaymentSchema);
const AccountModel = mongoose.model("accounts", accountSchema);
const TransactionsModel = mongoose.model("transactions", transactionSchema);
const RepaymentDetails = mongoose.model(
  "RepaymentDetails",
  repaymentDetailsSchema
);

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

loginDB = mongoose.createConnection(uri, {
  dbName: "logindatabase",
});

// Event handling for successful connection
loginDB.on("connected", () => {
  console.log("Connected to loginDB");
});

// Event handling for disconnection
loginDB.on("disconnected", () => {
  console.log("Disconnected from loginDB");
});

// Event handling for error
loginDB.on("error", (err) => {
  console.error("Connection error:", err);
});

const allusersModel = loginDB.model("allusers", userdetailsSchema);
const ExpenseModel = loginDB.model("expenses", expenseSchema);
const categoryModel = loginDB.model("category", categorySchema);
const Revenue = loginDB.model("Revenue", revenueSchema);
const walletModel = loginDB.model("wallet", walletschema);
const memberidsModel = loginDB.model("membersids", memberids);
const loanidModel = loginDB.model("loanids", loanids);
const accountidModel = loginDB.model("accountids", accountids);

module.exports = {
  allusersModel,
  ExpenseModel,
  categoryModel,
  Revenue,
  walletModel,
  memberidsModel,
  loanidModel,
  accountidModel,
  memberModel,
  loansModel,
  repaymentModel,
  AccountModel,
  TransactionsModel,
  RepaymentDetails,
  loginDB
}
