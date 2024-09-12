const mongoose = require("mongoose");
const HomePageSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    banner: {
        type: String,
        required: true
    },
})
module.exports = mongoose.model("HomePage", HomePageSchema)
