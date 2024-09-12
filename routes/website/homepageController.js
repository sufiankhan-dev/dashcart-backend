const express = require("express")
const router = express.Router()
const Category = require("../../models/Category")
const Product = require("../../models/Product")
const Brand = require("../../models/Brand")
const HomePage = require("../../models/HomePage")
const Vendor = require("../../models/Vendor")

router.get("/get-homepage", async (req, res) => {
    try {
        const homepage = await HomePage.findOne()
        if (!homepage) return res.status(404).json({message: "Homepage not found"})
        
        const categories = await Category.find()
        const products = await Product.find().limit(8).populate("category").populate("brand")
        const vendors = await Vendor.find({type: "vendor"}).limit(8).select("-password -role -featured")
        const brands = await Brand.find().limit(8)

        const featuredProducts = await Product.find({featured: true}).limit(8).populate("category").populate("brand")
        const featuredVendors = await Vendor.find({featured: true, type: "vendor"}).limit(8).select("-password -role -featured")
        const featuredBrands = await Brand.find({featured: true}).limit(8)

        const obj = {
            homepage,
            categories,
            products,
            vendors,
            brands,
            featuredProducts,
            featuredVendors,
            featuredBrands
        }

        res.status(200).json(obj)
    } catch(error) {
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
})

module.exports = router