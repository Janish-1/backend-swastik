const { memberModel, loansModel, repaymentModel, AccountModel, TransactionsModel, RepaymentDetails } = require('../../models/restdb');
const { allusersModel, ExpenseModel, categoryModel, Revenue, walletModel, memberidsModel, loanidModel, accountidModel } = require("../../models/logindb");
const mongoose = require('mongoose');

// Create Function for User
const create = async (req, res) => {
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
  const userEmailDomain = email.split("@")[1];
  if (userEmailDomain === "yourcompany.com") {
    role = "admin";
  }

  try {
    const newUser = new allusersModel({
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
    // // // console.error("Error saving user data:", error);
    res.status(500).json({ message: "Error saving user data" });
  }
};

const readUsers = async (req, res) => {
  try {
    const data = await allusersModel.find();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Failed to fetch data" });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, password, role, security } = req.body;

  try {
    const filter = { _id: id };
    const update = { firstName, lastName, email, password, role, security };

    const updatedUser = await allusersModel.findOneAndUpdate(
      filter,
      update,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User data updated", data: updatedUser });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ message: "Error updating user data" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await allusersModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", data: deletedUser });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

const getUsernameData = (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, "yourSecretKey");
    const { username } = decoded;
    res.json({ username });
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, userType, imageUrl, memberNo } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "No image URL provided" });
    const newUser = new allusersModel({ name, email, password, userType, image: imageUrl, memberNo });
    const savedUser = await newUser.save();
    res.status(201).json({ message: "User created successfully!", user: savedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user", error: error.message });
  }
};

const getAllAgents = async (req, res) => {
  try {
    const agents = await allusersModel.find();
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await allusersModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUsera = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password, userType, memberNo, image } = req.body;
    const user = await allusersModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.name = name || user.name;
    user.email = email || user.email;
    user.password = password || user.password;
    user.userType = userType || user.userType;
    user.memberNo = memberNo || user.memberNo;
    user.image = image || user.image;
    await user.save();
    res.status(200).json({ message: "User data updated", data: user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user data", error: error.message });
  }
};

const deleteUsera = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await allusersModel.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ deletedUser, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const createUserHandler = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    const newUser = new allusersModel({
      name,
      email,
      password, // Ensure this password is hashed for security
      userType,
    });

    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const updatedUser = await allusersModel.findByIdAndUpdate(
      id,
      { name, email, password },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUserHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await allusersModel.findByIdAndDelete(id);

    if (deletedUser) {
      res.json(deletedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsersHandler = async (req, res) => {
  try {
    const allUsers = await allusersModel.find();
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserByIdHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await allusersModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserByEmailHandler = async (req, res) => {
  try {
    const { email } = req.params;
    const { name, newEmail, password, userType, memberNo } = req.body;

    const user = await allusersModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = newEmail || user.email;
    user.password = password || user.password;
    user.userType = userType;
    user.memberNo = memberNo || user.memberNo;

    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllUserImagesHandler = async (req, res) => {
  try {
    // Find all documents in the 'userdetails' collection where either 'photo' or 'image' fields exist and are not null or empty
    const allUserImages = await allusersModel.find(
      {
        $or: [
          { photo: { $exists: true, $ne: null, $ne: "" } },
          { image: { $exists: true, $ne: null, $ne: "" } },
        ],
      },
      "photo image"
    );

    const imageUrls = allUserImages.reduce((acc, user) => {
      if (user.photo) acc.push(user.photo);
      if (user.image) acc.push(user.image);
      return acc;
    }, []);

    res.status(200).json({ imageUrls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  create,
  readUsers,
  updateUser,
  deleteUser,
  getUsernameData,
  createUser,
  getAllAgents,
  getUserById,
  updateUsera,
  deleteUsera,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserByEmailHandler,
  getAllUserImagesHandler,
};
