const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const Brand = require("../../models/Brand");
const Vendor = require("../../models/Vendor");
const upload = require("../../helper/multerUpload");

router.get("/get-products", async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * parseInt(limit)
        
        let filters = {
            status: { $ne: "inactive" }
        }
        if (req.query.category) filters.category = req.query.category
        if (req.query.brand) filters.brand = req.query.brand
        if (req.query.vendor) filters.vendor = req.query.vendor
        if (req.query.featured) filters.featured = req.query.featured
        if (req.query.status) filters.status = req.query.status
        if (req.query.isApproved) filters.isApproved = req.query.isApproved
        
        const products = await Product.find(filters).sort({date: -1}).limit(limit).skip(skip).populate("category").populate({
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
        const product = await Product.findById(req.params.id).populate("category").populate({
            path: "vendor",
            select: "-password"
        })
        if (!product) return res.status(404).json({ message: "Product not found" })
        res.status(200).json(product)
    } catch (error) {
        console.log("Error fetching product", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.post("/create-product", upload.upload.single("image") ,async (req, res) => {
    try {
        const { name, sku, description, price, category, stock, vendor, featured } = req.body
        if (!name || !sku || !price || !category ) return res.status(400).json({ message: "All fields are required" })
        const productExists = await Product.findOne({ sku, vendor: vendor })
        if (productExists) return res.status(400).json({ message: "Product already exists" })
        const categoryExists = await Category.findById(category)
        if (!categoryExists) return res.status(400).json({ message: "Category not found" })
        // const brandExists = await Brand.findById(brand)
        // if (!brandExists) return res.status(400).json({ message: "Brand not found" })
        const vendorExists = await Vendor.findById(vendor)
        if (!vendorExists) return res.status(400).json({ message: "Vendor not found" })

        const image = process.env.BASE_URL + "/uploads/" + req.file.filename

        const newProduct = new Product({
            name,
            sku,
            description,
            price,
            category,
            image,
            stock,
            vendor,
            featured,
            isApproved: true
        })

        await newProduct.save()
        res.status(201).json({ message: "Product created successfully" })
    } catch (error) {
        console.log("Error creating product", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.put("/update-product/:id", upload.upload.single("image"), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ message: "Product not found" })
        const { name, description, price, category, image, stock, featured } = req.body

        product.name = name || product.name
        product.description = description || product.description
        product.price = price || product.price
        product.category = category || product.category
        product.image = req.file ? process.env.BASE_URL + "/uploads/" + req.file.filename : product.image
        product.stock = stock || product.stock
        // product.brand = brand || product.brand
        product.featured = featured || product.featured

        await product.save()
        res.status(200).json({ message: "Product updated successfully" })
    } catch (error) {
        console.log("Error updating product", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.put("/update-product-status/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ message: "Product not found" })

        product.status = product.status === "active" ? "inactive" : "active"

        await product.save()
        res.status(200).json({ message: "Product status updated successfully" })
    } catch (error) {
        console.log("Error updating product status", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.put("/approve-product/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) return res.status(404).json({ message: "Product not found" })

        product.isApproved = true

        await product.save()
        res.status(200).json({ message: "Product approved successfully" })
    } catch (error) {
        console.log("Error approving product", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.delete("/delete-product/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id)
        if (!product) return res.status(404).json({ message: "Product not found" })
        res.status(200).json({ message: "Product deleted successfully" })
    } catch (error) {
        console.log("Error deleting product", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.get("/export-products", async(req,res)=>{
    try {
        const products = await Product.find().populate("category").populate({
            path: "vendor",
            select: "-password"
        })
        if (!products) return res.status(404).json({message: "No products found"})
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=\"products.csv\"');
        res.send(products)
    } catch (error) {
        console.log("error exporting products", error)
        res.status(500).send("Internal server error")
    }
})

module.exports = router;