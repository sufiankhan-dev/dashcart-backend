const express = require("express");
const router = express.Router();
const Config = require("../../models/Config");

router.get("/get-config", async (req, res) => {
    try {
        const config = await Config.findOne()
        if (!config) return res.status(404).json({ message: "No config found" })
        res.status(200).json(config)
    } catch (error) {
        console.log("Error fetching config", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.post("/create-config", async (req, res) => {
    try {
        const { deliveryFeeV1, deliveryFeeV2, deliveryFeeVI, platformFee, tax } = req.body
        const config = new Config({
            deliveryFeeV1,
            deliveryFeeV2,
            deliveryFeeVI,
            platformFee,
            tax
        })
        await config.save()
        res.status(201).json({ message: "Config created successfully" })
    } catch (error) {
        console.log("Error creating config", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.put("/update-config", async (req, res) => {
    try {
        const { deliveryFeeV1, deliveryFeeV2, deliveryFeeVI, platformFee, tax } = req.body
        const config = await Config.findOne()
        if (!config) return res.status(404).json({ message: "Config not found" })
        
        config.deliveryFeeV1 = deliveryFeeV1 || config.deliveryFeeV1
        config.deliveryFeeV2 = deliveryFeeV2 || config.deliveryFeeV2
        config.deliveryFeeVI = deliveryFeeVI || config.deliveryFeeVI
        config.platformFee = platformFee || config.platformFee
        config.tax = tax || config.tax

        await config.save()
        res.status(200).json({ message: "Config updated successfully" })
    } catch(error) {
        console.log("Error updating config", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router;