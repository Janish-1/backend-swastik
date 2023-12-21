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
const moment = require("moment");
const cloudinary = require("cloudinary").v2;

// Specify the absolute path to your .env file
const envPath = path.resolve(__dirname, "../.env");
// Load environment variables from the specified .env file
dotenv.config({ path: envPath });

require("dotenv").config(); // Load environment variables from .env file

const uri = process.env.MONGODB_URI;
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(cors());

const memberSchema = new mongoose.Schema(
  {
    memberNo: { type: Number, required: true, unique: true },
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
    numberOfShares: { type: Number },
  },
  { collection: "members" }
);

const loanSchema = new mongoose.Schema(
  {
    loanId: { type: Number, required: true, unique: true },
    loanProduct: { type: String, required: true },
    memberName: { type: String, required: true },
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
    loanRepaymentStatus: { type: String, required: true },
    monthstatus: { type: String, required: true },
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

mongoose.connect(uri, {
  dbName: "commondatabase",
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Event handling for successful connection
mongoose.connection.on("connected", () => {
  // // // console.log("Connected to MongoDB(Common)");
});

// Event handling for disconnection
mongoose.connection.on("disconnected", () => {
  // // // console.log("Disconnected from MongoDB(Common)");
});

// Event handling for error
mongoose.connection.on("error", (err) => {
  // // // console.error("Connection error:", err);
});

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
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Event handling for successful connection
loginDB.on("connected", () => {
  // // // console.log("Connected to loginDB");
});

// Event handling for disconnection
loginDB.on("disconnected", () => {
  // // // console.log("Disconnected from loginDB");
});

// Event handling for error
loginDB.on("error", (err) => {
  // // // console.error("Connection error:", err);
});

const allusersModel = loginDB.model("allusers", userdetailsSchema);
const ExpenseModel = loginDB.model("expenses", expenseSchema);
const categoryModel = loginDB.model("category", categorySchema);
const Revenue = loginDB.model("Revenue", revenueSchema);
const walletModel = loginDB.model("wallet", walletschema);
const memberidsModel = loginDB.model("membersids", memberids);
const loanidModel = loginDB.model("loanids", loanids);
const accountidModel = loginDB.model("accountids", accountids);

// // Multer configuration for handling file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads"); // Uploads directory where files will be stored
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
//     const fileExtension = path.extname(file.originalname);
//     cb(null, `${uniqueSuffix}${fileExtension}`);
//   },
// });

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

app.post("/all-login", limiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await allusersModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    let dbName; // Define dbName here

    // Check if the user is an admin, if so, set the global variable
    if (user.userType === "admin") {
      mongoose.connection
        .close()
        .then(() => {
          return mongoose.connect(uri, {
            dbName: "admindatabase",
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
        })
        .then(() => {
          // Event handling for successful connection
          mongoose.connection.on("connected", () => {
            // // // console.log("Connected to MongoDB(Admin)");
          });

          // Event handling for disconnection
          mongoose.connection.on("disconnected", () => {
            // // // console.log("Disconnected from MongoDB(Admin)");
          });

          // Event handling for error
          mongoose.connection.on("error", (err) => {
            // // // console.error("Connection error:", err);
          });
        })
        .catch((err) => {
          // // // console.error("Error:", err);
        });
    } else if (user.userType === "manager") {
      dbName = `manager_${user._id.toString()}`; // Prefix with "manager_"
      mongoose.connection
        .close()
        .then(() => {
          return mongoose.connect(uri, {
            dbName,
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
        })
        .then(() => {
          // Event handling for successful connection
          mongoose.connection.on("connected", () => {
            // // // console.log("Connected to MongoDB(Manager)");
          });

          // Event handling for disconnection
          mongoose.connection.on("disconnected", () => {
            // // // console.log("Disconnected from MongoDB(Manger)");
          });

          // Event handling for error
          mongoose.connection.on("error", (err) => {
            // // // console.error("Connection error:", err);
          });
        })
        .catch((err) => {
          // // // console.error("Error:", err);
        });
    } else if (user.userType === "agent") {
      dbName = `agent_${user._id.toString()}`; // Prefix with "manager_"
      mongoose.connection
        .close()
        .then(() => {
          return mongoose.connect(uri, {
            dbName,
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
        })
        .then(() => {
          // Event handling for successful connection
          mongoose.connection.on("connected", () => {
            // // // console.log("Connected to MongoDB(agent)");
          });

          // Event handling for disconnection
          mongoose.connection.on("disconnected", () => {
            // // // console.log("Disconnected from MongoDB(agent)");
          });

          // Event handling for error
          mongoose.connection.on("error", (err) => {
            // // // console.error("Connection error:", err);
          });
        })
        .catch((err) => {
          // // // console.error("Error:", err);
        });
    } else {
      // // // console.error("Invalid Role");
    }

    // Update the user object with dbName
    user.dbName = dbName;

    // Update the user's dbName in the database
    await allusersModel.findByIdAndUpdate(
      user._id, // user's ID
      { $set: { dbName } }, // setting dbName field to dbName determined above
      { new: true } // to return the updated document
    );

    // User authentication successful, create payload for JWT
    const payload = {
      userId: user._id,
      email: user.email,
      username: user.name, // Make sure to replace this with the correct user field for username
      role: user.userType,
      db: user.dbName,
      // Add other necessary user information to the payload
    };
    const token = jwt.sign(payload, "yourSecretKey", { expiresIn: "1h" });

    res.json({ message: "Login Success!", token });
  } catch (error) {
    // // // console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
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
  // // // console.log("User email domain:", userEmailDomain); // Check the extracted domain
  if (userEmailDomain === "yourcompany.com") {
    role = "admin"; // Assign admin role for specific email domain
    // // // console.log("User role:", role); // Check the role being assigned
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
    // // // console.error("Error saving user data:", error);
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
    // // // console.error("Error fetching data:", error); // Log error for debugging
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
    // // // console.error("Error updating user data:", error);
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
    // // // // console.error("Error deleting user:", error);
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
    // // // console.error("Token verification error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
});

// Create Function for Account
app.post("/createbranch", limiter, async (req, res) => {
  const {
    branchName,
    name,
    email,
    password,
    contactphone,
    branchaddress,
    userType,
  } = req.body;

  try {
    const newUser = new allusersModel({
      branchName,
      name,
      email,
      password,
      contactphone,
      branchaddress,
      userType: "manager", // Set userType to 'manager'
    });

    await newUser.save();

    res
      .status(200)
      .json({ message: "User data saved to MongoDB", data: newUser });
  } catch (error) {
    // // // console.error("Error saving user data:", error);
    res.status(500).json({ message: "Error saving user data" });
  }
});

app.put("/updatebranch/:id", limiter, async (req, res) => {
  const branchId = req.params.id;
  const {
    branchName,
    name,
    email,
    password,
    contactphone,
    branchaddress,
    userType,
  } = req.body;

  try {
    const updatedBranch = await allusersModel.findByIdAndUpdate(
      branchId,
      {
        branchName,
        name,
        email,
        password,
        contactphone,
        branchaddress,
        userType: "manager", // Set userType to 'manager'
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
    // // // console.error("Error updating branch:", error);
    res.status(500).json({ message: "Error updating branch" });
  }
});

app.post("/deletebranch/:id", limiter, async (req, res) => {
  const branchId = req.params.id;
  try {
    const deletedBranch = await allusersModel.findByIdAndDelete(branchId);

    if (!deletedBranch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res
      .status(200)
      .json({ message: "Branch deleted successfully", data: deletedBranch });
  } catch (error) {
    // // // console.error("Error deleting branch:", error);
    res.status(500).json({ message: "Error deleting branch" });
  }
});

app.get("/readbranch", limiter, async (req, res) => {
  try {
    const managerBranches = await allusersModel.find({ userType: "manager" });

    res.status(200).json({
      message: "Manager branches retrieved successfully",
      data: managerBranches,
    });
  } catch (error) {
    // // // console.error("Error retrieving manager branches:", error);
    res.status(500).json({ message: "Error retrieving manager branches" });
  }
});

// GET branch by ID
app.get("/getbranch/:id", async (req, res) => {
  const branchId = req.params.id;

  try {
    // Find the branch by ID in your MongoDB database using Mongoose
    const branch = await allusersModel.findById(branchId);

    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // If the branch is found, send it as a response
    res.status(200).json(branch);
  } catch (error) {
    // // // console.error("Error retrieving branch:", error);
    res.status(500).json({ message: "Error retrieving branch" });
  }
});

// Define an endpoint to fetch branch names
app.get("/branches/names", limiter, async (req, res) => {
  try {
    const managerBranches = await allusersModel.find(
      { userType: "manager" }, // Filter by userType 'manager'
      { branchName: 1, _id: 0 }
    );

    const branchNames = managerBranches.map((branch) => branch.branchName);

    res.status(200).json({
      message: "Manager branch names retrieved successfully",
      data: branchNames,
    });
  } catch (error) {
    // // // console.error("Error retrieving manager branch names:", error);
    res.status(500).json({ message: "Error retrieving manager branch names" });
  }
});

app.post("/createmember", upload.single("image"), limiter, async (req, res) => {
  const {
    memberNo,
    fullName,
    email,
    branchName,
    photo, // Assuming this is a URL or path to the image file
    fatherName,
    gender,
    maritalStatus,
    dateOfBirth,
    currentAddress,
    permanentAddress,
    whatsAppNo,
    idProof, // ID proof type (Aadhar, Passport, Electricity Bill, etc.)
    nomineeName,
    relationship,
    nomineeMobileNo,
    nomineeDateOfBirth,
    walletId,
    numberOfShares,
  } = req.body;

  let imageUrl = ""; // Initialize imageUrl variable

  // Check if there is an uploaded image
  if (req.file) {
    const base64String = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64String, {
      resource_type: "auto", // Specify the resource type if necessary
    });

    imageUrl = result.secure_url;
  }

  try {
    const newMember = new memberModel({
      memberNo,
      fullName,
      email,
      branchName,
      photo,
      fatherName,
      gender,
      maritalStatus,
      dateOfBirth,
      currentAddress,
      permanentAddress,
      whatsAppNo,
      idProof,
      nomineeName,
      relationship,
      nomineeMobileNo,
      nomineeDateOfBirth,
      walletId,
      numberOfShares,
    });

    // Check if walletid and shares are provided in the request body
    if (walletId === undefined || numberOfShares === undefined) {
      return res
        .status(400)
        .json({ error: "Wallet ID and shares are required" });
    }

    // Create a wallet using the provided walletid and shares
    const response = await walletModel.create({ walletId, numberOfShares });
    // // console.log(response);

    await newMember.save();

    try {
      await memberidsModel.create({ memberNo: memberNo });
    } catch (error) {
      // // console.error(error);
    }

    res
      .status(200)
      .json({ message: "Member data saved to MongoDB", data: newMember });
  } catch (error) {
    // // console.error("Error saving member data:", error);
    res.status(500).json({ message: "Error saving member data" });
  }
});

// Route for uploading images to Cloudinary and getting the URL in response
app.post("/uploadimage", upload.single("imageone"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const base64String = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64String, {
      resource_type: "auto", // Specify the resource type if necessary
    });

    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    // // console.error("Error uploading image:", error);
    res.status(500).json({ message: "Error uploading image" });
  }
});

// Route for updating a member's details and images using uploadmultiple endpoint
app.put("/updatemember/:id", async (req, res) => {
  const memberId = req.params.id;

  // Fetch existing member details from the database
  const existingMember = await memberModel.findById(memberId);
  if (!existingMember) {
    return res.status(404).json({ message: "Member not found" });
  }

  // Destructure the request body containing member details
  const {
    memberNo,
    fullName,
    email,
    branchName,
    fatherName,
    gender,
    maritalStatus,
    dateOfBirth,
    currentAddress,
    permanentAddress,
    whatsAppNo,
    nomineeName,
    relationship,
    nomineeMobileNo,
    nomineeDateOfBirth,
    walletId,
    numberOfShares,
    photo,
    idProof,
  } = req.body;

  try {
    // Determine whether to use existing URLs or new URLs from the request
    let photoUrl = photo || existingMember.photo || "";
    let idProofUrl = idProof || existingMember.idProof || "";

    // Check if photo file is uploaded
    if (req.files && req.files["photo"] && req.files["photo"][0]) {
      const formDataWithImages = new FormData();
      formDataWithImages.append("imageone", req.files["photo"][0].buffer, {
        filename: req.files["photo"][0].originalname,
      });

      const responseUpload = await axios.post(
        `${API_BASE_URL}/uploadimage`,
        formDataWithImages,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      photoUrl = responseUpload.data.urls[0];
    }

    // Check if idProof file is uploaded
    if (req.files && req.files["idProof"] && req.files["idProof"][0]) {
      const formDataWithImages = new FormData();
      formDataWithImages.append("imageone", req.files["idProof"][0].buffer, {
        filename: req.files["idProof"][0].originalname,
      });

      const responseUpload = await axios.post(
        `${API_BASE_URL}/uploadimage`,
        formDataWithImages,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      idProofUrl = responseUpload.data.urls[0];
    }

    // Find and update member details in the database
    const updatedMember = await memberModel.findByIdAndUpdate(
      memberId,
      {
        memberNo,
        fullName,
        email,
        branchName,
        fatherName,
        gender,
        maritalStatus,
        dateOfBirth,
        currentAddress,
        permanentAddress,
        whatsAppNo,
        nomineeName,
        relationship,
        nomineeMobileNo,
        nomineeDateOfBirth,
        walletId,
        numberOfShares,
        photo: photoUrl,
        idProof: idProofUrl,
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
    // // console.error("Error updating member:", error);
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
    // // console.error("Error deleting member:", error);
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
    // // console.error("Error retrieving members:", error);
    res.status(500).json({ message: "Error retrieving members" });
  }
});

app.get("/readmembersname", limiter, async (req, res) => {
  try {
    const allMembers = await memberModel.find({}, "fullName"); // Fetch 'firstName' and 'lastName' fields

    const memberNames = allMembers.map((member) => ({
      name: `${member.fullName}`, // Concatenate 'firstName' and 'lastName'
    }));

    res.status(200).json({
      message: "All member names retrieved successfully",
      data: memberNames,
    });
  } catch (error) {
    // // console.error("Error retrieving member names:", error);
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
    // // console.error("Error retrieving member IDs:", error);
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
    // // console.error("Error retrieving member:", error);
    res.status(500).json({ message: "Error retrieving member" });
  }
});

// POST endpoint to create a new loan with a specified account ID
app.post("/createloan", limiter, async (req, res) => {
  const {
    loanId,
    loanProduct,
    memberName,
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
      memberName,
      memberNo,
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
});

// PUT endpoint to update an existing loan's details along with its associated account
app.put("/updateloan/:id", limiter, async (req, res) => {
  const loanId = req.params.id;
  const {
    loanProduct,
    memberName,
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
        memberName,
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
    // // console.error("Error updating loan:", error);
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
    // // console.error("Error deleting loan:", error);
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
    // // console.error("Error retrieving loans:", error);
    res.status(500).json({ message: "Error retrieving loans" });
  }
});

// GET endpoint to fetch loans by member number
app.get("/loansbymember/:memberNo", limiter, async (req, res) => {
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
    // // console.error("Error retrieving loan:", error);
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
    // // console.error("Error retrieving member numbers:", error); // Log the specific error
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
      loanRepaymentStatus: "ongoing",
      monthstatus: "unpaid",
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
    const allRepayments = await repaymentModel.find({
      loanRepaymentStatus: { $ne: "completed" },
    });

    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Adding 1 because getMonth() returns a zero-based index

    allRepayments.forEach((repayment) => {
      const dueDate = new Date(repayment.dueDate);
      const dueMonth = dueDate.getMonth() + 1;

      // Check if the due month matches the current month
      if (dueMonth !== currentMonth) {
        repayment.monthstatus = "paid"; // Set as paid if due month is not the current month
      } else {
        repayment.monthstatus = "unpaid"; // Set as unpaid if due month is the current month
      }
    });

    res.status(200).json({
      message: "All repayment records retrieved successfully",
      data: allRepayments,
    });
  } catch (error) {
    // // console.error("Error retrieving repayment records:", error);
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
    // // console.error("Error retrieving repayment record:", error);
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
    // // console.error("Error deleting repayment record:", error);
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
    // // console.error("Error fetching approved loans:", error);
    res.status(500).json({ message: "Error fetching approved loans" });
  }
});

// POST endpoint to create a new account
app.post("/createaccounts", async (req, res) => {
  try {
    const account = await AccountModel.create(req.body);
    try {
      await accountidModel.create({ accountNumber : account.accountNumber });
    } catch (error) {
      // // console.error(error);
    }
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
    // // console.error("Error retrieving accounts:", error);
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
    // // console.error("Error retrieving account:", error);
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
    // // console.error("Error retrieving account numbers:", error);
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

    // // // console.log('Current Balance:', account.currentBalance);
    // // // console.log('transacation amount:', transactionAmount);
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
    // // console.error("Error retrieving transactions:", error);
    res.status(500).json({ message: "Error retrieving transactions" });
  }
});

// GET endpoint to fetch transactions by member ID
app.get("/transactionsbymember/:id", async (req, res) => {
  try {
    const memberId = req.params.id;

    // Find the member using the provided ID
    const member = await memberModel.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Retrieve the member number from the found member
    const memb1 = member.memberNo;

    // Fetch transactions by member number
    const transactions = await TransactionsModel.find({ member: memb1 });

    res.status(200).json({
      message: "Transactions retrieved successfully for the member",
      data: transactions,
    });
  } catch (error) {
    // // console.error("Error retrieving transactions:", error);
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
    // // console.error("Error retrieving transaction:", error);
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
    // // console.error("Error deleting transaction:", error);
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
    // // console.error("Error updating transaction:", error);
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

app.post("/uploadmultiple", upload.array("images", 2), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const promises = req.files.map(async (file) => {
      const base64String = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;

      const result = await cloudinary.uploader.upload(base64String, {
        resource_type: "auto",
      });

      return result.secure_url;
    });

    const uploadedUrls = await Promise.all(promises);

    res.status(200).json({ urls: uploadedUrls });
  } catch (error) {
    res.status(500).json({
      message: "Error uploading files to Cloudinary",
      error: error.message,
    });
  }
});

// Handle file upload to Cloudinary
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Convert the buffer to a base64 data URL
    const base64String = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64String, {
      resource_type: "auto", // Specify the resource type if necessary
    });

    // // // console.log(result);
    // Get the Cloudinary URL of the uploaded image
    const imageUrl = result.secure_url;
    // // // console.log(imageUrl);

    res.status(200).json({ url: imageUrl }); // Send the image URL back in the response
  } catch (error) {
    res.status(500).json({
      message: "Error uploading file to Cloudinary",
      error: error.message,
    });
  }
});

// Route to add a new user to the database
app.post("/users", async (req, res) => {
  try {
    const { name, email, password, userType, imageUrl, memberNo } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "No image URL provided" });
    }

    // Create a new user object with Mongoose User model
    const newUser = new allusersModel({
      name,
      email,
      password,
      userType,
      image: imageUrl, // Assign the Cloudinary URL to the user's image property
      memberNo,
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

// Get all users with userType as 'agent'
app.get("/api/users", async (req, res) => {
  try {
    const agents = await allusersModel.find();
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a user by ID
app.get("/usersdetails/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await allusersModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to update an existing user in the database
app.put("/updateintuser/:id", limiter, async (req, res) => {
  try {
    const userId = req.params.id; // Extract the user ID from the request parameters
    const {
      name,
      email,
      password,
      userType,
      memberNo,
      image,
      // Add other fields you want to update here
    } = req.body;

    // Fetch the existing user from the database
    const user = await allusersModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user object with new values
    user.name = name || user.name;
    user.email = email || user.email;
    user.password = password || user.password;
    user.userType = userType || user.userType;
    user.memberNo = memberNo || user.memberNo;
    user.image = image || user.image;
    // Update other fields similarly as needed

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "User data updated", data: user });
  } catch (error) {
    // // console.error("Error updating user data:", error);
    res.status(500).json({ message: "Error updating user data" });
  }
});

// Delete a user by ID
app.delete("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Find and delete the user entry from the database
    const deletedUser = await allusersModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ deletedUser, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
});

app.get("/loandue", async (req, res) => {
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
    // // console.error("Error counting members:", error);
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
    // // console.error("Error retrieving deposit requests pending:", error);
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
    // // console.error("Error retrieving withdraw requests pending:", error);
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
    // // console.error("Error retrieving pending loans:", error);
    res.status(500).json({ message: "Error retrieving pending loans" });
  }
});

// GET endpoint to fetch total number of loans
app.get("/totalLoans", async (req, res) => {
  try {
    const totalLoans = await loansModel.countDocuments();

    res.status(200).json({ totalLoans });
  } catch (error) {
    // // console.error("Error retrieving total number of loans:", error);
    res.status(500).json({ message: "Error retrieving total number of loans" });
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
    // // console.error("Token verification error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.get("/randomgenMemberId", limiter, async (req, res) => {
  let isUniqueIdFound = false;
  let uniqueid;

  while (!isUniqueIdFound) {
    const random = Math.floor(Math.random() * 9000 + 1000);
    uniqueid = 51520000 + random;

    const allMembers = await memberidsModel.find({}, "memberNo"); // Fetch only the 'memberNo' field
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

    const allLoans = await loanidModel.find({}, "loanId"); // Fetch only the 'loanId' field
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

    const allAccounts = await accountidModel.find({}, "accountNumber"); // Fetch only the 'accountNumber' field
    const accountNumbers = allAccounts.map((account) => account.accountNumber);

    if (!accountNumbers.includes(uniqueid)) {
      isUniqueIdFound = true;
    }
  }

  res.json({ uniqueid });
});

app.get("/randomgenWalletId", limiter, async (req, res) => {
  let isUniqueWalletIdFound = false;
  let uniqueWalletId;

  while (!isUniqueWalletIdFound) {
    const random = Math.floor(Math.random() * 90000 + 10000); // Generate a random 5-digit number
    uniqueWalletId = random;

    // Check if the generated wallet ID already exists in the database
    const existingWallet = await walletModel.findOne({
      walletid: uniqueWalletId,
    });

    if (!existingWallet) {
      isUniqueWalletIdFound = true;
    }
  }

  res.json({ uniqueWalletId });
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

    // Modify the query to fetch associated loan IDs based on the accountNumber
    const associatedLoans = await loansModel
      .find({ account: accountNumber })
      .distinct("loanId"); // Assuming 'accountNumber' is the correct field in your repaymentModel

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

app.get("/memberAccountDetails/:id", async (req, res) => {
  try {
    const memberId = req.params.id;

    const member = await memberModel.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const memberNo = member.memberNo;

    const account = await AccountModel.findOne({ memberNo });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const accountNumber = account.accountNumber;

    const transactions = await TransactionsModel.find({ accountNumber });
    let currentBalance = parseFloat(account.openingBalance);

    transactions.forEach((transaction) => {
      if (transaction.debitOrCredit === "Credit") {
        currentBalance += parseFloat(transaction.transactionAmount);
      } else {
        currentBalance -= parseFloat(transaction.transactionAmount);
      }
    });

    // Fetch associated loan IDs based on the accountNumber
    const associatedLoans = await loansModel
      .find({ account: accountNumber })
      .distinct("loanId");

    return res.status(200).json({
      accountNumber: account.accountNumber,
      availableBalance: parseFloat(currentBalance.toFixed(2)), // Rounding balance
      currentBalance: parseFloat(account.currentBalance),
      associatedLoanIds: associatedLoans.join(", "),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get("/calculate-revenue", async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({
        error: "Please provide both year and month in the query parameters.",
      });
    }

    const startDate = new Date(year, month - 1, 1); // Month in JavaScript Date starts from 0 (January)
    const endDate = new Date(year, month, 0); // To get the last day of the month

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

    // Store or update monthly revenue for the given year and month
    const filter = { year, month };
    const update = { year, month, monthlyRevenue };
    const options = { upsert: true, new: true };

    await Revenue.findOneAndUpdate(filter, update, options);

    res.json({ monthlyRevenue });
  } catch (error) {
    // // console.error("Error calculating revenue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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

// Define a route to populate revenue data for multiple years and months
app.get("/populate-revenue", async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const yearsToCalculate = 10;

    // Array to hold all the promises for revenue calculation
    const promises = [];

    for (
      let year = currentYear;
      year <= currentYear + yearsToCalculate;
      year++
    ) {
      const totalMonths =
        year === currentYear + yearsToCalculate
          ? currentDate.getMonth() + 1
          : 12;

      // Create an array of months for the current year
      const monthsArray = Array.from(
        { length: totalMonths },
        (_, month) => month + 1
      );

      // Execute revenue calculation for all months of the current year concurrently
      const yearPromises = monthsArray.map(async (month) => {
        try {
          const { monthlyRevenue } = await calculateRevenue(year, month);
        } catch (error) {
          // // // console.error(
          //   `Error calculating revenue for ${year}-${month}:`,
          //   error.message
          // );
        }
      });

      promises.push(...yearPromises);
    }

    // Wait for all promises to resolve
    await Promise.all(promises);

    res.json({ message: "Revenue data population completed" });
  } catch (error) {
    // // console.error("Error populating revenue data:", error);
    res.status(500).json({ error: "Internal server error" });
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

// Assuming allusersModel is your Mongoose model for user details
app.get("/all-users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // Retrieve user details by ID from the UserDetails model/collection
    const user = await allusersModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user details by email (using PUT request)
app.put("/update-user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { name, newEmail, password, userType, memberNo } = req.body;

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
    user.memberNo = memberNo || user.memberNo;
    // user.image = image || user.image;

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
    res.status(500).json({
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
    res.status(500).json({
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
    res.status(500).json({
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
      repayment.dueDate = new Date(); // Set it to the current date
      repayment.dueDate.setMonth(repayment.dueDate.getMonth() + 1); // Increase by one month

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
  }
);

// Endpoint to check if repayment data exists for a loan ID in the current month
app.get("/api/checkRepaymentExists/:loanId", async (req, res) => {
  try {
    const { loanId } = req.params;

    // Get the current month in 'YYYY-MM' format
    const currentMonth = moment().format("YYYY-MM");

    // Find a repayment for the specified loanId within the current month
    const repayment = await RepaymentDetails.findOne({
      loanId,
      paymentDate: {
        $gte: new Date(`${currentMonth}-01`), // Start of the current month
        $lte: new Date(moment(`${currentMonth}-01`).endOf("month").toDate()), // End of the current month
      },
    });

    const repaymentExistsForCurrentMonth = !!repayment;
    res.json({ exists: repaymentExistsForCurrentMonth });
  } catch (error) {
    // // console.error("Error checking repayment data:", error);
    res.status(500).json({ message: "Server Error" });
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
    // // console.error("Error retrieving loan ID from repayment record:", error);
    res.status(500).json({
      message: "Error retrieving loan ID from repayment record",
      error: error.message,
    });
  }
});

app.post("/createagent", limiter, async (req, res) => {
  const {
    name,
    memberNo,
    qualification,
    image, // Assuming this is a URL or path to the image file
    photo, // Assuming this is another image URL or path
    fatherName,
    maritalStatus,
    dob,
    age,
    aadhar,
    panCard,
    address,
    permanentAddress,
    email,
    mobile,
    nomineeName,
    nomineeRelationship,
    nomineeDob,
    nomineeMobile,
    password,
    branchName,
  } = req.body;

  try {
    const newAgent = new allusersModel({
      memberNo,
      name,
      qualification,
      image,
      photo,
      fatherName,
      maritalStatus,
      dob,
      age,
      aadhar,
      panCard,
      address,
      permanentAddress,
      email,
      mobile,
      nomineeName,
      nomineeRelationship,
      nomineeDob,
      nomineeMobile,
      password,
      branchName,
      userType: "agent",
    });

    await newAgent.save();

    res
      .status(200)
      .json({ message: "Agent data saved to MongoDB", data: newAgent });
  } catch (error) {
    // // console.error("Error saving agent data:", error);
    res.status(500).json({ message: "Error saving agent data" });
  }
});

// Route for updating an agent's details and images using uploadimage endpoint
app.put("/updateagent/:id", limiter, async (req, res) => {
  const agentId = req.params.id;

  try {
    const agent = await allusersModel.findById(agentId);

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Destructure the fields from the request body
    const {
      memberNo,
      name,
      qualification,
      fatherName,
      maritalStatus,
      dob,
      age,
      aadhar,
      panCard,
      address,
      permanentAddress,
      email,
      mobile,
      nomineeName,
      nomineeRelationship,
      nomineeDob,
      nomineeMobile,
      password,
      image,
      photo,
      branchName,
    } = req.body;

    // Update agent object with new values
    agent.memberNo = memberNo || agent.memberNo;
    agent.name = name || agent.name;
    agent.qualification = qualification || agent.qualification;
    agent.fatherName = fatherName || agent.fatherName;
    agent.maritalStatus = maritalStatus || agent.maritalStatus;
    agent.dob = dob || agent.dob;
    agent.age = age || agent.age;
    agent.aadhar = aadhar || agent.aadhar;
    agent.panCard = panCard || agent.panCard;
    agent.address = address || agent.address;
    agent.permanentAddress = permanentAddress || agent.permanentAddress;
    agent.email = email || agent.email;
    agent.mobile = mobile || agent.mobile;
    agent.nomineeName = nomineeName || agent.nomineeName;
    agent.nomineeRelationship =
      nomineeRelationship || agent.nomineeRelationship;
    agent.nomineeDob = nomineeDob || agent.nomineeDob;
    agent.nomineeMobile = nomineeMobile || agent.nomineeMobile;
    agent.password = password || agent.password;
    agent.image = image || agent.image;
    agent.photo = photo || agent.photo;
    agent.branchName = branchName || agent.branchName;

    // Save the updated agent
    await agent.save();

    res.status(200).json({ message: "Agent data updated", data: agent });
  } catch (error) {
    // // console.error("Error updating agent data:", error);
    res.status(500).json({ message: "Error updating agent data" });
  }
});

// CREATE
app.post("/wallet", async (req, res) => {
  try {
    const { walletid, shares } = req.body;
    const createdWallet = await walletModel.create({ walletid, shares });
    res.status(201).json(createdWallet);
  } catch (error) {
    res.status(500).json({ error: "Error creating wallet" });
  }
});

// READ
app.get("/wallet/:walletId", async (req, res) => {
  try {
    const walletId = req.params.walletId;
    const wallet = await walletModel.findOne({ walletid: walletId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: "Error fetching wallet" });
  }
});

// UPDATE
app.put("/wallet/:walletId", async (req, res) => {
  try {
    const walletId = req.params.walletId;
    const { shares } = req.body;
    const updatedWallet = await walletModel.findOneAndUpdate(
      { walletid: walletId },
      { $set: { shares } },
      { new: true }
    );
    if (!updatedWallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    res.json(updatedWallet);
  } catch (error) {
    res.status(500).json({ error: "Error updating wallet shares" });
  }
});

// DELETE
app.delete("/wallet/:walletId", async (req, res) => {
  try {
    const walletId = req.params.walletId;
    const deletedWallet = await walletModel.findOneAndDelete({
      walletid: walletId,
    });
    if (!deletedWallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    res.json(deletedWallet);
  } catch (error) {
    res.status(500).json({ error: "Error deleting wallet" });
  }
});

// Endpoint to delete images not found in the provided image URLs list
// app.delete("/deleteOrphanImages", async (req, res) => {
//   try {
//     const { imageUrls } = req.body; // Assuming imageUrls is an array of image URLs

//     // Fetch all image names from Cloudinary
//     const cloudinaryImageNames = await cloudinary.api.resources({
//       type: "upload",
//     });

//     const cloudinaryImageNamesArray = cloudinaryImageNames.resources.map(
//       (image) => image.public_id
//     );

//     // Find images in Cloudinary that are not present in the provided image URLs list
//     const imagesToDelete = cloudinaryImageNamesArray.filter(
//       (imageName) => !imageUrls.includes(imageName)
//     );

//     // Delete images from Cloudinary that are not found in the provided image URLs list
//     for (const imageName of imagesToDelete) {
//       await cloudinary.uploader.destroy(imageName);
//     }

//     res.status(200).json({ message: "Orphan images deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

app.get("/expense-per-year", async (req, res) => {
  try {
    const expenseData = await ExpenseModel.aggregate([
      {
        $group: {
          _id: { $year: "$date" },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // Calculate the total expense from the aggregated data
    const totalExpense = expenseData.reduce(
      (total, item) => total + item.totalAmount,
      0
    );

    const formattedData = expenseData.map((item) => ({
      x: item._id.toString(), // Convert year to string
      y: item.totalAmount,
      text: `${((item.totalAmount / totalExpense) * 100).toFixed(2)}%`, // Calculate percentage
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch stacked chart data (yearly profits)
app.get("/stacked-chart-data", async (req, res) => {
  try {
    const yearlyProfits = await Revenue.aggregate([
      {
        $group: {
          _id: "$year", // Grouping by year
          totalProfit: { $sum: "$monthlyRevenue" }, // Calculating yearly profit
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id field from the result
          x: "$_id", // Rename _id to x
          y: "$totalProfit", // Yearly profit as y value
        },
      },
    ]);

    res.json(yearlyProfits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assuming you have an Express route to handle the request
app.get("/getAllMemberImages", async (req, res) => {
  try {
    // Find all documents in the 'members' collection where 'photo' and 'idProof' fields exist and are not null or empty
    const allMemberImages = await memberModel.find(
      {
        $or: [
          { photo: { $exists: true, $ne: null, $ne: "" } },
          { idProof: { $exists: true, $ne: null, $ne: "" } },
        ],
      },
      ["photo", "idProof"]
    );

    // Extract image URLs from the retrieved documents
    const imageUrls = allMemberImages.reduce((acc, member) => {
      if (member.photo) {
        acc.push(member.photo);
      }
      if (member.idProof) {
        acc.push(member.idProof);
      }
      return acc;
    }, []);

    res.status(200).json({ imageUrls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assuming an Express route to handle the request
app.get("/getAllAccountImages", async (req, res) => {
  try {
    // Find all documents in the 'accounts' collection where 'photo' and 'idProof' fields exist and are not null or empty
    const allAccountImages = await AccountModel.find(
      {
        $or: [
          { photo: { $exists: true, $ne: null, $ne: "" } },
          { idProof: { $exists: true, $ne: null, $ne: "" } },
        ],
      },
      ["photo", "idProof"]
    );

    // Extract image URLs from the retrieved documents
    const imageUrls = allAccountImages.reduce((acc, account) => {
      if (account.photo) {
        acc.push(account.photo);
      }
      if (account.idProof) {
        acc.push(account.idProof);
      }
      return acc;
    }, []);

    res.status(200).json({ imageUrls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch all images from the 'userdetails' collection
app.get("/getAllUserImages", async (req, res) => {
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
});

// Endpoint to update loan status to Approved
app.put("/approveaccount/:accountId", async (req, res) => {
  const { accountId } = req.params;

  try {
    // Assuming you have a LoanModel or a similar model/schema
    const account = await AccountModel.findByIdAndUpdate(
      accountId,
      { approval: "Approved" },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res
      .status(200)
      .json({ message: "Account status updated to Approved", account });
  } catch (error) {
    res.status(500).json({
      message: "Error updating Account status to Approved",
      error: error.message,
    });
  }
});

// Endpoint to update loan status to Cancelled
app.put("/cancelaccount/:accountId", async (req, res) => {
  const { accountId } = req.params;

  try {
    const account = await AccountModel.findByIdAndUpdate(
      accountId,
      { approval: "Cancelled" },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res
      .status(200)
      .json({ message: "Account status updated to Cancelled", account });
  } catch (error) {
    res.status(500).json({
      message: "Error updating Account status to Cancelled",
      error: error.message,
    });
  }
});

app.get("/admin-databases", async (req, res) => {
  try {
    // Find all databases where userType is 'admin'
    const adminDatabases = await allusersModel.find().distinct("dbName");

    res.status(200).json({ databases: adminDatabases });
  } catch (error) {
    // // console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET endpoint to fetch databases based on a specific branchName
app.get("/branch-databases/:objectId", async (req, res) => {
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
    // // console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Endpoint to fetch user details based on database name input
app.get("/userdetails/:databaseName", async (req, res) => {
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
});

app.get("/switch-database/:dbName", async (req, res) => {
  const { dbName } = req.params;

  try {
    mongoose.connection
      .close()
      .then(() => {
        return mongoose.connect(uri, {
          dbName,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
      })
      .then(() => {
        // Event handling for successful connection
        mongoose.connection.on("connected", () => {
          // // console.log("Connected to MongoDB(agent)");
        });

        // Event handling for disconnection
        mongoose.connection.on("disconnected", () => {
          // // console.log("Disconnected from MongoDB(agent)");
        });

        // Event handling for error
        mongoose.connection.on("error", (err) => {
          // // console.error("Connection error:", err);
        });
      })
      .catch((err) => {
        // // console.error("Error:", err);
      });

    res.json({ message: "Database switched successfully" });
  } catch (error) {
    // // console.error("Switch Database Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to get total due amount and total amount paid for this month
app.get('/totals-this-month', async (req, res) => {
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
          totalDueAmount: { $sum: '$dueAmount' },
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
          totalAmountPaid: { $sum: '$dueAmountPaid' },
        },
      },
    ]);

    const result = {
      totalDueAmountThisMonth: totalDueAmountThisMonth.length > 0 ? totalDueAmountThisMonth[0].totalDueAmount : 0,
      totalAmountPaidThisMonth: totalAmountPaidThisMonth.length > 0 ? totalAmountPaidThisMonth[0].totalAmountPaid : 0,
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch repaymentDetails data with populated Member Name from AccountModel
app.get("/recentCollection", async (req, res) => {
  try {
    const repaymentDetails = await RepaymentDetails.find({})
      .lean();

    // Retrieve memberName from AccountModel using accountId
    const formattedData = await Promise.all(repaymentDetails.map(async (detail) => {
    const account = await AccountModel.findOne({ accountId: repaymentDetails.accountId }).lean();
      return {
        Date: detail.paymentDate,
        "Member Name": account ? account.memberName : 'N/A', // If account or memberName is not found, set as 'N/A'
        "Account Number": detail.accountId,
        Amount: detail.dueAmountPaid,
        Status: (detail.dueAmountPaid > 0) ? 'Paid' : 'Unpaid'
      };
    }));

    res.status(200).json({ RecentCollection: formattedData });
  } catch (error) {
    // // console.error("Error retrieving recent collection data:", error);
    res.status(500).json({ message: "Error retrieving recent collection data" });
  }
});

app.listen(PORT, () => {
  // // console.log(`Server is running on port ${PORT}`);
});
