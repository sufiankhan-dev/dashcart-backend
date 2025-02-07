const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
  },
  phoneNumber1: {
    type: String,
  },
  phoneNumber2: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    default: "admin",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "deleted"], // Ensure these statuses are defined
    default: "active",
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024,
  },
  otp: {
    type: String, // OTP as a string (for storing 6-digit codes)
  },
  otpExpires: {
    type: Date, // Store when the OTP will expire
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
});

module.exports = mongoose.model("User", UserSchema);
