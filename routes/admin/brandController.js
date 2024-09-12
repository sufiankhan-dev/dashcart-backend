const express = require('express');
const router = express.Router();
const Brand = require('../../models/Brand');
const Product = require('../../models/Product');

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

router.post('/create-brand', async (req, res) => {
    try {
        const { name, image } = req.body
        if (!name) return res.status(400).json({ message: "Brand name is required" })
        const brandExists = await Brand.findOne({ name })
        if (brandExists) return res.status(400).json({ message: "Brand already exists" })

        const brand = new Brand({
            name,
            image
        })

        await brand.save()
        res.status(201).json({ message: "Brand created successfully" })
    } catch (error) {
        console.log("error creating brand", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.put('/update-brand/:id', async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id)
        if (!brand) return res.status(404).json({ message: "Brand not found" })
        const { name, image } = req.body
        if (!name) return res.status(400).json({ message: "Brand name is required" })

        brand.name = name || brand.name
        brand.image = image || brand.image

        await brand.save()
        res.status(200).json({ message: "Brand updated successfully" })
    } catch (error) {
        console.log("error updating brand", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.delete('/delete-brand/:id', async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id)
        if (!brand) return res.status(404).json({ message: "Brand not found" })
        const products = await Product.find({ brand: req.params.id })

        if (products.length > 0) {
            Product.deleteMany({ brand: req.params.id })
        }

        await Brand.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: "Brand deleted successfully" })
    } catch (error) {
        console.log("error deleting brand", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router;