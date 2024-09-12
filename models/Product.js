const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
    },
    sku: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    // brand: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Brand"
    // },
    image: {
        type: String,
        default: "https://www.stock.idfbd.org/assets/img/stock.png"
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    stock: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Product", ProductSchema);