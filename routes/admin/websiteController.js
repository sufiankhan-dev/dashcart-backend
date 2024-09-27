const express = require("express");
const router = express.Router();
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const Brand = require("../../models/Brand");
const Employee = require("../../models/Employe");
const User = require("../../models/User")
const Location = require("../../models/Locationlist")
const Orders = require("../../models/Order")

router.get("/get-dashboard", async (req, res) => {
    try {
        const employee = await Employee.find()
        const users = await User.find()
        const products = await Product.find()
        const category = await Category.find()
        const brand = await Brand.find()
        const order = await Orders.find()
        const location = await Location.find() 

        const dashboard = {
            employee: employee.length,
            users: users.length,
            products: products.length,
            category: category.length,
            brand: brand.length,
            order: order.length,
            location: location.length
        }

        res.status(200).json({dashboard})
    } catch(error) {
        console.log("Error Fetching Dashboard", error)
        res.status(500).json({message: "Internal server error"})
    }
})

module.exports = router;
