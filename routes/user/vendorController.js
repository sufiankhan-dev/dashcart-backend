const express = require("express");
const router = express.Router()
const Product = require("../../models/Product")
const Category = require("../../models/Category")
const Brand = require("../../models/Brand")
const Vendor = require("../../models/Vendor")
const VendorCategory = require("../../models/VendorCategory");
const Review = require("../../models/Review");

router.get("/get-vendors", async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * parseInt(limit)

        let filters = {
            status: "active"
        }

        if (req.query.category) {
            const category = await Category.findById(req.query.category)
            if (!category) return res.status(400).json({ message: "Category not found"})
         
            const products = await Product.find({category: req.query.category, status: "active", isApproved: true})
            const vendors = products.map(product => product.vendor)
            filters._id = { $in: vendors }
        }

        if (req.query.vendorcategory) {
            const vendorCategory = await VendorCategory.findById(req.query.vendorcategory)
            if (!vendorCategory) return res.status(400).json({ message: "Vendor category not found" })
            filters.vendorCategory = req.query.vendorcategory
        }

        if (req.query.featured) {
            filters.featured = req.query.featured
        }

        if (req.query.search) {
            filters.name = { $regex: req.query.search, $options: "i" }
        }

        let vendors = await Vendor.find(filters).limit(limit).skip(skip).select("-password -role")
        const total = await Vendor.countDocuments(filters)

        const hasNextPage = (skip + parseInt(limit)) < total

        vendors = await Promise.all(vendors.map(async vendor => {
            const reviews = await Review.find({vendor: vendor._id})
            let averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
            if (!averageRating) averageRating = 0
            return { ...vendor._doc, averageRating }
        }))

        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
        }

        res.status(200).json({ vendors, pagination: paginationObj })
    } catch (error){
        console.log("Error fetching vendors", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.get("/get-vendor/:id", async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id).select("-password")
        if (!vendor) return res.status(404).json({ message: "Vendor not found" })

        let filters = {}

        if (req.query.category) 
            filters.category = req.query.category

        const products = await Product.find({vendor: req.params.id, ...filters, stock: { $gt: 0 }, status: "active", isApproved: true})
        vendor.products = products

        const allProducts = await Product.find({vendor: req.params.id, status: "active", isApproved: true})
        
        const categories = allProducts.map(allProducts => allProducts.category)

        const uniqueCategories = [...new Set(categories)]
        const categoryDetails = await Category.find({_id: { $in: uniqueCategories }})
        console.log(categoryDetails)
        let reviews = await Review.find({vendor: req.params.id}).populate("user", "name")
        let averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        if (!averageRating) averageRating = 0

        const reviewsObj = {
            reviews,
            averageRating
        }

        const vendorObj = {
            vendor,
            categories: categoryDetails,
            products: products,
            reviews: reviewsObj
        }
        
        res.status(200).json(vendorObj)
    } catch (error) {
        console.log("Error fetching vendor", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.get("/get-vendor-categories", async(req, res)=> {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skkip = (page - 1) * limit
        const hasNextPage = await VendorCategory.find().limit(limit).skip(skkip + limit)
        const vendorCategories = await VendorCategory.find().limit(limit).skip(skkip)
        const paginationObj = {
            page,
            limit,
            total: await VendorCategory.countDocuments(),
            hasNextPage: hasNextPage.length > 0
        }
        res.status(200).json({vendorCategories, pagination: paginationObj})
    } catch(error){
        console.log("Error fetching vendor categories: ", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.get("/get-vendor-category/:id", async(req, res)=> {
    try {
        const vendorCategory = await VendorCategory.findById(req.params.id)
        if(!vendorCategory) return res.status(404).json({message: "Vendor category not found"})
        res.status(200).json(vendorCategory)
    } catch(error){
        console.log("Error fetching vendor category: ", error)
        res.status(500).json({message: "Internal server error"})
    }
})

module.exports = router;