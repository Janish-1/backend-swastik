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
const router = express.Router();

const { createAccount, getAllAccounts, getAccountById, getAccountIds, getApprovedAccountIds, updateAccount, readAccountNumbers, deleteAccount, getAccountStatement, accountDetailsHandler, memberAccountDetailsHandler, getTotalCurrentBalanceHandler, createAccountHandler, getAllAccountsHandler, getAccountByIdHandler, updateAccountHandler, deleteAccountHandler, getDetailsByAccountNumberHandler, getDetailsByMemberIdHandler, getAllAccountImagesHandler, approveAccountHandler, cancelAccountHandler } = require('../controllers/API/account');
const { createAgentHandler,updateAgentHandler } = require("../controllers/API/agent");
const { createBranch, updateBranch, deleteBranch, readBranch, getBranchById, fetchBranchNames, getBranchDatabasesHandler, getBranchUsersHandler } = require('../controllers/API/branch');
const { createCategoryHandler, getAllCategoriesHandler, getSingleCategoryHandler, updateCategoryHandler, deleteCategoryHandler } = require('../controllers/API/category');
const { createExpense, getAllExpenses, updateExpense, deleteExpense, reportExpensesHandler, getExpensePerYearHandler, getStackedChartDataHandler } = require('../controllers/API/expense');
const { createLoan, updateLoan, deleteLoan, getAllLoans, getLoansByMember, getLoanById, getLoanMembers, getApprovedLoans, getApprovedLoansNotInRepayment, generateLoanReport, getLoanDue, pendingLoansHandler, totalLoansHandler, getTotalLoanAmountHandler, approveLoanHandler, cancelLoanHandler, updateObjectionHandler, updatePaymentAndCreateDetailsHandler } = require('../controllers/API/loan');
const { alllogin, login, verify_token } = require('../controllers/API/login');
const { updateMember, deleteMember, readMembers, readMembersName, readMemberIds, getMemberById, countMembersHandler, getAllMemberImagesHandler } = require('../controllers/API/member');
const { getUserEmailPasswordHandler, randomgenMemberIdHandler, randomgenLoanIdHandler, randomgenAccountIdHandler, randomgenBranchCodeHandler, randomgenWalletIdHandler, calculateRevenueHandler, populateRevenueHandler, getAdminDatabasesHandler, getUserDetailsHandler, switchDatabaseHandler, getTotalThisMonthHandler, getRecentCollectionHandler } = require('../controllers/API/randomshit');
const { createWalletHandler,getWalletHandler,updateWalletHandler,deleteWalletHandler } = require("../controllers/API/wallet");
const { createRepayment, getAllRepayments, getRepaymentById, updateRepayment, deleteRepayment, checkRepaymentExistsHandler, getRepaymentLoanIdHandler } = require('../controllers/API/repaymens');
const { create, readUsers, updateUser, deleteUser, getUsernameData, createUser, getAllAgents, getUserById, updateUsera, deleteUsera, createUserHandler, updateUserHandler, deleteUserHandler, getAllUsersHandler, getUserByIdHandler, updateUserByEmailHandler, getAllUserImagesHandler } = require('../controllers/API/user');
const { createTransaction,getAllTransactions,getTransactionsByMemberId,getTransactionById,deleteTransaction,updateTransaction,getTransactionReport,depositRequestsPendingHandler,withdrawRequestsPendingHandler } = require('../controllers/API/transaction');

// Login Routes
router.post("/all-login",alllogin);
router.post("/login",login);
router.get("/verify-token",verify_token);

// User Routes
router.post("/create",create);
router.get("/read",readUsers);
router.put("/update/:id",updateUser);
router.post("/delete/:id",deleteUser);
router.post("/usernamedata",getUsernameData);
router.post("/users",createUser);
router.get("/api/users",getAllUsersHandler);
router.get("/usersdetails/:id",getUserByIdHandler);
router.put("/updateintuser/:id",updateUserHandler);
router.delete("/api/users/:id",deleteUserHandler);
router.post("/getuseremailpassword",getUserEmailPasswordHandler);


// Branch Routes
router.post("/createbranch",createBranch);
router.put("/updatebranch/:id",updateBranch);
router.post("/deletebranch/:id",deleteBranch);
router.get("/readbranch",readBranch);
router.get("/getbranch/:id",getBranchById);
router.get("/branches/names",fetchBranchNames);

// Member Routes
router.put("/updatemember/:id",updateMember);
router.post("/deletemember/:id",deleteMember);
router.get("/readmembers",readMembers);
router.get("/readmembersname",readMembersName);
router.get("/readmemberids",readMemberIds);
router.get("/getmember/:id",getMemberById);
router.get("/countMembers",countMembersHandler);

router.post("/all-create",createUserHandler);
router.put("/all-update/:id",updateUsera);
router.delete("/all-delete/:id",deleteUsera);

router.get("/all-users",getAllAgents);
router.get("/all-users/:id",getUserById);
router.put("/update-user/:email",updateUserByEmailHandler);
router.get("/detailsByMemberId/:memberId",getDetailsByMemberIdHandler);

// Loan Routes
router.post("/createloan",createLoan);
router.put("/updateloan/:id",updateLoan);
router.delete("/deleteloan/:id",deleteLoan);
router.get("/loans",getAllLoans);
router.get("/loansbymember/:memberNo",getLoansByMember);
router.get("/loans/:id",getLoanById);
router.get("/loanmembers",getLoanMembers);
router.get("/approvedLoans",getApprovedLoans);
router.get("/approvedLoansNotInRepayment",getApprovedLoansNotInRepayment);
router.post("/loanreport",generateLoanReport);
router.get("/loandue",getLoanDue);
router.get("/pendingLoans",pendingLoansHandler);
router.get("/totalLoans",totalLoansHandler);
router.get("/totalLoanAmount",getTotalLoanAmountHandler);
router.put("/approveLoan/:loanId",approveLoanHandler);
router.put("/cancelLoan/:loanId",cancelLoanHandler);
router.put("/objection/:loanId",updateObjectionHandler);

// Repayment Routes
router.post("/repayments",createRepayment);
router.get("/repayments",getAllRepayments);
router.get("/repayments/:id",getRepaymentById);
router.put("/repayments/:id",updateRepayment);
router.delete("/repayments/:id",deleteRepayment);
router.get("/repayments/:id/loanId",getRepaymentLoanIdHandler);
router.get("/api/checkRepaymentExists/:loanId",checkRepaymentExistsHandler);

// Account Routes
router.post("/createaccounts",createAccount);
router.get("/accounts",getAllAccounts);
router.get("/accounts/:id",getAccountById);
router.get("/accountids",getAccountIds);
router.get("/approvedaccountids",getApprovedAccountIds);
router.put("/updateaccounts/:id",updateAccount);
router.get("/readaccountnumbers",readAccountNumbers);
router.delete("/deleteaccounts/:id",deleteAccount);
router.get("/accountstatement",getAccountStatement);
router.get("/accountDetails/:accountNumber",accountDetailsHandler);
router.get("/memberAccountDetails/:id",memberAccountDetailsHandler);
router.get("/totalCurrentBalance",getTotalCurrentBalanceHandler);
router.post("/accounts-exp",createAccountHandler);
router.get("/accounts-exp",getAllAccountsHandler);
router.get("/accounts-exp/:id",getAccountByIdHandler);
router.put("/accounts-exp/:id",updateAccountHandler);
router.delete("/accounts-exp/:id",deleteAccountHandler);
router.get("/detailsByAccountNumber/:accountNumber",getDetailsByAccountNumberHandler);
router.put("/approveaccount/:accountId",approveAccountHandler);
router.put("/cancelaccount/:accountId",cancelAccountHandler);

// Transaction Routes
router.post("/transactions",createTransaction);
router.get("/transactions",getAllTransactions);
router.get("/transactionsbymember/:id",getTransactionsByMemberId);
router.get("/transactions/:id",getTransactionById);
router.delete("/transactions/:id",deleteTransaction);
router.put("/transactions/:id",updateTransaction);
router.get("/transactionreport",getTransactionReport);
router.get("/depositRequestsPending",depositRequestsPendingHandler);
router.get("/withdrawRequestsPending",withdrawRequestsPendingHandler);

// Expense Routes
router.post("/expenses",createExpense);
router.get("/expenses",getAllExpenses);
router.put("/expenses/:id",updateExpense);
router.delete("/expenses/:id",deleteExpense);
router.get("/reportexpenses",reportExpensesHandler);
router.get("/calculate-revenue",calculateRevenueHandler); 
router.get("/populate-revenue",populateRevenueHandler);
router.get("/expense-per-year",getExpensePerYearHandler);
router.get("/stacked-chart-data",getStackedChartDataHandler);

// Category Routes
router.post("/categories",createCategoryHandler);
router.get("/categories",getAllCategoriesHandler);
router.get("/categories/:id",getSingleCategoryHandler);
router.put("/categories/:id",updateCategoryHandler);
router.delete("/categories/:id",deleteCategoryHandler);

// RNG Routes
router.get("/randomgenMemberId",randomgenMemberIdHandler);
router.get("/randomgenLoanId",randomgenLoanIdHandler);
router.get("/randomgenAccountId",randomgenAccountIdHandler);
router.get("/randomgenbranchCode",randomgenBranchCodeHandler);
router.get("/randomgenWalletId",randomgenWalletIdHandler);

// Random Routes
router.post("/api/updatePaymentAndCreateDetails/:repaymentId",updatePaymentAndCreateDetailsHandler);
router.post("/createagent",createAgentHandler);
router.put("/updateagent/:id",updateAgentHandler);
router.get("/getAllMemberImages",getAllMemberImagesHandler);
router.get("/getAllAccountImages",getAllAccountImagesHandler);
router.get("/getAllUserImages",getAllUserImagesHandler);
router.get("/admin-databases",getAdminDatabasesHandler);
router.get("/branch-databases/:objectId",getBranchDatabasesHandler);
router.get("/branch-users/:objectId",getBranchUsersHandler);
router.get("/userdetails/:databaseName",getUserDetailsHandler);
router.get("/switch-database/:dbName",switchDatabaseHandler);
router.get("/totals-this-month",getTotalThisMonthHandler);
router.get("/recentCollection",getRecentCollectionHandler);

// Wallet Routes
router.post("/wallet",createWalletHandler);
router.get("/wallet/:walletId",getWalletHandler);
router.put("/wallet/:walletId",updateWalletHandler);
router.delete("/wallet/:walletId",deleteWalletHandler);

module.exports = router;