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
    required: true,
  },
  phoneNumber2: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  secondaryEmail: {
    type: String,
  },
  address: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  type: {
    type: String,
    default: "user",
},
status: {
  type: String,
  enum: ['active', 'inactive', 'deleted'], // Ensure these statuses are defined
  default: 'active',
},
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024,
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
