const mongoose = require("mongoose");

// Schema for Attendance
const AttendanceSchema = new mongoose.Schema({

  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location", // Reference to Location model
    required: true,
  },
  employee: { // Add the employee reference here
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee", // Assuming the model is named Employee
    required: true,
  },

  callingTimes:{
    type:[String]
  },

  note:{
    type:[String]
  },

  checkInTime: {
    type: [Date], // Store as Date for actual timestamps
  },
  checkOutTime: {
    type: [Date], // Store as Date for actual timestamps
  },
  
  status: {
    type: String,
    enum: ["Present", "Absent", "On Leave"], // Attendance status
    default: "Present",
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically record the creation time
  },
});

AttendanceSchema.index({ employee: 1 });
AttendanceSchema.index({ location: 1 });

module.exports = mongoose.model("Attendance", AttendanceSchema);