const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const Brand = require("../../models/Brand");

router.get("/get-products", async (req, res) => {
    try{
        const vendorId = req.user.id
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * limit
        const hasNextPage = await Product.find().limit(limit).skip(skip + limit)

        let filters = {}
        filters.vendor = vendorId
        if(req.query.category) filters.category = req.query.category
        if(req.query.brand) filters.brand = req.query.brand
        if(req.query.vendor) filters.vendor = req.query.vendor
        if(req.query.featured) filters.featured = req.query.featured

        const products = await Product.find(filters).limit(limit).skip(skip)

        const paginationObj = {
            page,
            limit,
            total: await Product.countDocuments(filters),
            hasNextPage: hasNextPage.length > 0
        }
        res.status(200).json({products, pagination: paginationObj})
    } catch(error){
        console.log("Error fetching categories", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.get("/get-products/:id", async (req, res) => {
    try {
        const product = await Product.find({vendor: req.user.id, _id: req.params.id}).populate("category")
        if(!product) return res.status(404).json({message: "Product not found"})
        res.status(200).json(product)
    } catch (error){
        console.log("Error fetching product", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.post("/create-product", async (req, res) => {
    try {
        const {name, sku, description, price, category, image, stock} = req.body
        if(!name || !sku || !price || !category ) return res.status(400).json({message: "All fields are required"})
        const productExists = await Product.findOne({sku, vendor: req.user.id})
        if(productExists) return res.status(400).json({message: "Product already exists"})
        const categoryExists = await Category.findById(category)
        if(!categoryExists) return res.status(400).json({message: "Category not found"})
        // const brandExists = await Brand.findById(brand)
        // if(!brandExists) return res.status(400).json({message: "Brand not found"})

        const newProduct = new Product({
            name,
            sku,
            description,
            price,
            category,
            image,
            stock,
            vendor: req.user.id
        })

        await newProduct.save()
        res.status(201).json({message: "Product created successfully"})
    } catch (error){
        console.log("Error creating product", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.put("/update-product/:id", async (req, res) => {
    try {
        const {name, sku, description, price, category, image, stock} = req.body
        const product = await Product.find({vendor: req.user.id, _id: req.params.id})
        if(!product) return res.status(404).json({message: "Product not found"})

        product.name = name || product.name
        product.sku = sku || product.sku
        product.description = description || product.description
        product.price = price || product.price
        product.category = category || product.category
        // product.brand = brand || product.brand
        product.image = image || product.image
        product.stock = stock || product.stock

        await product.save()
        res.status(200).json({message: "Product updated successfully"})
    } catch (error){
        console.log("Error updating product", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.put("/update-product-status/:id", async (req, res) => {
    try {
        const product = await Product.find({vendor: req.user.id, _id: req.params.id})
        if(!product) return res.status(404).json({message: "Product not found"})

        product.status = product.status === "active" ? "inactive" : "active"
        await product.save()
        res.status(200).json({message: "Product updated successfully"})
    } catch (error){
        console.log("Error updating product status", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.delete("/delete-product/:id", async (req, res) => {
    try {
        const product = await Product.find({vendor: req.user.id, _id: req.params.id})
        if(!product) return res.status(404).json({message: "Product not found"})
        await Product.findByIdAndDelete(req.params.id)
        res.status(200).json({message: "Product deleted successfully"})
    } catch (error){
        console.log("Error deleting product", error)
        res.status(500).json({message: "Internal server error"})
    }
})

module.exports = router;