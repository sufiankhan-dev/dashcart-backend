const mongoose = require('mongoose');
const BrandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "https://eow.wildlifeobservatory.org/media/default_logo.png"
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
module.exports = mongoose.model("Brand", BrandSchema);