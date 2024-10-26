const express = require("express");
const router = express.Router();
const Location = require("../../models/Locationlist");
const Employee = require("../../models/Employe");

// Create a new Location
router.post("/create-location", async (req, res) => {
  try {
    const {
      locationName,
      customerNo,
      address,
      // userList,
      timeZone,
      locationTypeName,
      locationType,
      schedule,
      clientDetails,
      // employees  // Add employees field here
    } = req.body;

    // Validate required fields
    if (!locationName || !address || !timeZone || !locationType || !schedule) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    // Create a new Location instance
    const newLocation = new Location({
      locationName,
      customerNo,
      address,
      // userList,
      timeZone,
      locationTypeName,
      locationType,
      schedule,
      clientDetails,
      // employees  // Include employees field in the new Location
    });

    // Save the new Location to the database
    await newLocation.save();
    return res.status(201).json({
      message: "Location created successfully.",
      location: newLocation,
    });
  } catch (error) {
    console.error("Error creating Location:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// Get all Locations
router.get("/get-locations", async (req, res) => {
  try {
    const locations = await Location.find()
      //   .populate("userList") // Populate user details
      .populate("timeZone") // Populate timezone details
      .populate("locationType")
      .sort("createdAt"); // Populate location type details
    //   .populate("employees", "employeeName employeeIDNumber"); // Populate employees

    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching Locations:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get a single Location by ID
router.get("/get-location/:id", async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate("timeZone")
      .populate("locationType");
    if (!location)
      return res.status(404).json({ message: "Location not found" });
    res.status(200).json(location);
  } catch (error) {
    console.error("Error fetching Location:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/update-location/:id", async (req, res) => {
  try {
    const {
      locationName,
      address,
      userList,       // No longer required
      timeZone,
      locationType,
      parentLocation,
      schedule,
      clientDetails,
    } = req.body;

    // We are not validating required fields anymore
    // If you still want to handle cases where the fields might be missing,
    // you can assign default values or handle them appropriately
    const updateData = {
      locationName: locationName || undefined, // Use undefined if not provided
      address: address || undefined,
      userList: userList || [], // Default to an empty array if not provided
      timeZone: timeZone || undefined,
      locationType: locationType || undefined,
      parentLocation: parentLocation || undefined,
      schedule: schedule ? schedule.map((daySchedule) => ({
        day: daySchedule.day,
        intervals: daySchedule.intervals.map((interval) => ({
          startTime: interval.startTime,
          endTime: interval.endTime,
        })),
      })) : [], // Default to an empty array if schedule is not provided
      clientDetails: clientDetails || [], // Default to an empty array if not provided
    };

    // Find the location by ID and update it
    const updatedLocation = await Location.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedLocation)
      return res.status(404).json({ message: "Location not found" });

    return res.status(200).json({
      message: "Location updated successfully.",
      location: updatedLocation,
    });
  } catch (error) {
    console.error("Error updating Location:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});


router.delete("/delete-location/:id", async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);

    if (!location)
      return res.status(404).json({ message: "Location not found" });

    return res.status(200).json({ message: "Location deleted successfully." });
  } catch (error) {
    console.error("Error deleting Location:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
