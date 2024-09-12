const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const Order = require("../../models/Order");

router.get("/get-dashboard", async (req, res) => {
    try {
        const vendorId = req.user.id
        const products = await Product.find({vendor: req.user._id})
        let orders = await Order.find(
        ).populate("products.product").populate({
            path: "user",
            select: "-password -role -type -createdAt -date -status"
        })

        orders = orders.filter(order => {
            return order.products.some(product => product.product.vendor.toString() === vendorId)
        })

        const dashboard = {
            products: products.length,
            order: orders.length
        }

        res.status(200).json({dashboard})
    } catch(error) {
        console.log("Error Fetching Dashboard", error)
        res.status(500).json({message: "Internal server error"})
    }
})

module.exports = router;