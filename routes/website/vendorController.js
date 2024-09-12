const express = require("express")
const router = express.Router()
const Vendor = require("../../models/User")

router.get("/get-vendors", async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * limit
        const hasNextPage = await Vendor.find().limit(limit).skip(skip + limit)
        const vendors = await Vendor.find({ type: "vendor" }).limit(limit).skip(skip).select("-password -role -__v -type -status -date")
        const paginationObj = {
            page,
            limit,
            total: await Vendor.countDocuments(),
            hasNextPage: hasNextPage.length > 0
        }
        res.status(200).json({ vendors, pagination: paginationObj })
    } catch (error) {
        console.log("Error fetching vendors: ", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.get("/get-vendors/:id", async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ type: "vendor", _id: req.params.id }).select("-password -role -__v -type -status -date -featured")
        if (!vendor) return res.status(404).json({ message: "Vendor not found" })
        res.status(200).json(vendor)
    } catch (error) {
        console.log("Error fetching vendor: ", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router