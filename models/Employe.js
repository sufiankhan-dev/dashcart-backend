const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  employeeName: {
    type: String,
  },
  employeeAddress: {
    type: String,
  },
  employeeIDNumber: {
    type: String,
  },
  contactNumber1: {
    type: String,
  },
  contactNumber2: {
    type: String,
  },
  employeeCategory: {
    type: String,
    enum: ["Shack", "Regular"],
  },
  guardCardNumber: {
    type: String,
  },
  issueDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
  payRate: {
    type: Number,
  },
  managerName: {
    type: String,
  },
  notes: {
    type: String,
  },
  approved: {
    type: Boolean,
  },
  salarystatus: {
    type: String,
    enum: ["paid", "unpaid"],
    default: "unpaid",
  },
  type: {
    type: String,
    default: "user",
  },

  status: {
    type: String,
    enum: ["active", "inactive", "terminated"],
    default: "active", // Employee status
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the creation date
  },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
