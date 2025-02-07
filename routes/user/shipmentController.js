const express = require("express");
const router = express.Router();
const Shipment = require("../../models/Shipment");
const mongoose = require("mongoose");
const { upload } = require("../../helper/multerUpload");

// Get a list of all shipments
router.get("/shipments", async (req, res) => {
  try {
    const shipments = await Shipment.find();
    if (!shipments || shipments.length === 0) {
      return res.status(404).json({ message: "No shipments found" });
    }
    res.status(200).json({ shipments });
  } catch (error) {
    console.error("Error fetching shipments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get a shipment by ID
router.get("/shipment/:id", async (req, res) => {
  const { id } = req.params;

  // Validate the shipment ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid shipment ID" });
  }

  try {
    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }
    res.status(200).json(shipment);
  } catch (error) {
    console.error("Error fetching shipment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new shipment
router.post("/create-shipment", upload.single("freightImages"), async (req, res) => {
    try {
      const {
        freightShipped,
        carrierRequirements,
        pickingUpFrom,
        deliveryTo,
        pickUpDate,
        deliveryDateBy,
        freightDescription,

      } = req.body;
  
      // Validate required fields
      if (!freightShipped || !pickingUpFrom || !deliveryTo || !pickUpDate || !deliveryDateBy || !freightDescription) {
        return res.status(400).json({ message: "All required fields must be filled" });
      }
      let freightImages = null;
      if (req.file) {
        freightImages = process.env.BASE_URL + "/uploads/" + req.file.filename; 
      }

  
      // Create a new shipment object
      const shipment = new Shipment({
        freightShipped,
        carrierRequirements,
        pickingUpFrom: JSON.parse(pickingUpFrom), // Parsing if it's sent as a JSON string
        deliveryTo: JSON.parse(deliveryTo),       // Parsing if it's sent as a JSON string
        pickUpDate,
        deliveryDateBy,
        freightDescription,
        freightImages

        // Removed the freightImages field
      });
  
      // Save the shipment to the database
      await shipment.save();
      res.status(201).json(shipment);
    } catch (error) {
      console.error("Error creating shipment:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  });
  
// Update a shipment by ID
router.put("/shipment/:id", async (req, res) => {
  const { id } = req.params;

  // Validate the shipment ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid shipment ID" });
  }

  try {
    const updatedShipment = await Shipment.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedShipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }
    res.status(200).json(updatedShipment);
  } catch (error) {
    console.error("Error updating shipment:", error);
    res.status(400).json({ message: "Error updating shipment", error: error.message });
  }
});

// Delete a shipment by ID
router.delete("/shipment/:id", async (req, res) => {
  const { id } = req.params;

  // Validate the shipment ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid shipment ID" });
  }

  try {
    const shipment = await Shipment.findByIdAndDelete(id);
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }
    res.status(200).json({ message: "Shipment deleted successfully" });
  } catch (error) {
    console.error("Error deleting shipment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
