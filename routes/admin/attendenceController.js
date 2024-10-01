const express = require("express");
const router = express.Router();
const Attendance = require("../../models/Attendence");
const Employee = require("../../models/Employe");
const Location = require("../../models/Locationlist");
const mongoose = require("mongoose");

// router.get('/get-employees-by-location/:locationId', async (req, res) => {
//     const { locationId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(locationId)) {
//         return res.status(400).json({ message: 'Invalid location ID' });
//     }

//     try {
//         const employees = await Employee.find({ location: locationId });

//         if (employees.length === 0) {
//             return res.status(404).json({ message: 'No employees found for this location' });
//         }

//         res.status(200).json({ employees });
//     } catch (error) {
//         console.error('Error fetching employees:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// Existing routes...

router.get("/attendance/:id", async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate("employee", "employeeName employeeIDNumber") // Populate employee details
      .populate("location", "locationName address"); // Populate location details

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    res.status(200).json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/get-attendances", async (req, res) => {
  try {
    const { location, startDate, endDate } = req.query;
    console.log("Received query parameters:", { location, startDate, endDate });

    let query = {};

    // If location is provided, add it to the query
    if (location) {
      query.location = location; // Filter by location._id
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate), // Greater than or equal to startDate
        $lte: new Date(endDate), // Less than or equal to endDate
      };
    }

    const attendances = await Attendance.find(query)
      .populate("employee", "employeeName employeeIDNumber")
      .populate("location", "locationName address");

    res.status(200).json({ attendances });
  } catch (error) {
    console.error("Error fetching attendances:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get attendance by ID
router.get("/get-attendance/:id", async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate("employee", "employeeName employeeIDNumber")
      .populate("location", "locationName address");

    if (!attendance)
      return res.status(404).json({ message: "Attendance not found" });

    res.status(200).json(attendance);
  } catch (error) {
    console.error("Error fetching attendance", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new attendance record (check-in)
router.post("/create-attendance", async (req, res) => {
  try {
    const {
      employeeId,
      locationId,
      checkInTime,
      checkInLocationName,
      contactNumber,
    } = req.body;

    if (
      !employeeId ||
      !locationId ||
      !checkInTime ||
      !checkInLocationName ||
      !contactNumber
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
    }

    const employee = await Employee.findById(employeeId);
    const location = await Location.findById(locationId);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    if (!location)
      return res.status(404).json({ message: "Location not found" });

    const newAttendance = new Attendance({
      employee: employeeId,
      location: locationId,
      checkInRecords: [
        {
          checkInTime,
          checkInLocationName,
          contactNumber,
        },
      ],
    });

    await newAttendance.save();
    res.status(201).json({ message: "Attendance created successfully." });
  } catch (error) {
    console.error("Error creating attendance:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});
router.put("/check-in-attendance/:id", async (req, res) => {
  try {
    const { checkInTime, checkInLocationName, contactNumber } = req.body;

    // Validate required fields
    if (!checkInTime || !checkInLocationName || !contactNumber) {
      return res.status(400).json({
        message:
          "Check-in time, location, and contact number must be provided.",
      });
    }

    // Find attendance record by ID
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    // Update the attendance record
    attendance.checkInRecords.push({
      checkInTime,
      checkInLocationName,
      contactNumber,
    });

    // Save the updated attendance
    await attendance.save();
    res.status(200).json({ message: "Attendance checked in successfully." });
  } catch (error) {
    console.error("Error checking in attendance:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update specific check-in record
// router.put("/update-check-in/:id/:recordIndex", async (req, res) => {
//   try {
//     const { checkInTime, checkInLocationName, contactNumber } = req.body;

//     // Validate required fields
//     if (!checkInTime || !checkInLocationName || !contactNumber) {
//       return res.status(400).json({
//         message:
//           "Check-in time, location, and contact number must be provided.",
//       });
//     }

//     // Find attendance record by ID
//     const attendance = await Attendance.findById(req.params.id);
//     if (!attendance) {
//       return res.status(404).json({ message: "Attendance not found" });
//     }

//     // Validate the record index
//     const recordIndex = parseInt(req.params.recordIndex);
//     if (
//       isNaN(recordIndex) ||
//       recordIndex < 0 ||
//       recordIndex >= attendance.checkInRecords.length
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Invalid check-in record index." });
//     }

//     // Update the specific check-in record
//     attendance.checkInRecords[recordIndex] = {
//       checkInTime,
//       checkInLocationName,
//       contactNumber,
//     };

//     // Save the updated attendance
//     await attendance.save();
//     res.status(200).json({ message: "Check-in record updated successfully." });
//   } catch (error) {
//     console.error("Error updating check-in record:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// });

// Update attendance record (check-out)
router.put("/update-attendance/:id", async (req, res) => {
  try {
    const { checkOutTime, checkOutLocationName, contactNumber } = req.body;

    if (!checkOutTime || !checkOutLocationName || !contactNumber) {
      return res.status(400).json({
        message:
          "Check-out time, location, and contact number must be provided.",
      });
    }

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance)
      return res.status(404).json({ message: "Attendance not found" });

    attendance.checkOutRecords.push({
      checkOutTime,
      checkOutLocationName,
      contactNumber,
    });

    await attendance.save();
    res.status(200).json({ message: "Attendance updated successfully." });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update attendance status (Present, Absent, On Leave)
router.patch("/update-attendance-status/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["Present", "Absent", "On Leave"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance)
      return res.status(404).json({ message: "Attendance not found" });

    attendance.status = status;

    await attendance.save();
    res
      .status(200)
      .json({ message: "Attendance status updated successfully." });
  } catch (error) {
    console.error("Error updating attendance status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update attendance record (check-in)
router.put("/update-checkin/:id", async (req, res) => {
  try {
    const { checkInTime, checkInLocationName, contactNumber } = req.body;

    // Validate that all required fields are provided
    if (!checkInTime || !checkInLocationName || !contactNumber) {
      return res.status(400).json({
        message:
          "Check-in time, location, and contact number must be provided.",
      });
    }

    // Find the attendance record by ID
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    // Add the new check-in data
    attendance.checkInRecords.push({
      checkInTime,
      checkInLocationName,
      contactNumber,
    });

    // Save the updated attendance record
    await attendance.save();
    res.status(200).json({ message: "Check-in updated successfully." });
  } catch (error) {
    console.error("Error updating check-in:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Delete an attendance by ID
router.delete("/delete-attendance/:id", async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    res.status(200).json({ message: "Attendance deleted successfully." });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
