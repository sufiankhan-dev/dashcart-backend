const express = require("express");
const router = express.Router();
const Category = require("../../models/Category");

router.get("/get-categories", async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * parseInt(limit)

        const total = await Category.countDocuments()
        
        const hasNextPage = (skip + parseInt(limit)) < total
        const categories = await Category.find().limit(limit).skip(skip)
        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
        }
        res.status(200).json({categories, pagination: paginationObj})
    } catch(error) {
        console.log("Error fetching categories", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.get("/get-categories/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        if(!category) return res.status(404).json({message: "Category not found"})
        res.status(200).json(category)
    } catch(error) {
        console.log("Error fetching category", error)
        res.status(500).json({message: "Internal server error"})
    }
})

module.exports = router;