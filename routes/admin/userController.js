const express = require("express")
const router = express.Router()
const User = require("../../models/User")
const bycrypt = require("bcryptjs")
const emailValidation = require("../../helper/fieldValidation").emailValidation

router.get("/get-users", async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * parseInt(limit)
        const users = await User.find({type: "user", status: { $ne: "deleted" }}).select('-password').limit(limit).skip(skip)
        const total = await User.countDocuments({type: "user", status: { $ne: "deleted" }})
        const hasNextPage = (skip + parseInt(limit)) < total
        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
        }
        res.status(200).json({users, pagination: paginationObj})
    } catch (error) {
        console.log("error fetching users", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.get("/get-users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password')
        if(!user) return res.status(404).json({message: "User not found"})
        res.status(200).json(user)
    } catch (error) {
        console.log("error fetching user", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.post("/create-user", async (req, res) => {
    try {
        let {name, email, password, phone} = req.body
        if (!name || !email || !password || !phone) return res.status(400).json({message: "All fields are required"})
        email = email.toLowerCase()
        if(!emailValidation(email)) return res.status(400).json({message: "Invalid email format"})
        const userExists = await User.findOne({email})
        if(userExists) return res.status(400).json({message: "User Email already exists"})
        const phoneExists = await User.findOne({phone})
        if(phoneExists) return res.status(400).json({message: "User Phone already exists"})

        const user = new User({
            name,
            email,
            password: bycrypt.hashSync(password, 10),
            phone,
        })

        await user.save()
        res.status(201).json({message: "User created successfully"})
    } catch (error) {
        console.log("error creating user", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.put("/update-user/:id", async (req, res) => {
    try {
        let {name, email, password, phone} = req.body
        const user = await User.findById(req.params.id)
        if(!user) return res.status(404).json({message: "User not found"})
        if (email) {
            email = email.toLowerCase()
            if(!emailValidation(email)) return res.status(400).json({message: "Invalid email format"})
            const userExists = await User.findOne({email})
            if(userExists && userExists._id.toString() !== req.params.id) return res.status(400).json({message: "User Email already exists"})
        }
        if (phone) {
            const phoneExists = await User.findOne({phone})
            if(phoneExists && phoneExists._id.toString() !== req.params.id) return res.status(400).json({message: "User Phone already exists"})
        }

        user.name = name || user.name   
        user.email = email || user.email
        user.password = password ? bycrypt.hashSync(password, 10) : user.password
        user.phone = phone || user.phone

        await user.save()
        res.status(200).json({message: "User updated successfully"})
    } catch (error) {
        console.log("error updating user", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.put("/change-status/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user) return res.status(404).json({message: "User not found"})
        
        if (user.status === "active") {
            user.status = "inactive"
        } else {
            user.status = "active"
        }

        await user.save()
        res.status(200).json({message: "User status updated successfully"})
    } catch (error) {
        console.log("error changing user status", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.delete("/delete-user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user) return res.status(404).json({message: "User not found"})
        
        user.name = user.name + "-deleted"
        user.email = user.email + "-deleted"
        user.phone = user.phone + "-deleted"    
        user.status = "deleted"

        await user.save()
    
        res.status(200).json({message: "User deleted successfully"})
    } catch (error) {
        console.log("error deleting user", error)
        res.status(500).json({message: "Internal server error"})
    }
})

module.exports = router