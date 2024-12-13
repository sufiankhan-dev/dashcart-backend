

const express = require("express");
const router = express.Router();
const Attendance = require("../../models/Attendence");
const Employee = require("../../models/Employe");
const Location = require("../../models/Locationlist");
const mongoose = require("mongoose");
const Attendence = require("../../models/Attendence");

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
      .populate("location", "locationName address").sort("-createdAt") // Populate location details

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
    const { location, startDate, endDate, checkInStart, checkInEnd, checkOutStart, checkOutEnd } = req.query;
    let query = {};

    // Location filter
    if (location) {
      query.location = location; // ObjectId of location
    }

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    // Check-In Time filter
    if (checkInStart && checkInEnd) {
      const checkInStartDate = new Date(checkInStart);
      const checkInEndDate = new Date(checkInEnd);

      query.checkInTime = {
        $elemMatch: {
          $gte: checkInStartDate,
          $lte: checkInEndDate,
        },
      };
    }

    // Check-Out Time filter
    if (checkOutStart && checkOutEnd) {
      const checkOutStartDate = new Date(checkOutStart);
      const checkOutEndDate = new Date(checkOutEnd);

      query.checkOutTime = {
        $elemMatch: {
          $gte: checkOutStartDate,
          $lte: checkOutEndDate,
        },
      };
    }

    // Fetch records
    const attendances = await Attendance.find(query)
      .populate("employee")
      .populate("location", "locationName address")
      .sort("-createdAt");

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
      .populate("Employee", "employeeName employeeIDNumber")
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
    // Destructuring the request body to get the necessary data
    const {
      employeeId,
      locationId,
      callingTimes,
      note,
      checkInTime,
      checkOutTime,
      status,
    } = req.body;

    // Validate the input fields
    if (!employeeId || !locationId) {
      return res.status(400).json({ message: "Employee ID and Location ID are required." });
    }

    // Fetch the employee and location from the database
    const employee = await Employee.findById(employeeId);
    const location = await Location.findById(locationId);

    // Check if the employee or location exists
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Create a new attendance record
    const newAttendance = new Attendance({
      employee: employeeId,
      location: locationId,
      callingTimes: callingTimes || [],
      note: note || [],
      checkInTime: checkInTime || [],
      checkOutTime: checkOutTime || [],
      status: status || "Present", // Default to "Present" if no status provided
    });

    // Save the new attendance record to the database
    await newAttendance.save();

    // Send success response
    res.status(201).json({ message: "Attendance created successfully", attendance: newAttendance });
  } catch (error) {
    console.error("Error creating attendance:", error);
    res.status(500).json({ message: "Internal server error" });
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
router.put('/update-attendance/:id', async (req, res) => {
  const {
    employeeId,
    locationId,
    checkInTime,
    checkOutTime,
    callingTimes,
    note,
    status,
  } = req.body;

  try {
    // Validate checkInTime and checkOutTime to ensure they are correct Date objects or ISO date strings
    if (checkInTime && !Array.isArray(checkInTime)) {
      return res.status(400).json({ error: 'checkInTime should be an array' });
    }

    if (checkOutTime && !Array.isArray(checkOutTime)) {
      return res.status(400).json({ error: 'checkOutTime should be an array' });
    }

    // Validate each item in checkInTime
    if (checkInTime) {
      for (let time of checkInTime) {
        if (isNaN(Date.parse(time))) {
          return res.status(400).json({ error: `Invalid check-in time format: ${time}` });
        }
      }
    }

    // Validate each item in checkOutTime
    if (checkOutTime) {
      for (let time of checkOutTime) {
        if (isNaN(Date.parse(time))) {
          return res.status(400).json({ error: `Invalid check-out time format: ${time}` });
        }
      }
    }

    // Ensure the times are converted to Date objects if provided
    const parsedCheckInTime = checkInTime ? checkInTime.map(time => new Date(time)) : undefined;
    const parsedCheckOutTime = checkOutTime ? checkOutTime.map(time => new Date(time)) : undefined;

    // Find the attendance record by ID
    let attendance = await Attendance.findById(req.params.id);

    if (attendance) {
      // Update the existing attendance record
      attendance.checkInTime = parsedCheckInTime || attendance.checkInTime;
      attendance.checkOutTime = parsedCheckOutTime || attendance.checkOutTime;
      attendance.callingTimes = callingTimes || attendance.callingTimes;
      attendance.note = note || attendance.note;
      attendance.status = status || attendance.status;

      // Save the updated attendance record
      await attendance.save();

      return res.status(200).json({ message: 'Attendance updated successfully', attendance });
    } else {
      // If attendance record doesn't exist, create a new one
      attendance = new Attendance({
        employee: employeeId,
        location: locationId,
        checkInTime: parsedCheckInTime,
        checkOutTime: parsedCheckOutTime,
        callingTimes: callingTimes,
        note: note ,
        status: status || 'Present',
      });

      // Save the new attendance record
      await attendance.save();

      return res.status(201).json({ message: 'Attendance added successfully', attendance });
    }
  } catch (error) {
    console.error('Error updating or adding attendance:', error);
    res.status(500).json({ error: 'Failed to update or add attendance' });
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
    const { checkInTime, checkInLocationName, contactNumber,note } = req.body;

    // Validate that all required fields are provided
    if (!checkInTime || !checkInLocationName || !contactNumber || !note) {
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
      note
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




router.put("/add-calling-time/:id", async (req, res) => {
  const { callingTime } = req.body;

  // Validate if callingTime is provided
  if (!callingTime) {
    return res.status(400).json({ message: "Calling time is required." });
  }

  try {
    // Correct the spelling of the model to 'Attendance' if that's your model's name
    const attendance = await Attendance.findById(req.params.id);
    
    // Check if the attendance record is found
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    // Add the new calling time to the 'callingTimes' array
    attendance.callingTimes.push(callingTime);

    // Save the updated attendance record
    await attendance.save();

    res.status(200).json({
      message: "Calling time added successfully.",
      attendance,  // Optionally return the updated attendance object
    });
  } catch (error) {
    console.error("Error adding calling time:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
