const mongoose = require("mongoose")
const DiscountSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    type: {
        type: String,
        enum: ["percentage", "fixed"],
        default: "percentage"
    },
    description: {
        type: String
    },
    date:{
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model("Discount", DiscountSchema)