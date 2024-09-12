const express = require("express");
const router = express.Router();
const Rider = require("../../models/Rider");
const Order = require("../../models/Order");

router.get("/get-riders", async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * parseInt(limit)
        const total = await Rider.countDocuments()
        const hasNextPage = (skip + parseInt(limit)) < total
        const riders = await Rider.find();
        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
        }
        res.status(200).json({riders, pagination: paginationObj})
    } catch (error) {
        console.log("Error fetching riders", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/get-riders/:id", async (req, res) => {
    try {
        const rider = await Rider.findById(req.params.id);
        // console.log()
        if (!rider) return res.status(404).json({ message: "Rider not found" });
        res.status(200).json(rider);
    } catch (error) {
        console.log("Error fetching rider", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create a new rider
router.post("/create-rider", async (req, res) => {
    try {
        const { name, age, trackerno, items, phone, email, password } = req.body;
        console.log(req.body)
        if (!name || !age || !phone || !email || !password) {
            return res.status(400).json({ message: "Name, age, phone, email, and password are required" });
        }

        const rider = new Rider({
            name,
            age,
            trackerno,
            items,
            phone,
            email,
            password
        });

        await rider.save();
        res.status(201).json({ message: "Rider created successfully" });
    } catch (error) {
        console.log("Error creating rider", error);
        res.status(500).send("Internal server error");
    }
});

// Update an existing rider
router.put("/update-rider/:id", async (req, res) => {
    try {
        const { name, age, trackerno, items, phone, email, password } = req.body;
        const rider = await Rider.findById(req.params.id);
        if (!rider) return res.status(404).json({ message: "Rider not found" });

        rider.name = name || rider.name;
        rider.age = age || rider.age;
        rider.trackerno = trackerno || rider.trackerno;
        rider.items = items || rider.items;
        rider.phone = phone || rider.phone;
        rider.email = email || rider.email;
        rider.password = password || rider.password;

        await rider.save();
        res.status(200).json({ message: "Rider updated successfully" });
    } catch (error) {
        console.log("Error updating rider", error);
        res.status(500).send("Internal server error");
    }
});

// Delete a rider
router.delete("/delete-rider/:id", async (req, res) => {
    try {
        const rider = await Rider.findByIdAndDelete(req.params.id);
        if (!rider) return res.status(404).json({ message: "Rider not found" });

        res.status(200).json({ message: "Rider deleted successfully" });
    } catch (error) {
        console.log("Error deleting rider", error);
        res.status(500).send("Internal server error");
    }
});

router.get("/get-rider-orders/:riderId", async (req, res) => {
    try {
        const rider = await Rider.findById(req.params.riderId).populate('orders');
        if (!rider) return res.status(404).json({ message: "Rider not found" });

        res.status(200).json(rider.orders);
    } catch (error) {
        console.log("Error fetching rider orders", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
