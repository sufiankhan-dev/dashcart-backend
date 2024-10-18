const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Vendor = require("../../models/Vendor");
const bycrypt = require("bcryptjs");
const Role = require("../../models/Role");
const jwt = require("jsonwebtoken");
const emailValidation = require("../../helper/fieldValidation").emailValidation;

router.post("/signup", async (req, res) => {
  try {
    let { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone)
      return res.status(400).json({ message: "All fields are required" });
    email = email.toLowerCase();
    if (!emailValidation(email))
      return res.status(400).json({ message: "Invalid email format" });
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User Email already exists" });
    const phoneExists = await User.findOne({ phone });
    if (phoneExists)
      return res.status(400).json({ message: "User Phone already exists" });

    const user = new User({
      email,
      password: bycrypt.hashSync(password, 10),
      name,
      phone,
    });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log("error signing up user", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });
    email = email.toLowerCase();

    let user = await User.findOne({ email }).select("+password");

    if (!user) user = await Vendor.findOne({ email }).select("+password");

    if (!user) return res.status(404).json({ message: "User not found" });

    const passwordIsValid = bycrypt.compareSync(password, user.password);
    if (!passwordIsValid)
      return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_KEY);
    user.password = "";

    res
      .status(200)
      .json({
        message: "User logged in successfully",
        token: token,
        user: user,
      });
  } catch (error) {
    console.log("error logging in user", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
