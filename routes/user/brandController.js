const express = require('express');
const router = express.Router();
const Brand = require('../../models/Brand');

router.get('/get-brands', async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * parseInt(limit)

        const total = await Brand.countDocuments()
        const hasNextPage = (skip + parseInt(limit)) < total
        const brands = await Brand.find().limit(limit).skip(skip)
        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
        }
        res.status(200).json({ brands, pagination: paginationObj })
    } catch (error) {
        console.log("error fetching brands", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.get('/get-brands/:id', async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id)
        if (!brand) return res.status(404).json({ message: "Brand not found" })
        res.status(200).json(brand)
    } catch (error) {
        console.log("error fetching brand", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router;