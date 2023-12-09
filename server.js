const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const moment = require('moment');
// Specify the absolute path to your .env file
const envPath = path.resolve(__dirname, "../.env");

// Load environment variables from the specified .env file
dotenv.config({ path: envPath });

require("dotenv").config(); // Load environment variables from .env file

const uri = process.env.MONGODB_URI;

const app = express();
const PORT = 3001;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Specifying database
  dbName: "devdb",
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB Atlas");
});

app.use(bodyParser.json());
app.use(cors());

const uploadDir = "uploads";

// Check if the directory exists, create it if it doesn't
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// User login database
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    businessName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    branch: { type: String, required: true },
    countryCode: { type: String, required: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    address: { type: String, required: true },
    creditSource: { type: String, required: true },
    role: { type: String, required: true },
  },
  { collection: "userdata" }
);

const branchesSchema = new mongoose.Schema(
  {
    branchName: { type: String, required: true, unique: true },
    managerName: { type: String, required: true },
    contactemail: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactphone: { type: Number, required: true, unique: true },
    branchaddress: { type: String, required: true },
  },
  { collection: "branches" }
);

const memberSchema = new mongoose.Schema(
  {
    memberNo: { type: Number, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    branchName: { type: String, required: true },
    aadhar: { type: String, required: true },
    pancard: { type: String, required: true },
  },
  { collection: "members" }
);

const loanSchema = new mongoose.Schema(
  {
    loanId: { type: Number, required: true, unique: true },
    loanProduct: { type: String, required: true },
    borrower: { type: String, required: true },
    memberNo: { type: Number, required: true },
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
    loanId: { type: String, ref: "loansModel", required: true },
    paymentDate: { type: Date },
    dueDate: { type: Date, required: true },
    dueAmount: { type: Number, required: true },
    principalAmount: { type: Number, required: true },
    interest: { type: Number, required: true },
    latePenalties: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
  },
  { collection: "repayments" }
);

const accountSchema = new mongoose.Schema(
  {
    accountNumber: { type: Number, required: true, unique: true },
    memberName: { type: String, required: true },
    memberNo: { type: Number, required: true },
    email: { type: String, required: true },
    branchName: { type: String, required: true },
    aadhar: { type: String, required: true },
    pancard: { type: String, required: true },
    accountType: { type: String, required: true },
    openingBalance: { type: Number, required: true },
    currentBalance: { type: Number, required: true, default: 0 },
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

const expenseSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    reference: { type: String, required: true },
    note: { type: String, required: true },
  },
  { collection: "expenses" }
);

const intuserSchema = new mongoose.Schema(
  {
    image: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Adding password field
    userType: {
      type: String,
      enum: ["user", "admin", "agent", "franchise"],
      default: "user",
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { collection: "intuserdata" }
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

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { collection: "category" }
);

const revenueSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    monthlyRevenue: {
      type: Number,
      required: true,
    },
    // Add other fields if needed
  },
  { collection: "Revenue" }
);

const userdetailsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Adding password field
    userType: {
      type: String,
      enum: ["user", "admin", "agent", "franchise", "manager"],
      default: "user",
    },
  },
  { collection: "allusers" }
);

const userModel = mongoose.model("userdata", userSchema);
const branchesModel = mongoose.model("branches", branchesSchema);
const memberModel = mongoose.model("members", memberSchema);
const loansModel = mongoose.model("loans", loanSchema);
const repaymentModel = mongoose.model("repayments", repaymentSchema);
const AccountModel = mongoose.model("accounts", accountSchema);
const TransactionsModel = mongoose.model("transactions", transactionSchema);
const ExpenseModel = mongoose.model("expenses", expenseSchema);
const intuserModel = mongoose.model("intuserdata", intuserSchema);
const categoryModel = mongoose.model("category", categorySchema);
const Revenue = mongoose.model("Revenue", revenueSchema); // Assuming you have a Revenue model defined
const allusersModel = mongoose.model("allusers", userdetailsSchema);
const RepaymentDetails = mongoose.model("RepaymentDetails",repaymentDetailsSchema);

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Uploads directory where files will be stored
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const fileExtension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${fileExtension}`);
  },
});

const upload = multer({ storage });

// Set security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Frame-Options", "deny");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  next();
});

// Implement rate limiting (example using 'express-rate-limit' middleware)
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
});

// Create Function for User
app.post("/create", limiter, async (req, res) => {
  const {
    firstName,
    lastName,
    businessName,
    email,
    branch,
    countryCode,
    mobile,
    password,
    gender,
    city,
    state,
    zipCode,
    address,
    creditSource,
  } = req.body;

  let role = "user";
  const userEmailDomain = email.split("@")[1]; // Extract domain from email
  console.log("User email domain:", userEmailDomain); // Check the extracted domain
  if (userEmailDomain === "yourcompany.com") {
    role = "admin"; // Assign admin role for specific email domain
    console.log("User role:", role); // Check the role being assigned
  }

  try {
    const newUser = new userModel({
      firstName,
      lastName,
      businessName,
      email,
      branch,
      countryCode,
      mobile,
      password,
      gender,
      city,
      state,
      zipCode,
      address,
      creditSource,
      role,
    });

    await newUser.save();

    res
      .status(200)
      .json({ message: "User data saved to MongoDB", data: newUser });
  } catch (error) {
    console.error("Error saving user data:", error);
    res.status(500).json({ message: "Error saving user data" });
  }
});

app.post("/login", limiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Admin Franchise agent User
    // This is not secure - comparing passwords in plaintext
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    // If the passwords match, create a JWT
    const payload = {
      userId: user._id,
      email: user.email,
      username: user.firstName,
      password: user.password,
      // Add other necessary user information to the payload
    };

    const token = jwt.sign(payload, "yourSecretKey", { expiresIn: "1h" }); // Set your own secret key and expiration time

    res.json({ message: "Login Success!", token });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/verify-token", (req, res) => {
  const token = req.header("Authorization").replace("Bearer ", "");

  // Verify the token
  jwt.verify(token, "yourSecretKey", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    // Token is valid
    // You might perform additional checks or operations based on the decoded token data

    res.status(200).json({ message: "Token is valid" });
  });
});

// Read Function
app.get("/read", limiter, async (req, res) => {
  try {
    // Fetch Data From Collection
    const data = await userModel.find();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error); // Log error for debugging
    res.status(500).json({ message: "Failed to fetch data" });
  }
});

// Assuming you have already set up your app and UserModel as described above

app.put("/update/:id", limiter, async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, password, role, security } = req.body;

  try {
    const filter = { _id: id }; // Filter to find the user by id
    const update = { firstName, lastName, email, password, role, security }; // Creates a new updated object

    const updatedUser = await userModel.findOneAndUpdate(
      filter,
      update,
      { new: true } // Returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User data updated", data: updatedUser });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ message: "Error updating user data" });
  }
});

app.post("/delete/:id", limiter, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await userModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", data: deletedUser });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// Endpoint to handle the incoming POST request with the token
app.post("/usernamedata", (req, res) => {
  const { token } = req.body;
  // Check if the token exists
  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }

  try {
    // Verify and decode the token to extract the username
    const decoded = jwt.verify(token, "yourSecretKey");

    // Extract the username from the decoded token payload
    const { username } = decoded;

    // Send the decoded username back to the client
    res.json({ username });
  } catch (err) {
    // Handle token verification or decoding errors
    console.error("Token verification error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
});

// Create Function for Account
app.post("/createbranch", limiter, async (req, res) => {
  const {
    branchName,
    managerName,
    contactemail,
    password,
    contactphone,
    branchaddress,
  } = req.body;

  try {
    const newUser = new branchesModel({
      branchName,
      managerName,
      contactemail,
      password,
      contactphone,
      branchaddress,
    });

    await newUser.save();

    res
      .status(200)
      .json({ message: "User data saved to MongoDB", data: newUser });
  } catch (error) {
    console.error("Error saving user data:", error);
    res.status(500).json({ message: "Error saving user data" });
  }
});

app.put("/updatebranch/:id", limiter, async (req, res) => {
  const branchId = req.params.id;
  const {
    branchName,
    managerName,
    contactemail,
    password,
    contactphone,
    branchaddress,
  } = req.body;

  try {
    const updatedBranch = await branchesModel.findByIdAndUpdate(
      branchId,
      {
        branchName,
        managerName,
        contactemail,
        password,
        contactphone,
        branchaddress,
      },
      { new: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res
      .status(200)
      .json({ message: "Branch updated successfully", data: updatedBranch });
  } catch (error) {
    console.error("Error updating branch:", error);
    res.status(500).json({ message: "Error updating branch" });
  }
});

app.post("/deletebranch/:id", limiter, async (req, res) => {
  const branchId = req.params.id;
  try {
    const deletedBranch = await branchesModel.findByIdAndDelete(branchId);

    if (!deletedBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res
      .status(200)
      .json({ message: "Branch deleted successfully", data: deletedBranch });
  } catch (error) {
    console.error("Error deleting branch:", error);
    res.status(500).json({ message: "Error deleting branch" });
  }
});

app.get("/readbranch", limiter, async (req, res) => {
  try {
    const allBranches = await branchesModel.find();

    res.status(200).json({
      message: "All branches retrieved successfully",
      data: allBranches,
    });
  } catch (error) {
    console.error("Error retrieving branches:", error);
    res.status(500).json({ message: "Error retrieving branches" });
  }
});

// GET branch by ID
app.get("/getbranch/:id", async (req, res) => {
  const branchId = req.params.id;

  try {
    // Find the branch by ID in your MongoDB database using Mongoose
    const branch = await branchesModel.findById(branchId);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // If the branch is found, send it as a response
    res.status(200).json(branch);
  } catch (error) {
    console.error("Error retrieving branch:", error);
    res.status(500).json({ message: "Error retrieving branch" });
  }
});

// Define an endpoint to fetch branch names
app.get("/branches/names", limiter, async (req, res) => {
  try {
    const allBranches = await branchesModel.find({}, { branchName: 1, _id: 0 });

    const branchNames = allBranches.map((branch) => branch.branchName);

    res.status(200).json({
      message: "All branch names retrieved successfully",
      data: branchNames,
    });
  } catch (error) {
    console.error("Error retrieving branch names:", error);
    res.status(500).json({ message: "Error retrieving branch names" });
  }
});

app.post("/createmember", limiter, async (req, res) => {
  const {
    memberNo,
    firstName,
    lastName,
    email,
    branchName,
    aadhar,
    pancard,
    accountType,
  } = req.body;

  try {
    const newMember = new memberModel({
      memberNo,
      firstName,
      lastName,
      email,
      branchName,
      aadhar,
      pancard,
      accountType,
    });

    await newMember.save();

    res
      .status(200)
      .json({ message: "Member data saved to MongoDB", data: newMember });
  } catch (error) {
    console.error("Error saving member data:", error);
    res.status(500).json({ message: "Error saving member data" });
  }
});

app.put("/updatemember/:id", limiter, async (req, res) => {
  const memberId = req.params.id;
  const {
    memberNo,
    firstName,
    lastName,
    email,
    branchName,
    aadhar,
    pancard,
    accountType,
  } = req.body;

  try {
    const updatedMember = await memberModel.findByIdAndUpdate(
      memberId,
      {
        memberNo,
        firstName,
        lastName,
        email,
        branchName,
        aadhar,
        pancard,
        accountType,
      },
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res
      .status(200)
      .json({ message: "Member updated successfully", data: updatedMember });
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({ message: "Error updating member" });
  }
});

app.post("/deletemember/:id", limiter, async (req, res) => {
  const memberId = req.params.id;
  try {
    const deletedMember = await memberModel.findByIdAndDelete(memberId);

    if (!deletedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res
      .status(200)
      .json({ message: "Member deleted successfully", data: deletedMember });
  } catch (error) {
    console.error("Error deleting member:", error);
    res.status(500).json({ message: "Error deleting member" });
  }
});

app.get("/readmembers", limiter, async (req, res) => {
  try {
    const allMembers = await memberModel.find();

    res.status(200).json({
      message: "All members retrieved successfully",
      data: allMembers,
    });
  } catch (error) {
    console.error("Error retrieving members:", error);
    res.status(500).json({ message: "Error retrieving members" });
  }
});

app.get("/readmembersname", limiter, async (req, res) => {
  try {
    const allMembers = await memberModel.find({}, "firstName lastName"); // Fetch 'firstName' and 'lastName' fields

    const memberNames = allMembers.map((member) => ({
      name: `${member.firstName} ${member.lastName}`, // Concatenate 'firstName' and 'lastName'
    }));

    res.status(200).json({
      message: "All member names retrieved successfully",
      data: memberNames,
    });
  } catch (error) {
    console.error("Error retrieving member names:", error);
    res.status(500).json({ message: "Error retrieving member names" });
  }
});

app.get("/readmemberids", limiter, async (req, res) => {
  try {
    const allMembers = await memberModel.find({}, "memberNo"); // Fetch only the '_id' field

    const memberIds = allMembers.map((member) => ({
      id: member.memberNo, // Retrieve '_id' field
    }));

    res.status(200).json({
      message: "All member IDs retrieved successfully",
      data: memberIds,
    });
  } catch (error) {
    console.error("Error retrieving member IDs:", error);
    res.status(500).json({ message: "Error retrieving member IDs" });
  }
});

// GET member by ID
app.get("/getmember/:id", async (req, res) => {
  const memberId = req.params.id;

  try {
    // Find the member by ID in your MongoDB database using Mongoose
    const member = await memberModel.findById(memberId);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // If the member is found, send it as a response
    res.status(200).json(member);
  } catch (error) {
    console.error("Error retrieving member:", error);
    res.status(500).json({ message: "Error retrieving member" });
  }
});

// POST endpoint to create a new loan with a specified account ID
app.post("/createloan", limiter, async (req, res) => {
  const {
    loanId,
    loanProduct,
    borrower,
    memberNo,
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
      borrower,
      memberNo,
      releaseDate,
      appliedAmount,
      status,
      account, // Convert account to ObjectId
      endDate,
      durationMonths,
    });

    await newLoan.save();

    res
      .status(200)
      .json({ message: "Loan data saved to MongoDB", data: newLoan });
  } catch (error) {
    console.error("Error saving loan data:", error);
    res.status(500).json({ message: "Error saving loan data" });
  }
});

// PUT endpoint to update an existing loan's details along with its associated account
app.put("/updateloan/:id", limiter, async (req, res) => {
  const loanId = req.params.id;
  const {
    loanProduct,
    borrower,
    memberNo,
    releaseDate,
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
        borrower,
        memberNo,
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
    console.error("Error updating loan:", error);
    res.status(500).json({ message: "Error updating loan" });
  }
});

app.delete("/deleteloan/:id", limiter, async (req, res) => {
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
    console.error("Error deleting loan:", error);
    res.status(500).json({ message: "Error deleting loan" });
  }
});

// GET endpoint to fetch all loans
app.get("/loans", limiter, async (req, res) => {
  try {
    const allLoans = await loansModel.find();

    res
      .status(200)
      .json({ message: "All loans retrieved successfully", data: allLoans });
  } catch (error) {
    console.error("Error retrieving loans:", error);
    res.status(500).json({ message: "Error retrieving loans" });
  }
});

// GET endpoint to fetch a specific loan by its ID
app.get("/loans/:id", limiter, async (req, res) => {
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
    console.error("Error retrieving loan:", error);
    res.status(500).json({ message: "Error retrieving loan" });
  }
});

app.get("/loanmembers", limiter, async (req, res) => {
  try {
    const allMembers = await memberModel.find({}, { memberNo: 1, _id: 0 });

    const memberNumbers = allMembers.map((member) => member.memberNo);

    res.status(200).json({
      message: "All member numbers retrieved successfully",
      data: memberNumbers,
    });
  } catch (error) {
    console.error("Error retrieving member numbers:", error); // Log the specific error
    res.status(500).json({ message: "Error retrieving member numbers" });
  }
});

app.post("/repayments", async (req, res) => {
  try {
    const {
      loanId,
      paymentDate,
      dueDate,
      dueAmount,
      principalAmount,
      interest,
      latePenalties,
      totalAmount,
    } = req.body;

    const newRepayment = new repaymentModel({
      loanId,
      paymentDate,
      dueDate,
      dueAmount,
      principalAmount,
      interest,
      latePenalties,
      totalAmount,
    });

    const savedRepayment = await newRepayment.save();
    res
      .status(200)
      .json({ message: "Repayment record created", data: savedRepayment });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create repayment record",
      error: error.message,
    });
  }
});

app.get("/repayments", async (req, res) => {
  try {
    const allRepayments = await repaymentModel.find();

    res.status(200).json({
      message: "All repayment records retrieved successfully",
      data: allRepayments,
    });
  } catch (error) {
    console.error("Error retrieving repayment records:", error);
    res.status(500).json({
      message: "Error retrieving repayment records",
      error: error.message,
    });
  }
});

app.get("/repayments/:id", async (req, res) => {
  const repaymentId = req.params.id;

  try {
    const repayment = await repaymentModel.findById(repaymentId);

    if (!repayment) {
      return res.status(404).json({ message: "Repayment record not found" });
    }

    res.status(200).json({
      message: "Repayment record retrieved successfully",
      data: repayment,
    });
  } catch (error) {
    console.error("Error retrieving repayment record:", error);
    res.status(500).json({
      message: "Error retrieving repayment record",
      error: error.message,
    });
  }
});

app.put("/repayments/:id", async (req, res) => {
  try {
    const repaymentId = req.params.id;
    const {
      loanId,
      paymentDate,
      dueDate,
      dueAmount,
      principalAmount,
      interest,
      latePenalties,
      totalAmount,
    } = req.body;

    const updatedRepayment = await repaymentModel.findByIdAndUpdate(
      repaymentId,
      {
        loanId,
        paymentDate,
        dueDate,
        principalAmount,
        interest,
        latePenalties,
        totalAmount,
      },
      { new: true }
    );

    if (!updatedRepayment) {
      return res.status(404).json({ message: "Repayment record not found" });
    }

    res
      .status(200)
      .json({ message: "Repayment record updated", data: updatedRepayment });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update repayment record",
      error: error.message,
    });
  }
});

app.delete("/repayments/:id", async (req, res) => {
  const repaymentId = req.params.id;
  try {
    const deletedRepayment = await repaymentModel.findByIdAndDelete(
      repaymentId
    );

    if (!deletedRepayment) {
      return res.status(404).json({ message: "Repayment record not found" });
    }

    res.status(200).json({
      message: "Repayment record deleted successfully",
      data: deletedRepayment,
    });
  } catch (error) {
    console.error("Error deleting repayment record:", error);
    res.status(500).json({
      message: "Error deleting repayment record",
      error: error.message,
    });
  }
});

// GET endpoint to fetch approved loan IDs
app.get("/approvedLoans", async (req, res) => {
  try {
    const approvedLoans = await loansModel.find(
      { status: "Approved" },
      { loanId: 1, _id: 0 }
    );
    res.status(200).json({
      message: "Approved loans retrieved successfully",
      data: approvedLoans,
    });
  } catch (error) {
    console.error("Error fetching approved loans:", error);
    res.status(500).json({ message: "Error fetching approved loans" });
  }
});

// POST endpoint to create a new account
app.post("/createaccounts", async (req, res) => {
  try {
    const account = await AccountModel.create(req.body);
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET endpoint to fetch all accounts
app.get("/accounts", async (req, res) => {
  try {
    const allAccounts = await AccountModel.find();

    res.status(200).json({
      message: "All accounts retrieved successfully",
      data: allAccounts,
    });
  } catch (error) {
    console.error("Error retrieving accounts:", error);
    res.status(500).json({ message: "Error retrieving accounts" });
  }
});

// GET endpoint to fetch a specific account by its ID
app.get("/accounts/:id", async (req, res) => {
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
    console.error("Error retrieving account:", error);
    res.status(500).json({ message: "Error retrieving account" });
  }
});

app.get("/accountids", limiter, async (req, res) => {
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
    console.error("Error retrieving account numbers:", error);
    res.status(500).json({ message: "Error retrieving account numbers" });
  }
});

// PUT endpoint to update an account by its ID
app.put("/updateaccounts/:id", async (req, res) => {
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
});

// Get all account numbers
app.get("/readaccountnumbers", async (req, res) => {
  try {
    const accountNumbers = await AccountModel.find({}, "accountNumber");
    const numbers = accountNumbers.map((account) => account.accountNumber);
    res.json(numbers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an account by ID
app.delete("/deleteaccounts/:id", async (req, res) => {
  try {
    const account = await AccountModel.findByIdAndDelete(req.params.id);
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST endpoint to create a new transaction
app.post("/transactions", async (req, res) => {
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

    // console.log('Current Balance:', account.currentBalance);
    // console.log('transacation amount:', transactionAmount);
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
});

// GET endpoint to fetch all transactions
app.get("/transactions", async (req, res) => {
  try {
    const allTransactions = await TransactionsModel.find();

    res.status(200).json({
      message: "All transactions retrieved successfully",
      data: allTransactions,
    });
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    res.status(500).json({ message: "Error retrieving transactions" });
  }
});

// GET endpoint to fetch a specific transaction by its ID
app.get("/transactions/:id", async (req, res) => {
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
    console.error("Error retrieving transaction:", error);
    res.status(500).json({ message: "Error retrieving transaction" });
  }
});

// Delete endpoint to remove a specific transaction by its ID
app.delete("/transactions/:id", async (req, res) => {
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
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Error deleting transaction" });
  }
});

// PUT endpoint to update a transaction by its ID
app.put("/transactions/:id", async (req, res) => {
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
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Error updating transaction" });
  }
});

// Create Expense
app.post("/expenses", async (req, res) => {
  try {
    const { date, category, amount, reference, note } = req.body;
    const newExpense = new ExpenseModel({
      date,
      category,
      amount,
      reference,
      note,
    });
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating expense", error: error.message });
  }
});

// Read all Expenses
app.get("/expenses", async (req, res) => {
  try {
    const expenses = await ExpenseModel.find();
    res.json(expenses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving expenses", error: error.message });
  }
});

// Update Expense
app.put("/expenses/:id", async (req, res) => {
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
});

// Delete Expense
app.delete("/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await ExpenseModel.findByIdAndDelete(id);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error deleting expense", error: error.message });
  }
});

// Route to add a new user to the database
app.post("/users", upload.single("image"), async (req, res) => {
  try {
    const { name, email, password, userType, status } = req.body;

    // Get the file path of the uploaded image
    const imagePath = req.file.path;

    // Create a new user object with Mongoose User model
    const newUser = new intuserModel({
      name,
      email,
      password,
      userType,
      status,
      image: imagePath, // Assign the file path to the user's image property
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    res
      .status(201)
      .json({ message: "User created successfully!", user: savedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
});

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await intuserModel.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a user by ID
app.get("/usersdetails/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await intuserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to update an existing user in the database
app.put("/updateintuser/:id", upload.single("image"), async (req, res) => {
  try {
    const userId = req.params.id; // Extract the user ID from the request parameters
    const { name, email, password, userType, status } = req.body;

    let updatedUserData = {
      name,
      email,
      password,
      userType,
      status,
    };

    // Check if an image was uploaded and update the image path if needed
    if (req.file) {
      updatedUserData.image = req.file.path;
    }

    // Find the user by ID and update the user data
    const updatedUser = await intuserModel.findByIdAndUpdate(
      userId,
      updatedUserData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully!", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
});

// Delete a user by ID
app.delete("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Find and delete the user entry from the database
    const deletedUser = await intuserModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ deletedUser, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for handling file upload
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Logic to store the file path in your database (replace this with your database storage logic)
  const filePath = req.file.path; // File path where the image is stored
  // Store `filePath` in your database associated with the user or as needed

  return res.status(200).json({ filePath });
});

app.get("/accountstatement", async (req, res) => {
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
});

// Endpoint to fetch data based on filters sent in the request body
app.post("/loanreport", async (req, res) => {
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

    // Fetching corresponding repayment data for filtered loans
    const loanIds = loans.map((loan) => loan.loanId);
    const repayments = await repaymentModel.find({ loanId: { $in: loanIds } });

    // Merging repayments data into loans data based on loanId
    const mergedData = loans.map((loan) => {
      const correspondingRepayment = repayments.find(
        (repayment) => repayment.loanId === loan.loanId
      );
      return {
        loanId: loan.loanId,
        loanProduct: loan.loanProduct,
        borrower: loan.borrower,
        memberNo: loan.memberNo,
        releaseDate: loan.releaseDate,
        appliedAmount: loan.appliedAmount,
        status: loan.status,
        dueAmount: correspondingRepayment
          ? correspondingRepayment.dueAmount
          : null,
      };
    });

    res.status(200).json(mergedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/loandue", async (req, res) => {
  try {
    // Fetching loans data
    const loans = await loansModel.find({}, "loanId memberNo borrower");

    // Fetching repayments data
    const repayments = await repaymentModel.find({}, "loanId dueAmount");

    // Processing the data to calculate total due for each loan
    const processedData = loans.map((loan) => {
      const loanRepayments = repayments.filter(
        (repayment) => repayment.loanId === loan.loanId
      );
      const totalDue = loanRepayments.reduce(
        (total, repayment) => total + repayment.dueAmount,
        0
      );
      return {
        loanId: loan.loanId,
        memberNo: loan.memberNo,
        borrower: loan.borrower,
        totalDue: totalDue,
      };
    });

    res.status(200).json(processedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/transactionreport", async (req, res) => {
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
});

app.get("/reportexpenses", async (req, res) => {
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
});

// Create a new category
app.post("/categories", async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new categoryModel({ name });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all categories
app.get("/categories", async (req, res) => {
  try {
    const categories = await categoryModel.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single category by ID
app.get("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a category by ID
app.put("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a category by ID
app.delete("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await categoryModel.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/countMembers", limiter, async (req, res) => {
  try {
    const count = await memberModel.countDocuments();

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error counting members:", error);
    res.status(500).json({ message: "Error counting members" });
  }
});

// Endpoint to get the number of deposit requests pending
app.get("/depositRequestsPending", async (req, res) => {
  try {
    const depositRequestsPending = await TransactionsModel.countDocuments({
      debitOrCredit: "Credit",
      status: "Pending",
    });

    res.status(200).json({ count: depositRequestsPending });
  } catch (error) {
    console.error("Error retrieving deposit requests pending:", error);
    res
      .status(500)
      .json({ message: "Error retrieving deposit requests pending" });
  }
});

// Endpoint to get the number of withdraw requests pending
app.get("/withdrawRequestsPending", async (req, res) => {
  try {
    const withdrawRequestsPending = await TransactionsModel.countDocuments({
      debitOrCredit: "Debit",
      status: "Pending",
    });

    res.status(200).json({ count: withdrawRequestsPending });
  } catch (error) {
    console.error("Error retrieving withdraw requests pending:", error);
    res
      .status(500)
      .json({ message: "Error retrieving withdraw requests pending" });
  }
});

// GET endpoint to fetch pending loans
app.get("/pendingLoans", async (req, res) => {
  try {
    const pendingLoans = await loansModel.find({ status: "Pending" });

    res.status(200).json({ data: pendingLoans });
  } catch (error) {
    console.error("Error retrieving pending loans:", error);
    res.status(500).json({ message: "Error retrieving pending loans" });
  }
});

app.get("/api/cleanOrphanedImages", async (req, res) => {
  try {
    // Retrieve all users with their associated image file names from the database
    const users = await intuserModel.find({}, "image");

    // Get the list of image file names from the database
    const imageFileNames = users.map((user) => user.image).filter(Boolean);

    // Get the list of image files in the 'uploads' folder
    const uploadFolder = path.join(__dirname, "uploads"); // Replace 'uploads' with your actual folder name
    const uploadedFiles = fs.readdirSync(uploadFolder);

    // Find image files in the 'uploads' folder that don't have a corresponding user
    const orphanedImages = uploadedFiles.filter(
      (file) => !imageFileNames.includes(file)
    );

    // Process and delete orphaned image files
    orphanedImages.forEach(async (fileName) => {
      const filePath = path.join(uploadFolder, fileName);

      // Delete the file from the folder
      fs.unlink(filePath, async (err) => {
        if (err) {
          console.error(`Error deleting file: ${fileName}`, err);
          // Handle deletion error if required
        } else {
          console.log(`File ${fileName} deleted.`);
        }
      });
    });

    res.status(200).json({ message: "Orphaned images cleanup completed." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/getuseremailpassword", limiter, async (req, res) => {
  const { token } = req.body;

  // Check if the token exists
  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }

  try {
    // Verify and decode the token to extract the username
    const decoded = jwt.verify(token, "yourSecretKey");

    // Extract the username from the decoded token payload
    const { email } = decoded;
    const { password } = decoded;

    // Note: Avoid sending sensitive data like passwords here
    // Instead, send only necessary non-sensitive data
    res.json({ email, password });
  } catch (err) {
    // Handle token verification or decoding errors
    console.error("Token verification error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.get("/randomgenMemberId", limiter, async (req, res) => {
  let isUniqueIdFound = false;
  let uniqueid;

  while (!isUniqueIdFound) {
    const random = Math.floor(Math.random() * 9000 + 1000);
    uniqueid = 51520000 + random;

    const allMembers = await memberModel.find({}, "memberNo"); // Fetch only the 'memberNo' field
    const memberIds = allMembers.map((member) => member.memberNo);

    if (!memberIds.includes(uniqueid)) {
      isUniqueIdFound = true;
    }
  }

  res.json({ uniqueid });
});

app.get("/randomgenLoanId", limiter, async (req, res) => {
  let isUniqueIdFound = false;
  let uniqueid;

  while (!isUniqueIdFound) {
    const random = Math.floor(Math.random() * 9000 + 1000);
    uniqueid = 51530000 + random;

    const allLoans = await loansModel.find({}, "loanId"); // Fetch only the 'loanId' field
    const loanIds = allLoans.map((loan) => loan.loanId);

    if (!loanIds.includes(uniqueid)) {
      isUniqueIdFound = true;
    }
  }

  res.json({ uniqueid });
});

app.get("/randomgenAccountId", limiter, async (req, res) => {
  let isUniqueIdFound = false;
  let uniqueid;

  while (!isUniqueIdFound) {
    const random = Math.floor(Math.random() * 9000 + 1000);
    uniqueid = 51540000 + random;

    const allAccounts = await AccountModel.find({}, "accountNumber"); // Fetch only the 'accountNumber' field
    const accountNumbers = allAccounts.map((account) => account.accountNumber);

    if (!accountNumbers.includes(uniqueid)) {
      isUniqueIdFound = true;
    }
  }

  res.json({ uniqueid });
});

// Express route to get available balance, current balance, and associated loan ID(s) for an account
app.get("/accountDetails/:accountNumber", async (req, res) => {
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

    const associatedLoans = await repaymentModel
      .find({ loanId: accountNumber })
      .distinct("loanId");

    return res.status(200).json({
      accountNumber: account.accountNumber,
      availableBalance: currentBalance,
      currentBalance: account.currentBalance,
      associatedLoanIds: associatedLoans,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get("/calculate-revenue", async (req, res) => {
  try {
    const { year, month } = req.query;

    // Check if both year and month are provided in the query
    if (!year || !month) {
      return res.status(400).json({
        error: "Please provide year and month in the query parameters.",
      });
    }

    const startDate = new Date(year, month - 1, 1); // Month in JavaScript Date starts from 0 (January)
    const endDate = new Date(year, month, 0); // To get the last day of the month

    // Find all active loans within the specified month and year using loansModel
    const activeLoans = await loansModel
      .find({
        $or: [
          {
            $and: [
              { releaseDate: { $lte: endDate } },
              { endDate: { $gte: startDate } },
            ],
          },
          {
            $and: [
              { releaseDate: { $gte: startDate } },
              { endDate: { $exists: false } },
            ],
          },
        ],
      })
      .select("loanId"); // Selecting only the loanId field

    // Extract Loan IDs from active loans
    const loanIds = activeLoans.map((loan) => loan.loanId);

    let totalRevenue = 0;

    // Fetch repayments for each loan and calculate revenue
    for (const loanId of loanIds) {
      const repayments = await repaymentModel.find({ loanId });
      for (const repayment of repayments) {
        const { dueAmount, interest } = repayment;
        totalRevenue += dueAmount * (interest / 100);
      }
    }

    // Update or insert the calculated totalRevenue for the given month and year
    const filter = { year, month };
    const update = { year, month, totalRevenue };
    const options = { upsert: true, new: true };

    await Revenue.findOneAndUpdate(filter, update, options);

    res.json({ totalRevenue });
  } catch (error) {
    console.error("Error retrieving Loan IDs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/all-login", limiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await allusersModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Admin Franchise agent User
    // This is not secure - comparing passwords in plaintext
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    // If the passwords match, create a JWT
    const payload = {
      userId: user._id,
      email: user.email,
      username: user.firstName,
      password: user.password,
      role: user.userType,
      // Add other necessary user information to the payload
    };

    const token = jwt.sign(payload, "yourSecretKey", { expiresIn: "1h" }); // Set your own secret key and expiration time

    res.json({ message: "Login Success!", token });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// CREATE (Inserting a Document)
app.post("/all-create", async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    // Create a new user document
    const newUser = new allusersModel({
      name,
      email,
      password, // Ensure this password is hashed for security
      userType,
    });

    // Save the new user document to the database
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE (Updating a Document)
app.put("/all-update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // Find the user by their _id and update their information
    const updatedUser = await allusersModel.findByIdAndUpdate(
      id,
      { name, email, password },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE (Deleting a Document)
app.delete("/all-delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by their _id and delete the document
    const deletedUser = await allusersModel.findByIdAndDelete(id);

    if (deletedUser) {
      res.json(deletedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET route to fetch all user details
app.get("/all-users", async (req, res) => {
  try {
    // Retrieve all user details from the UserDetails model/collection
    const allUsers = await allusersModel.find();
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user details by email (using PUT request)
app.put("/update-user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { name, newEmail, password, userType } = req.body;

    // Find the user by their email
    const user = await allusersModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's information
    user.name = name || user.name; // Update name if provided, otherwise keep the existing name
    user.email = newEmail || user.email; // Update email if provided, otherwise keep the existing email
    user.password = password || user.password; // Update password if provided, otherwise keep the existing password
    user.userType = userType;

    // Save the updated user document
    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Retrieve total loan amount
app.get("/totalLoanAmount", async (req, res) => {
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
});

// Retrieve sum of all current balances
app.get("/totalCurrentBalance", async (req, res) => {
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
});

// Create a new account
app.post("/accounts-exp", async (req, res) => {
  try {
    const newAccount = new AccountModel(req.body);
    const createdAccount = await newAccount.save();
    res.status(201).json(createdAccount);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all accounts-exp
app.get("/accounts-exp", async (req, res) => {
  try {
    const accounts = await AccountModel.find();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific account by ID
app.get("/accounts-exp/:id", async (req, res) => {
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
});

// Update an account by ID
app.put("/accounts-exp/:id", async (req, res) => {
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
});

// Delete an account by ID
app.delete("/accounts-exp/:id", async (req, res) => {
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
});

app.get("/detailsByAccountNumber/:accountNumber", async (req, res) => {
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
});

app.get("/detailsByMemberId/:memberId", async (req, res) => {
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
});

// Endpoint to update loan status to Approved
app.put("/approveLoan/:loanId", async (req, res) => {
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
    res
      .status(500)
      .json({
        message: "Error updating loan status to Approved",
        error: error.message,
      });
  }
});

// Endpoint to update loan status to Cancelled
app.put("/cancelLoan/:loanId", async (req, res) => {
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
    res
      .status(500)
      .json({
        message: "Error updating loan status to Cancelled",
        error: error.message,
      });
  }
});

app.put("/objection/:loanId", async (req, res) => {
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
    res
      .status(500)
      .json({
        message: "Error updating objection column",
        error: error.message,
      });
  }
});

// API endpoint to update payment data and create RepaymentDetails document
app.post(
  "/api/updatePaymentAndCreateDetails/:repaymentId",
  async (req, res) => {
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

      // Fetch associated account using memberNo from loan
      const account = await AccountModel.findOne({ memberNo: loan.memberNo });
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      // Deduct dueAmount from currentBalance, update payment data, and deduct from totalAmount
      account.currentBalance -= repayment.dueAmount;
      repayment.totalAmount -= repayment.dueAmount;
      repayment.paymentDate = new Date(); // Set payment date to current date or the date of payment

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
      console.error(
        "Error updating payment data and creating RepaymentDetails:",
        error
      );
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// Endpoint to check if repayment data exists for a loan ID in the current month
app.get('/api/checkRepaymentExists/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params;

    // Get the current month in 'YYYY-MM' format
    const currentMonth = moment().format('YYYY-MM');

    // Find a repayment for the specified loanId within the current month
    const repayment = await RepaymentDetails.findOne({
      loanId,
      paymentDate: {
        $gte: new Date(`${currentMonth}-01`), // Start of the current month
        $lte: new Date(moment(`${currentMonth}-01`).endOf('month').toDate()), // End of the current month
      },
    });

    const repaymentExistsForCurrentMonth = !!repayment;
    res.json({ exists: repaymentExistsForCurrentMonth });
  } catch (error) {
    console.error('Error checking repayment data:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get("/repayments/:id/loanId", async (req, res) => {
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
    console.error("Error retrieving loan ID from repayment record:", error);
    res.status(500).json({
      message: "Error retrieving loan ID from repayment record",
      error: error.message,
    });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
