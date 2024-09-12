const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const configSchema = new Schema({
    deliveryFeeV1: {
        type: Number,
        required: true
    },
    deliveryFeeV2: {
        type: Number,
        required: true
    },
    deliveryFeeVI: {
        type: Number,
        required: true
    },
    platformFee: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Config', configSchema);