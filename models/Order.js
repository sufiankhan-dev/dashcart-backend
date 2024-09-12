const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    orderNumber: {
        type: String,
        default: `SSQ-${Math.floor(1000 + Math.random() * 9000)}`,
        required: true
    },
    products: [
        {
            vendor: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Vendor"
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: {
                type: Number,
                required: true
            },
            status: {
                type: String,
                enum: ["pending", "assigned", "shipped out", "delivered"],
                default: "pending"
            }
        }
    ],
    rider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rider"
    },
    status: {
        type: String,
        enum: ["pending", "assigned", "completed"],
        default: "pending"
    },
    date_of_delivery: {
        type: Date
    },
    deliveryFee: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true,
    },
    platformFee: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true,
        get: (value) => {
            return parseFloat(value.toFixed(2));
        }
    },
    grandTotal: {
        type: Number,
        required: true,
        get: (value) => {
            return parseFloat(value.toFixed(2));
        }
    },
    address: {
        type: {
            address: {
                type: String,
                required: true
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
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Order", OrderSchema);