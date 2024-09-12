const mongoose = require('mongoose');
const Schema = mongoose.Schema

const vendorSchema = new Schema({
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
        default: "vendor",
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
    image: {
        type: String,
        default: "https://cdn.vox-cdn.com/thumbor/7HRjMUBf0ObMoA33zNPSYJEKsOE=/0x0:1600x1067/620x465/filters:focal(672x406:928x662):format(webp)/cdn.vox-cdn.com/uploads/chorus_image/image/57698831/51951042270_78ea1e8590_h.7.jpg",
    },
    shopUrl: {
        type: String,
        required: true,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    shopName: {
        type: String,
        required: true,
    },
    shopAddress: {
        type: String,
        required: true,
    },
    vendorCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vendorCategories",
    },
    date: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('Vendor', vendorSchema)