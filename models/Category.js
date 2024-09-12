const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    image: {
        type: String,
        default: "https://as1.ftcdn.net/v2/jpg/03/59/09/04/1000_F_359090423_7kA3WC9HnDEf1I9dx4ccGFhhO90vmzhk.jpg"
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    featured: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Category", CategorySchema);