const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
    employeeName: {
        type: String,
        required: true,
    },
    employeeAddress: {
        type: String,
        required: true,
    },
    employeeIDNumber: {
        type: String,
        default: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,  // Generates a random ID like EMP-1234
        required: true,
    },
    contactNumber1: {
        type: String,
        required: true,
    },
    contactNumber2: {
        type: String,
        required: false,  // Optional second contact number
    },
    employeeCategory: {
        type: String,
        enum: ["Shack", "Regular"],

        required: true,  // Employee category (can be a string or enum)
    },
    guardCardNumber: {
        type: String,
        required: true,
    },
    issueDate: {
        type: Date,
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    payRate: {
        type: Number,
        required: true,
    },
    managerName: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
        required: false,  // Optional field
    },
    approved: {
        type: Boolean,
        default: false,  // Approval status, defaults to false
    },
    status: {
        type: String,
        enum: ["active", "inactive", "terminated"],
        default: "active",  // Employee status
    },
    createdAt: {
        type: Date,
        default: Date.now,  // Automatically sets the creation date
    }
});

module.exports = mongoose.model("Employee", EmployeeSchema);
