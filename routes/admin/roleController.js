const express = require("express")
const router = express.Router()
const Role = require("../../models/Role")

router.get("/get-roles", async (req, res) => {
    try {
        const roles = await Role.find()
        res.status(200).json(roles)
    } catch {
        console.log("Error fetching roles", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.get("/get-role/:id", async (req, res) => {
    try {
        const role = await Role.findById(req.params.id)
        if (!role) return res.status(404).json({ message: "Role not found" })
        res.status(200).json(role)
    } catch (error) {
        console.log("Error fetching role", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.post("/create-role", async (req, res) => {
    try {
        const { name, permissions } = req.body
        if (!name || !permissions) return res.status(400).json({ message: "All fields are required" })
        const roleExists = await Role.findOne({ name })
        if (roleExists) return res.status(400).json({ message: "Role already exists" })
        const validPermissions = ["read", "create", "update", "delete"]
        const invalidPermissions = permissions.filter(permission => !validPermissions.includes(permission))
        if (invalidPermissions.length > 0) return res.status(400).json({ message: "Invalid permissions" }) 
        
        const role = new Role({
            name,
            permissions
        })
        await role.save()
        res.status(201).json({ message: "Role created successfully" })
    } catch (error){
        console.log("Error creating role", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.put("/update-role/:id", async (req, res) => {
    try {
        const { name, permissions } = req.body
        const role = await Role.findById(req.params.id)
        if (!role) return res.status(404).json({ message: "Role not found" })
        if (name) {
            const roleExists = await Role.findOne({ name })
            if (roleExists && roleExists._id.toString() !== req.params.id) return res.status(400).json({ message: "Role already exists" })
        }
        if (permissions) {
            const validPermissions = ["read", "create", "update", "delete"]
            const invalidPermissions = permissions.filter(permission => !validPermissions.includes(permission))
            if (invalidPermissions.length > 0) return res.status(400).json({ message: "Invalid permissions" }) 
        }

        role.name = name || role.name
        role.permissions = permissions || role.permissions

        await role.save()
        res.status(200).json({ message: "Role updated successfully" })
    } catch (error) {
        console.log("Error updating role", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.delete("/delete-role/:id", async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id)
        if (!role) return res.status(404).json({ message: "Role not found" })
        res.status(200).json({ message: "Role deleted successfully" })
    } catch (error) {
        console.log("Error deleting role", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router