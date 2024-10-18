const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    default: "user",
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "deleted"],
    default: "active",
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
