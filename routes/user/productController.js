const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const Category = require("../../models/Category");

router.get("/get-products", async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * parseInt(limit)

        let filters = {
            isApproved: true,
            status: "active"
        }
        if (req.query.category) filters.category = req.query.category
        if (req.query.brand) filters.brand = req.query.brand
        if (req.query.vendor) filters.vendor = req.query.vendor
        if (req.query.featured) filters.featured = req.query.featured

        const products = await Product.find(filters).limit(parseInt(limit)).skip(skip).populate("category").populate({
            path: "vendor",
            select: "-password"
        })
        const total = await Product.countDocuments(filters)

        const hasNextPage = (skip + parseInt(limit)) < total

        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
        }
        res.status(200).json({ products, pagination: paginationObj })
    } catch (error) {
        console.log("Error fetching products", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.get("/get-products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate({
            path: "category",
        }).populate({
            path: "vendor",
            select: "name"
        })
        if(!product) return res.status(404).json({message: "Product not found"})
        res.status(200).json(product)
    } catch(error) {
        console.log("Error fetching product", error)
        res.status(500).json({message: "Internal server error"})
    }
})

module.exports = router;