const mongoose = require("mongoose");
const VendorCategorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
    default: "default.jpg",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("vendorCategories", VendorCategorySchema);