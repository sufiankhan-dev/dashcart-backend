const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
<<<<<<< HEAD
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
=======
  name: { type: String, required: true },
  phone: {
    type: String,
    required: true,
  },
>>>>>>> feded41b563f2b693ea250b88757a10f5fe8c52b
  email: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
<<<<<<< HEAD
    default: "admin",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "deleted"], // Ensure these statuses are defined
    default: "active",
=======
    default: "user",
>>>>>>> feded41b563f2b693ea250b88757a10f5fe8c52b
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024,
  },
<<<<<<< HEAD
  otp: {
    type: String, // OTP as a string (for storing 6-digit codes)
  },
  otpExpires: {
    type: Date, // Store when the OTP will expire
  },
=======
  status: {
    type: String,
    enum: ["active", "inactive", "deleted"],
    default: "active",
},
>>>>>>> feded41b563f2b693ea250b88757a10f5fe8c52b
  createdAt: {
    type: Date,
    default: Date.now,
  },
<<<<<<< HEAD
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
=======
>>>>>>> feded41b563f2b693ea250b88757a10f5fe8c52b
});

module.exports = mongoose.model("User", UserSchema);
