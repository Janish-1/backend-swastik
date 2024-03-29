const { memberModel, loansModel, repaymentModel, AccountModel, TransactionsModel, RepaymentDetails } = require('../../models/restdb');
const { allusersModel, ExpenseModel, categoryModel, Revenue, walletModel, memberidsModel, loanidModel, accountidModel } = require("../../models/logindb");
const mongoose = require('mongoose');

const createBranch = async (req, res) => {
  const { branchCode, branchName, name, email, password, contactphone, branchaddress, userType } = req.body;

  try {
    const newUser = new userModel({
      branchName,
      name,
      email,
      password,
      contactphone,
      branchaddress,
      userType: "manager",
      branchCode,
    });

    await newUser.save();

    res.status(200).json({ message: "User data saved to MongoDB", data: newUser });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation error", errors });
    }

    console.error("Error saving user data:", error);
    res.status(500).json({ message: "Error saving user data" });
  }
};

const updateBranch = async (req, res) => {
  const branchId = req.params.id;
  const { branchCode, branchName, name, email, password, contactphone, branchaddress, userType } = req.body;

  try {
    const updatedBranch = await userModel.findByIdAndUpdate(
      branchId,
      {
        branchCode,
        branchName,
        name,
        email,
        password,
        contactphone,
        branchaddress,
        userType: "manager",
      },
      { new: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.status(200).json({ message: "Branch updated successfully", data: updatedBranch });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation error", errors });
    }

    console.error("Error updating branch:", error);
    res.status(500).json({ message: "Error updating branch" });
  }
};

const deleteBranch = async (req, res) => {
  const branchId = req.params.id;
  try {
    const deletedBranch = await allusersModel.findByIdAndDelete(branchId);
    if (!deletedBranch) return res.status(404).json({ message: "Branch not found" });
    res.status(200).json({ message: "Branch deleted successfully", data: deletedBranch });
  } catch (error) {
    console.error("Error deleting branch:", error);
    res.status(500).json({ message: "Error deleting branch" });
  }
};

const readBranch = async (req, res) => {
  try {
    const managerBranches = await allusersModel.find({ userType: "manager" });
    res.status(200).json({ message: "Manager branches retrieved successfully", data: managerBranches });
  } catch (error) {
    console.error("Error retrieving manager branches:", error);
    res.status(500).json({ message: "Error retrieving manager branches" });
  }
};

const getBranchById = async (req, res) => {
  const branchId = req.params.id;
  try {
    const branch = await allusersModel.findById(branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });
    res.status(200).json(branch);
  } catch (error) {
    console.error("Error retrieving branch:", error);
    res.status(500).json({ message: "Error retrieving branch" });
  }
};

const fetchBranchNames = async (req, res) => {
  try {
    const managerBranches = await allusersModel.find(
      { userType: "manager" },
      { branchName: 1, _id: 0 }
    );
    const branchNames = managerBranches.map((branch) => branch.branchName);
    res.status(200).json({ message: "Manager branch names retrieved successfully", data: branchNames });
  } catch (error) {
    console.error("Error retrieving manager branch names:", error);
    res.status(500).json({ message: "Error retrieving manager branch names" });
  }
};
const getBranchDatabasesHandler = async (req, res) => {
  try {
    const { objectId } = req.params; // Get the objectId from the route parameters

    // Validate if the provided ObjectId is valid
    if (mongoose.Types.ObjectId.isValid(objectId)) {
      // Find a document by the provided ObjectId
      const document = await allusersModel.findOne({ _id: objectId });

      if (document) {
        const branchName = document.branchName;

        // Find all distinct 'dbName' values where branchName matches the document's branchName
        const branchDatabases = await allusersModel
          .find({ branchName }) // Find databases with the same branchName
          .distinct("dbName");

        res.status(200).json({ databases: branchDatabases });
      } else {
        res.status(404).json({ message: "Document not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ObjectId" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getBranchUsersHandler = async (req, res) => {
  try {
    const { objectId } = req.params; // Get the objectId from the route parameters

    // Find a document by the provided objectId
    const document = await allusersModel.findOne({ _id: objectId });

    if (document) {
      const branchName = document.branchName;

      if (branchName) {
        // Find the manager for the specific branch
        const manager = await allusersModel.findOne({
          branchName,
          userType: "manager",
        });

        // Find all agents under the specific branch
        const agents = await allusersModel.find({
          branchName,
          userType: "agent",
        });

        // Combine manager and agents into a single array
        const branchUsers = [manager, ...agents];

        res.status(200).json({ branch: branchName, users: branchUsers });
      } else {
        res.status(404).json({ message: "Branch not found" });
      }
    } else {
      res.status(404).json({ message: "Document not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createBranch,
  updateBranch,
  deleteBranch,
  readBranch,
  getBranchById,
  fetchBranchNames,
  getBranchDatabasesHandler,
  getBranchUsersHandler
};
