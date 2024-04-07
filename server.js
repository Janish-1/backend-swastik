// server.js
const connectDB = require('./config/config');
const Routes = require("./routes/route");
const ImageRoutes = require("./controllers/Image/image");
const morgan = require("morgan");
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const moment = require("moment");
const cloudinary = require("cloudinary").v2;

// Specify the absolute path to your .env file
const envPath = path.resolve(__dirname, "../.env");
// Load environment variables from the specified .env file
dotenv.config({ path: envPath });

require("dotenv").config(); // Load environment variables from .env file
const app = express();

app.use(bodyParser.json());

app.use(cors());

// Create a write stream (in append mode) for the log file
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "access.log"),
    { flags: "a" }
);

// Use morgan for logging with combined format
app.use(morgan("combined", { stream: accessLogStream }));

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

// Login Routes
app.post("/all-login", Routes);
app.post("/login", Routes);
app.get("/verify-token", Routes);

// User Routes
app.post("/create", Routes);
app.get("/read", Routes);
app.put("/update/:id", Routes);
app.post("/delete/:id", Routes);
app.post("/usernamedata", Routes);
app.post("/users", Routes);
app.get("/api/users", Routes);
app.get("/usersdetails/:id", Routes);
app.put("/updateintuser/:id", Routes);
app.delete("/api/users/:id", Routes);
app.post("/getuseremailpassword", Routes);


// Branch Routes
app.post("/createbranch", Routes);
app.put("/updatebranch/:id", Routes);
app.post("/deletebranch/:id", Routes);
app.get("/readbranch", Routes);
app.get("/getbranch/:id", Routes);
app.get("/branches/names", Routes);

// Member Routes
app.put("/updatemember/:id", Routes);
app.post("/deletemember/:id", Routes);
app.get("/readmembers", Routes);
app.get("/readmembersname", Routes);
app.get("/readmemberids", Routes);
app.get("/getmember/:id", Routes);
app.get("/countMembers", Routes);

app.post("/all-create", Routes);
app.put("/all-update/:id", Routes);
app.delete("/all-delete/:id", Routes);

app.get("/all-users", Routes);
app.get("/all-users/:id", Routes);
app.put("/update-user/:email", Routes);
app.get("/detailsByMemberId/:memberId", Routes);

// Loan Routes
app.post("/createloan", Routes);
app.put("/updateloan/:id", Routes);
app.delete("/deleteloan/:id", Routes);
app.get("/loans", Routes);
app.get("/loansbymember/:memberNo", Routes);
app.get("/loans/:id", Routes);
app.get("/loanmembers", Routes);
app.get("/approvedLoans", Routes);
app.get("/approvedLoansNotInRepayment", Routes);
app.post("/loanreport", Routes);
app.get("/loandue", Routes);
app.get("/pendingLoans", Routes);
app.get("/totalLoans", Routes);
app.get("/totalLoanAmount", Routes);
app.put("/approveLoan/:loanId", Routes);
app.put("/cancelLoan/:loanId", Routes);
app.put("/objection/:loanId", Routes);

// Repayment Routes
app.post("/repayments", Routes);
app.get("/repayments", Routes);
app.get("/repayments/:id", Routes);
app.put("/repayments/:id", Routes);
app.delete("/repayments/:id", Routes);
app.get("/repayments/:id/loanId", Routes);
app.get("/api/checkRepaymentExists/:loanId", Routes);

// Account Routes
app.post("/createaccounts", Routes);
app.get("/accounts", Routes);
app.get("/accounts/:id", Routes);
app.get("/accountids", Routes);
app.get("/approvedaccountids", Routes);
app.put("/updateaccounts/:id", Routes);
app.get("/readaccountnumbers", Routes);
app.delete("/deleteaccounts/:id", Routes);
app.get("/accountstatement", Routes);
app.get("/accountDetails/:accountNumber", Routes);
app.get("/memberAccountDetails/:id", Routes);
app.get("/totalCurrentBalance", Routes);
app.post("/accounts-exp", Routes);
app.get("/accounts-exp", Routes);
app.get("/accounts-exp/:id", Routes);
app.put("/accounts-exp/:id", Routes);
app.delete("/accounts-exp/:id", Routes);
app.get("/detailsByAccountNumber/:accountNumber", Routes);
app.put("/approveaccount/:accountId", Routes);
app.put("/cancelaccount/:accountId", Routes);

// Transaction Routes
app.post("/transactions", Routes);
app.get("/transactions", Routes);
app.get("/transactionsbymember/:id", Routes);
app.get("/transactions/:id", Routes);
app.delete("/transactions/:id", Routes);
app.put("/transactions/:id", Routes);
app.get("/transactionreport", Routes);
app.get("/depositRequestsPending", Routes);
app.get("/withdrawRequestsPending", Routes);

// Expense Routes
app.post("/expenses", Routes);
app.get("/expenses", Routes);
app.put("/expenses/:id", Routes);
app.delete("/expenses/:id", Routes);
app.get("/reportexpenses", Routes);
app.get("/calculate-revenue", Routes);
app.get("/populate-revenue", Routes);
app.get("/expense-per-year", Routes);
app.get("/stacked-chart-data", Routes);

// Category Routes
app.post("/categories", Routes);
app.get("/categories", Routes);
app.get("/categories/:id", Routes);
app.put("/categories/:id", Routes);
app.delete("/categories/:id", Routes);

// RNG Routes
app.get("/randomgenMemberId", Routes);
app.get("/randomgenLoanId", Routes);
app.get("/randomgenAccountId", Routes);
app.get("/randomgenbranchCode", Routes);
app.get("/randomgenWalletId", Routes);

// Random Routes
app.post("/api/updatePaymentAndCreateDetails/:repaymentId", Routes);
app.post("/createagent", Routes);
app.put("/updateagent/:id", Routes);
app.get("/getAllMemberImages", Routes);
app.get("/getAllAccountImages", Routes);
app.get("/getAllUserImages", Routes);
app.get("/admin-databases", Routes);
app.get("/branch-databases/:objectId", Routes);
app.get("/branch-users/:objectId", Routes);
app.get("/userdetails/:databaseName", Routes);
app.get("/switch-database/:dbName", Routes);
app.get("/totals-this-month", Routes);
app.get("/recentCollection", Routes);

// Wallet Routes
app.post("/wallet", Routes);
app.get("/wallet/:walletId", Routes);
app.put("/wallet/:walletId", Routes);
app.delete("/wallet/:walletId", Routes);

// Image Routes
app.post("/uploadimage", ImageRoutes);
app.post("/uploadmultiple", ImageRoutes);
app.post("/upload", ImageRoutes);
app.post("/uploadsignature", ImageRoutes);
app.post("/createmember", ImageRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/", (req, res) => {
    res.send("Server is running!");
});