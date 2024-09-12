const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const Brand = require("../../models/Brand");
const Vendor = require("../../models/Vendor");
const User = require("../../models/User")
const VendorCat = require("../../models/VendorCategory")
const Orders = require("../../models/Order")

router.get("/get-dashboard", async (req, res) => {
    try {
        const vendors = await Vendor.find()
        const users = await User.find()
        const products = await Product.find()
        const category = await Category.find()
        const brand = await Brand.find()
        const order = await Orders.find()
        const vendorcategories = await VendorCat.find() 

        const dashboard = {
            vendor: vendors.length,
            users: users.length,
            products: products.length,
            category: category.length,
            brand: brand.length,
            order: order.length,
            vendorcategories: vendorcategories.length
        }

        res.status(200).json({dashboard})
    } catch(error) {
        console.log("Error Fetching Dashboard", error)
        res.status(500).json({message: "Internal server error"})
    }
})

module.exports = router;
