const mongoose = require("mongoose");
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: this.email != "" ? true : false,
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6,
  },
  type: { 
    type: String,
    default: "user",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "deleted"],
    default: "active",
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: [
      {
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
        },
        floor: {
          type: String,
        },
        street: {
          type: String,
        },
        room: {
          type: String,
        },
        tag: {
          type: String,
        },
      }
    ],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("users", UserSchema);