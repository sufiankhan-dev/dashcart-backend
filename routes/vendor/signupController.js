const express = require("express");
const router = express.Router()
const Vendor = require("../../models/User")
const VendorCategory = require("../../models/VendorCategory")

// TODO: Implement the vendor signup route
router.post("/signup", async (req, res) => {
    try {
        const { image, shopUrl, shopName, vendorCategory } = req.body
        if (!image || !shopName || !vendorCategory) return res.status(400).json({ message: "All fields are required" })
        const vendorCategoryExists = await VendorCategory.findById(vendorCategory)
        if (!vendorCategoryExists) return res.status(400).json({ message: "Vendor category not found" })
        if(!req.body.image || req.body.shopName || req.body.shopUrl || req.body.vendorCategory) return res.status(400).json({ message: "All fields are required" })

        const user = await Vendor.findById(req.user._id)
        if (!user) return res.status(404).json({ message: "User not found" })
        user.image = image
        user.shopUrl = shopUrl
        user.shopName = shopName
        user.vendorCategory = vendorCategory
        user.type = "vendor"
        await user.save()

        res.status(201).json({ message: "Vendor created successfully" })
    } catch (error) {
        console.log("Error signing up vendor", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router;