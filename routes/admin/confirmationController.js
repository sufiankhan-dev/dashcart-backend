const express = require("express");
const router = express.Router();
const ConfirmationCall = require("../../models/Confirmationcall");
const Employee = require("../../models/Employe");
const Location = require("../../models/Locationlist");

router.post("/add-confirmation-call", async (req, res) => {
  const { employeeId, locationId, callingTimes, notes } = req.body; // Note the change here

  if (
    !employeeId ||
    !locationId ||
    !callingTimes ||
    !Array.isArray(callingTimes) ||
    callingTimes.length === 0
  ) {
    return res.status(400).json({
      message:
        "Employee, location, and at least one calling time are required.",
    });
  }

  try {
    const employee = await Employee.findById(employeeId);
    const location = await Location.findById(locationId);

    if (!employee)
      return res.status(404).json({ message: "Employee not found." });
    if (!location)
      return res.status(404).json({ message: "Location not found." });

    const newConfirmationCall = new ConfirmationCall({
      employee: employeeId,
      location: locationId,
      callingTimes, // Store the array of calling times
      notes,
    });

    await newConfirmationCall.save();
    res.status(201).json({
      message: "Confirmation call added successfully.",
      confirmationCall: newConfirmationCall,
    });
  } catch (error) {
    console.error("Error adding confirmation call:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/get-confirmation-calls", async (req, res) => {
  try {
    const confirmationCalls = await ConfirmationCall.find()
      .populate("employee", "employeeName lastName")
      .populate("location", "locationName address");

    if (confirmationCalls.length === 0) {
      return res.status(404).json({ message: "No confirmation calls found." });
    }

    res.status(200).json({ confirmationCalls });
  } catch (error) {
    console.error("Error fetching confirmation calls:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/add-calling-time/:id", async (req, res) => {
  const { callingTime } = req.body;

  if (!callingTime) {
    return res.status(400).json({ message: "Calling time is required." });
  }

  try {
    const confirmationCall = await ConfirmationCall.findById(req.params.id);
    if (!confirmationCall) {
      return res.status(404).json({ message: "Confirmation call not found." });
    }

    // Add the new calling time to the array
    confirmationCall.callingTimes.push(callingTime);
    await confirmationCall.save();

    res.status(200).json({
      message: "Calling time added successfully.",
      confirmationCall,
    });
  } catch (error) {
    console.error("Error adding calling time:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/change-call-status/:id", async (req, res) => {
  const { status } = req.body;

  console.log("Received ID:", req.params.id);

  if (!["active", "inactive"].includes(status)) {
    return res
      .status(400)
      .json({ message: "Status must be 'active' or 'inactive'." });
  }

  try {
    const confirmationCall = await ConfirmationCall.findById(req.params.id);
    if (!confirmationCall) {
      return res.status(404).json({ message: "Confirmation call not found." });
    }

    console.log("Received ID:", req.params.id);

    confirmationCall.status = status;
    await confirmationCall.save();

    res.status(200).json({
      message: "Confirmation call status updated successfully.",
      status: confirmationCall.status,
    });
  } catch (error) {
    console.error("Error updating confirmation call status:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
