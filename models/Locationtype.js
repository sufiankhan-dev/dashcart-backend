const mongoose = require('mongoose');
const LocationTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    maincategory: {
        type: String,
        required: true,
        enum: ["Commercial", "Construction"],
    },
    date: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('LocationType', LocationTypeSchema);

