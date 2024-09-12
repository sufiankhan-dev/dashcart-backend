const express = require("express");
const router = express.Router();
const Discount = require("../../models/Discount");

router.get("/get-discounts", async (req, res) => {
    try {
        const discounts = await Discount.find({status: "active"})
        if (!discounts) return res.status(404).json({ message: "No discounts found" })
        res.status(200).json(discounts)
    } catch (error) {
        console.log("Error fetching discounts", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router;