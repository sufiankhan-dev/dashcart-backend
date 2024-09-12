const express = require("express")
const router = express.Router()
const Discount = require("../../models/Discount")

router.get("/get-discounts", async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * parseInt(limit)
        const total = await Discount.countDocuments()
        const hasNextPage = (skip + parseInt(limit)) < total
        const discounts = await Discount.find().limit(limit).skip(skip)
        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
        }
        res.status(200).json({ discounts, pagination: paginationObj})
    } catch (error) {
        console.log("Error fetching discounts: ", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.get("/get-discounts/:id", async (req, res) =>{
    try {
        const discount = await Discount.findById(req.params.id)
        if(!discount) return res.status(404).json({message: "Discount not found"})
        res.status(200).json(discount)
    } catch (error) {
        console.log("Error fetching discount: ", error)
        res.status(500).json({ message: "Internal server error"})
    }
})

router.post("/create-discount", async (req, res)=> {
    try {
        const {code, discount, type, description} = req.body
        if (!code || !discount || !type) return res.status(400).json({message: "All fields are required"})
        const discountExists = await Discount.findOne({code})
        if(discountExists) return res.status(400).json({message: "Discount code already exists"})
        const newDiscount = new Discount({
            code,
            discount,
            type,
            description
        })
        await newDiscount.save()

        res.status(201).json({message: "Discount created successfully"})
    } catch (error) {
        console.log("Error creating discount: ", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.put("/update-discount/:id", async (req, res) => {
    try {
        const {discount, type, description} = req.body
        const discountExists = await Discount.findById(req.params.id)
        if(!discountExists) return res.status(404).json({message: "Discount not found"})
        
        discountExists.discount = discount || discountExists.discount
        discountExists.type = type || discountExists.type
        discountExists.description = description || discountExists.description

        await discountExists.save()
        res.status(200).json({message: "Discount updated successfully"})
    } catch (error) {
        console.log("Error updating discount: ", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.put("/update-discount-status/:id", async (req, res) => {
    try {
        const discount = await Discount.findById(req.params.id)
        if (!discount) return res.status(404).json({message: "Discount not found"})
        
        discount.status = "active" ? "inactive" : "active"

        await discount.save()
        res.status(200).json({message: "Discount status updated successfully"})
    } catch (error) {
        console.log("Error updating discount status: ", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.delete("/delete-discount/:id", async(req, res) => {
    try {
        const discount = await Discount.findByIdAndDelete(req.params.id)
        if(!discount) return res.status(404).json({message: "Discount not found"})
        res.status(200).json({message: "Discount deleted successfully"})
    } catch (error) {
        console.log("Error deleting discount: ", error)
        res.status(500).json({message: "Internal server error"})
    }
})

module.exports = router