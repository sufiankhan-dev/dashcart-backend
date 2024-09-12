const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const bycrypt = require("bcryptjs");

router.get("/get-users", async (req, res) => {
    try {
        const users = await User.find(req.user._id)
        if (!users) return res.status(404).json({ message: "No users found" })
        res.status(200).json(users)
    } catch (error) {
        console.log("Error fetching users", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.put("/update-user", async (req, res) => {
    try {
        const { name, email, phone, password, oldPassword } = req.body
        const user = await User.findById(req.user._id)
        if (!user) return res.status(404).json({ message: "User not found" })

        if (email) {
            const userExists = await User.findOne({ email })
            if (userExists && userExists._id.toString() !== req.user._id) return res.status(400).json({ message: "User Email already exists" })
        }
        if (phone) {
            const phoneExists = await User.findOne({phone})
            if(phoneExists && phoneExists._id.toString() !== req.user._id) return res.status(400).json({message: "User Phone already exists"})
        }
        if (password && !bycrypt.compareSync(oldPassword, user.password)) return res.status(400).json({ message: "Old password is incorrect" })

        user.name = name || user.name
        user.email = email || user.email
        user.password = password ? bycrypt.hashSync(password, 10) : user.password
        user.phone = phone || user.phone

        await user.save()
        res.status(200).json({ message: "User updated successfully" })
    } catch(error) {
        console.log("Error updating user", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.delete("/delete-user", async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        if (!user) return res.status(404).json({ message: "User not found" })

        user.name = user.name + "-deleted"
        user.email = user.email + "-deleted"
        user.phone = user.phone + "-deleted"
        user.status = "inactive"
        await user.save()
        res.status(200).json({ message: "User deleted successfully" })
    } catch (error) {
        console.log("Error deleting user", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.post("/add-address", async (req, res) => {
    try {
        const { longitude, latitude, floor, street, room, tag } = req.body
        const user = await User.findById(req.user._id)
        if (!user) return res.status(404).json({ message: "User not found" })
        if (!longitude || !latitude) return res.status(400).json({ message: "Longitude and Latitude are required" })
        
        user.address.push({ longitude, latitude, floor, street, room, tag })
        await user.save()
        res.status(200).json({ message: "Address added successfully" })
    } catch (error) {
        console.log("Error adding address", error)
        res.status(500)
    }
})

router.put("/update-address/:id", async (req, res) => {
    try {
        const { longitude, latitude, floor, street, room, tag } = req.body
        const user = await User.findById(req.user._id)
        if (!user) return res.status(404).json({ message: "User not found" })
        const address = user.address.id(req.params.id)
        
        address.longitude = longitude || address.longitude
        address.latitude = latitude || address.latitude
        address.floor = floor || address.floor
        address.street = street || address.street
        address.room = room || address.room
        address.tag = tag || address.tag

        await user.save()
        res.status(200).json({ message: "Address updated successfully" })
    } catch (error) {
        console.log("Error updating address", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.delete("/delete-address/:id", async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        if (!user) return res.status(404).json({ message: "User not found" })
        const addressIndex = user.address.findIndex(address => address._id.toString() === req.params.id)
        if (addressIndex === -1) return res.status(404).json({ message: "Address not found" })
        
        user.address.splice(addressIndex, 1)

        await user.save()
        res.status(200).json({ message: "Address deleted successfully" })
    } catch (error) {
        console.log("Error deleting address", error)
        res.status(500).json({ message: "Internal server error" })
    }
})


module.exports = router;