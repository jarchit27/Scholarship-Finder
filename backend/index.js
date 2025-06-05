const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const config = require("./config.json");
const User = require("./models/user.model");
const Scholarship = require("./models/scholarship.model");
const { authenticateToken } = require("./utilities");

dotenv.config();

mongoose.connect(config.connectString)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
const PORT = 8000;
const recommendationRoute = require("./routes/recommendation");

app.use(cors());
app.use(express.json());
app.use("/api", recommendationRoute);

/**
 * Create Account
 */
app.post("/create-account", async (req, res) => {
  const { fullname, email, password, gender,category ,address, education } = req.body;

  if (!fullname || !email || !password || !gender || !category) {
    return res.status(400).json({ error: true, message: "All required fields must be filled" });
  }

  if (!["male", "female", "other"].includes(gender.trim().toLowerCase())) {
    return res.status(400).json({ error: true, message: "Valid Gender is required (Male, Female, Other)" });
  }

  const isUser = await User.findOne({ email });
  if (isUser) {
    return res.status(400).json({ error: true, message: "User already exists" });
  }

  const user = new User({
    fullname,
    email,
    password, // 🔒 You should hash this!
    category,
    gender,
    address, // Keep as string
    education: education ? {
      qualification: education.qualification,
      institution: education.institution,
      yearOfPassing: education.yearOfPassing,
      scoreType: education.scoreType,
      scoreValue: education.scoreValue,
    } : undefined,
  });

  await user.save();

  const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "10h",
  });

  return res.status(201).json({
    error: false,
    user: { fullname: user.fullname, email: user.email, _id: user._id },
    accessToken,
    message: "Registration Successful",
  });
});

/**
 * Login
 */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: true, message: "Email and password are required" });
  }

  const userInfo = await User.findOne({ email });

  if (!userInfo || userInfo.password !== password) {
    return res.status(400).json({ error: true, message: "Wrong credentials" });
  }

  const accessToken = jwt.sign({ userId: userInfo._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "10h",
  });

  return res.json({
    error: false,
    message: "Login Successful",
    email,
    accessToken,
  });
});

/**
 * Get Authenticated User
 */
app.get("/get-user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: true, message: "Unauthorized: Token missing" });
    }


    const user = await User.findById(userId).select("fullname email _id gender category address education");

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    return res.status(200).json({
      error: false,
      user,
      message: "",
    });
  } catch (err) {
    console.error("Error in /get-user:", err);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

/**
 * Get All Scholarships
 */
app.get("/get-all-scholarships", authenticateToken, async (req, res) => {
  try {
    const scholarships = await Scholarship.find();
    return res.json({
      error: false,
      scholarships,
      message: "All scholarships fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

/**
 * Start Server
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

module.exports = app;
