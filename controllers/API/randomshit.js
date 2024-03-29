const { memberModel, loansModel, repaymentModel, AccountModel, TransactionsModel, RepaymentDetails } = require('../../models/restdb');
const { allusersModel, ExpenseModel, categoryModel, Revenue, walletModel, memberidsModel, loanidModel, accountidModel } = require("../../models/logindb");
const mongoose = require('mongoose');
const fs = require('fs').promises;
const dotenv = require("dotenv");
const path = require("path");

// Specify the absolute path to your .env file
const envPath = path.resolve(__dirname, "../.env");
// Load environment variables from the specified .env file
dotenv.config({ path: envPath });

// MongoDB connection URL
const uri = process.env.MONGODB_URI;
const timestampFilePath = "last_execution_timestamp.txt";

const getUserEmailPasswordHandler = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, "yourSecretKey");
    const { email } = decoded;
    const { password } = decoded;

    res.json({ email, password });
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

const randomgenMemberIdHandler = async (req, res) => {
  try {
    const latestMemberIdDoc = await memberidsModel.findOne().sort({ memberNo: -1 });
    let nextMemberNo;
    if (!latestMemberIdDoc) {
      nextMemberNo = 52;
    } else {
      nextMemberNo = latestMemberIdDoc.memberNo + 1;
    }
    const uniqueid = nextMemberNo.toString().padStart(8, '0');
    res.json({ uniqueid });
  } catch (error) {
    console.error("Error generating unique member ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const randomgenLoanIdHandler = async (req, res) => {
  let isUniqueIdFound = false;
  let uniqueid;

  while (!isUniqueIdFound) {
    const random = Math.floor(Math.random() * 900000 + 100000);
    uniqueid = 5153000000 + random;

    const allLoans = await loanidModel.find({}, "loanId");
    const loanIds = allLoans.map((loan) => loan.loanId);

    if (!loanIds.includes(uniqueid)) {
      isUniqueIdFound = true;
    }
  }

  res.json({ uniqueid });
};

const randomgenAccountIdHandler = async (req, res) => {
  let isUniqueIdFound = false;
  let uniqueid;

  while (!isUniqueIdFound) {
    const random = Math.floor(Math.random() * 9000000) + 1000000;
    uniqueid = "2180" + random.toString();

    const allAccounts = await accountidModel.find({}, "accountNumber");
    const accountNumbers = allAccounts.map((account) => account.accountNumber);

    if (!accountNumbers.includes(uniqueid)) {
      isUniqueIdFound = true;
    }
  }

  res.json({ uniqueid });
};

const randomgenBranchCodeHandler = async (req, res) => {
  let isUniqueIdFound = false;
  let uniqueid;

  while (!isUniqueIdFound) {
    const random = Math.floor(Math.random() * 90000) + 10000;
    uniqueid = "2180" + random.toString();

    const allAccounts = await allusersModel.find({}, "branchCode");
    const accountNumbers = allAccounts.map((account) => account.accountNumber);

    if (!accountNumbers.includes(uniqueid)) {
      isUniqueIdFound = true;
    }
  }

  res.json({ uniqueid });
};

const randomgenWalletIdHandler = async (req, res) => {
  let isUniqueWalletIdFound = false;
  let uniqueWalletId;

  while (!isUniqueWalletIdFound) {
    const random = Math.floor(Math.random() * 900000 + 100000);
    uniqueWalletId = random;

    const existingWallet = await walletModel.findOne({ walletid: uniqueWalletId });

    if (!existingWallet) {
      isUniqueWalletIdFound = true;
    }
  }

  res.json({ uniqueWalletId });
};

const calculateRevenueHandler = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year) {
      return res.status(400).json({
        error: "Please provide the year in the query parameters.",
      });
    }

    let startMonth = 1;
    let endMonth = 12;

    if (month && !isNaN(parseInt(month)) && month >= 1 && month <= 12) {
      startMonth = parseInt(month);
      endMonth = parseInt(month);
    }

    let totalRevenue = 0;

    for (let currMonth = startMonth; currMonth <= endMonth; currMonth++) {
      const startDate = new Date(year, currMonth - 1, 1);
      const endDate = new Date(year, currMonth, 0);
      endDate.setHours(23, 59, 59, 999);

      const allLoans = await loansModel.find({});
      const activeLoans = [];

      for (const loan of allLoans) {
        const isReleaseDateValid = new Date(loan.releaseDate) <= endDate;
        const isEndDateValid =
          loan.endDate === undefined || new Date(loan.endDate) >= startDate;

        if (isReleaseDateValid && isEndDateValid) {
          activeLoans.push(loan);
        }
      }

      let monthlyRevenue = 0;

      for (const loan of activeLoans) {
        const repayments = await repaymentModel.find({ loanId: loan.loanId });
        for (const repayment of repayments) {
          const { dueAmount, interest } = repayment;
          monthlyRevenue += dueAmount * (interest / 100);
        }
      }

      totalRevenue += monthlyRevenue;
    }

    res.json({ year, totalRevenue });
  } catch (error) {
    console.error("Error calculating revenue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to calculate the time difference in hours
function calculateTimeDifference(previousTime, currentTime) {
  const timeDifference = currentTime - previousTime;
  const hoursDifference = timeDifference / (1000 * 60 * 60); // Convert milliseconds to hours
  return hoursDifference;
}

const calculateRevenue = async (year, month) => {
  return new Promise(async (resolve, reject) => {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      let monthlyRevenue = 0;

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
        .select("loanId");

      const loanIds = activeLoans.map((loan) => loan.loanId);

      for (const loanId of loanIds) {
        const repayments = await repaymentModel.find({ loanId });
        for (const repayment of repayments) {
          const { dueAmount, interest } = repayment;
          monthlyRevenue += dueAmount * (interest / 100);
        }
      }

      const filter = { year, month };
      const update = { year, month, monthlyRevenue };
      const options = { upsert: true, new: true };

      await Revenue.findOneAndUpdate(filter, update, options);

      resolve({ monthlyRevenue });
    } catch (error) {
      // // console.error("Error calculating revenue:", error);
      reject(new Error("Internal server error"));
    }
  });
};

const populateRevenueHandler = async (req, res) => {
  const currentDate = new Date();
  const currentTimestamp = currentDate.getTime();

  let lastExecutionTimestamp = 0;
  try {
    const timestampContent = await fs.readFile(timestampFilePath, "utf8");
    lastExecutionTimestamp = parseInt(timestampContent, 10);
  } catch (readError) {
    console.error("Error reading timestamp file:", readError.message);
  }

  const hoursSinceLastExecution = calculateTimeDifference(
    lastExecutionTimestamp,
    currentTimestamp
  );

  if (hoursSinceLastExecution >= 2) {
    try {
      await fs.writeFile(timestampFilePath, currentTimestamp.toString());

      const currentYear = currentDate.getFullYear();
      const yearsToCalculate = 15;

      const promises = [];

      for (let year = 2023; year <= currentYear + yearsToCalculate; year++) {
        const totalMonths =
          year === currentYear + yearsToCalculate
            ? currentDate.getMonth() + 1
            : 12;

        const monthsArray = Array.from(
          { length: totalMonths },
          (_, month) => month + 1
        );

        const yearPromises = monthsArray.map(async (month) => {
          try {
            const { monthlyRevenue } = await calculateRevenue(year, month);
          } catch (error) {
            console.error(
              `Error calculating revenue for ${year}-${month}:`,
              error.message
            );
          }
        });

        promises.push(...yearPromises);
      }

      await Promise.all(promises);

      res.json({ message: "Revenue data population completed" });
    } catch (error) {
      console.error("Error populating revenue data:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.json({
      message: "Not enough time has passed since the last execution",
    });
  }
};

const getAdminDatabasesHandler = async (req, res) => {
  try {
    // Find all databases where userType is 'admin'
    const adminDatabases = await allusersModel.find().distinct("dbName");

    res.status(200).json({ databases: adminDatabases });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


const getUserDetailsHandler = async (req, res) => {
  const databaseName = req.params.databaseName;

  try {
    // Fetch name, email, and branchName based on the provided database name
    const userDetails = await allusersModel.find(
      { dbName: databaseName },
      { name: 1, email: 1, branchName: 1, _id: 0 }
    );

    if (userDetails.length === 0) {
      return res.status(404).json({
        message: "No user details found for the provided database name",
      });
    }

    // Send the fetched user details as a JSON response
    res.json(userDetails);
  } catch (err) {
    // If an error occurs during the fetch, send an error response
    res.status(500).json({ message: err.message });
  }
};

const switchDatabaseHandler = async (req, res) => {
  const { dbName } = req.params;

  try {
    const newConnection = mongoose.createConnection(process.env.MONGODB_URI, {
      dbName,
    });

    newConnection.on("connected", () => {
      console.log("Connected to MongoDB - Secondary Connection");
    });

    newConnection.on("disconnected", () => {
      console.log("Disconnected from MongoDB - Secondary Connection");
    });

    newConnection.on("error", (err) => {
      console.error("Connection error:", err);
    });

    res.json({ message: "Branch switched successfully" });
  } catch (error) {
    console.error("Switch Database Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTotalThisMonthHandler = async (req, res) => {
  try {
    // Get the current month and year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Month is zero-based, so add 1

    // Calculate the start and end dates for the current month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1); // Month is zero-based
    const endOfMonth = new Date(currentYear, currentMonth, 0); // Get last day of the month

    // Aggregate to calculate total due amount for this month from repaymentSchema
    const totalDueAmountThisMonth = await repaymentModel.aggregate([
      {
        $match: {
          dueDate: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalDueAmount: { $sum: "$dueAmount" },
        },
      },
    ]);

    // Aggregate to calculate total amount paid for this month from repaymentDetailsSchema
    const totalAmountPaidThisMonth = await RepaymentDetails.aggregate([
      {
        $match: {
          paymentDate: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmountPaid: { $sum: "$dueAmountPaid" },
        },
      },
    ]);

    const result = {
      totalDueAmountThisMonth:
        totalDueAmountThisMonth.length > 0
          ? totalDueAmountThisMonth[0].totalDueAmount
          : 0,
      totalAmountPaidThisMonth:
        totalAmountPaidThisMonth.length > 0
          ? totalAmountPaidThisMonth[0].totalAmountPaid
          : 0,
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRecentCollectionHandler = async (req, res) => {
  try {
    const repaymentDetails = await RepaymentDetails.find({}).lean();

    // Retrieve memberName from AccountModel using accountId
    const formattedData = await Promise.all(
      repaymentDetails.map(async (detail) => {
        const account = await AccountModel.findOne({
          accountId: detail.accountId,
        }).lean();
        return {
          Date: detail.paymentDate,
          "Member Name": account ? account.memberName : "N/A", // If account or memberName is not found, set as 'N/A'
          "Account Number": detail.accountId,
          Amount: detail.dueAmountPaid,
          Status: detail.dueAmountPaid > 0 ? "Paid" : "Unpaid",
        };
      })
    );

    res.status(200).json({ RecentCollection: formattedData });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving recent collection data" });
  }
};


module.exports = {
  getUserEmailPasswordHandler,
  randomgenMemberIdHandler,
  randomgenLoanIdHandler,
  randomgenAccountIdHandler,
  randomgenBranchCodeHandler,
  randomgenWalletIdHandler,
  calculateRevenueHandler,
  populateRevenueHandler,
  getAdminDatabasesHandler,
  getUserDetailsHandler,
  switchDatabaseHandler,
  getTotalThisMonthHandler,
  getRecentCollectionHandler,
};
