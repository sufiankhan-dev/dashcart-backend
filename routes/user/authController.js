const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Vendor = require("../../models/Vendor");
const bcrypt = require("bcryptjs");
const Role = require("../../models/Role");
const jwt = require("jsonwebtoken");
const emailValidation = require("../../helper/fieldValidation").emailValidation;
const sendEmail = require("../../models/SendEmail"); // Assuming sendEmail.js is in utils
const crypto = require("crypto");

// Generate a random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Signup without OTP
router.post("/signup", async (req, res) => {
  try {
    const {
      country,
      state,
      city,
      firstName,
      lastName,
      middleName, // Optional
      phoneNumber1,
      phoneNumber2, // Optional
      email,
      secondaryEmail, // Optional
      address, // Optional
      dateOfBirth,
      gender,
      password,
      role, // Role ID (optional, added role reference)
    } = req.body;

    // Required fields for validation
    const requiredFields = {
      country,
      state,
      city,
      firstName,
      lastName,
      phoneNumber1,
      email,
      dateOfBirth,
      gender,
      password,
    };

    // Check if required fields are missing
    for (let [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res
          .status(400)
          .json({ message: `${key} is required and must be filled.` });
      }
    }

    // Email validation
    if (!emailValidation(email.toLowerCase())) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Check if email already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Check if phone number already exists
    const phoneExists = await User.findOne({ phoneNumber1 });
    if (phoneExists) {
      return res.status(400).json({
        message: "Phone number is already associated with another account.",
      });
    }

    // Validate date of birth format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Format: YYYY-MM-DD
    if (!dateRegex.test(dateOfBirth)) {
      return res
        .status(400)
        .json({ message: "Date of birth must be in the format YYYY-MM-DD." });
    }

    // Validate role if provided
    let roleReference;
    if (role) {
      roleReference = await Role.findById(role);
      if (!roleReference) {
        return res.status(400).json({ message: "Invalid role ID." });
      }
    } else {
      // Optionally, assign a default role if none is provided
      roleReference = await Role.findOne({ name: "User" });
      if (!roleReference) {
        return res.status(400).json({ message: "Default role not found." });
      }
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create the new user with role reference
    const newUser = new User({
      country,
      state,
      city,
      firstName,
      lastName,
      middleName,
      phoneNumber1,
      phoneNumber2,
      email: email.toLowerCase(),
      secondaryEmail,
      address,
      dateOfBirth,
      gender,
      password: hashedPassword,
      role: roleReference._id, // Role reference
    });

    // Save the new user
    await newUser.save();

    return res.status(201).json({
      message: "User signed up successfully.",
      user: newUser,
    });
  } catch (error) {
    console.error("Error signing up user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// Login with OTP
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });
    email = email.toLowerCase();

    let user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(404).json({ message: "User not found" });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid)
      return res.status(401).json({ message: "Invalid password" });

    // Generate and send OTP for login
    const otp = generateOTP();
    await sendEmail(email, otp);

    // Temporarily save OTP for verification
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();

    res.status(200).json({ message: "OTP sent to email for verification" });
  } catch (error) {
    console.log("error logging in user", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Verify OTP and Complete Login
router.post("/verify-login-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    let user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp !== otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP is valid, clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_KEY);
    res
      .status(200)
      .json({ message: "OTP verified. User logged in", token, user });
  } catch (error) {
    console.log("error verifying otp", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
