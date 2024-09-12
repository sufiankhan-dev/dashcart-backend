const mongoose = require("mongoose");

const RiderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  trackerno: { type: Number, },
  items: { type: String, },
  phone: { type: String, required: true }, // Added phone number
  email: { type: String, required: true, unique: true }, // Added email
  password: { type: String, required: true }, // Added password
  
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],

  date: {
    type: Date,
    default: Date.now
  }
});

const Rider = mongoose.model("Rider", RiderSchema);

module.exports = Rider;
