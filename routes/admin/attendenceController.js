

const express = require("express");
const router = express.Router();
const Attendance = require("../../models/Attendence");
const Employee = require("../../models/Employe");
const Location = require("../../models/Locationlist");
const mongoose = require("mongoose");
const Attendence = require("../../models/Attendence");
const Schedule = require("../../models/Schedule");


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
//   router.get("/getSchedulesWithAttendance ", async (req, res) => {

//   try {
//     // Extract filters from query parameters
//     const { location, startDate, endDate, employee } = req.query;

//     // Build filter conditions
//     const scheduleFilter = {};
//     const attendanceFilter = {};

//     if (location) {
//       scheduleFilter.location = location; // Filter schedules by location
//     }

//     if (employee) {
//       attendanceFilter.employee = employee; // Filter attendance by employee
//     }

//     if (startDate || endDate) {
//       attendanceFilter.checkInTime = {};
//       if (startDate) {
//         attendanceFilter.checkInTime.$gte = new Date(startDate);
//       }
//       if (endDate) {
//         attendanceFilter.checkInTime.$lte = new Date(endDate);
//       }
//     }

//     // Query schedules with associated attendance
//     const schedules = await Schedule.find(scheduleFilter)
//       .populate({
//         path: "location",
//         select: "name address", // Include necessary location fields
//       })
//       .populate({
//         path: "employee",
//         select: "name", // Include necessary employee fields
//       })
//       .lean(); // Use lean for better performance on read-heavy queries

//     // Fetch and map attendance for each schedule
//     const scheduleWithAttendance = await Promise.all(
//       schedules.map(async (schedule) => {
//         const attendanceRecords = await Attendance.find({
//           schedule: schedule._id,
//           ...attendanceFilter, // Apply attendance filters
//         }).populate({
//           path: "employee",
//           select: "name email",
//         });

//         return {
//           ...schedule,
//           attendance: attendanceRecords,
//         };
//       })
//     );

//     // Send the response
//     res.status(200).json({
//       success: true,
//       data: scheduleWithAttendance,
//     });
//   } catch (error) {
//     console.error("Error fetching schedules with attendance:", error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching data.",
//     });
//   }
// })






router.get("/attendance/:id", async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate("employee", "employeeName employeeIDNumber") // Populate employee details
      .populate("location", "locationName address") // Populate location details

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});



router.get("/get-attendances", async (req, res) => {
  try {
    const {
      location,
      startDate,
      endDate,
      checkInStart,
      checkInEnd,
      checkOutStart,
      checkOutEnd,
      eventStartTime,
      eventEndTime,
    } = req.query;

    let query = {};

    // Location filter
    if (location) {
      query.location = location;
    }

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Handle if the end date is before the start date (spanning across midnight)
      if (end < start) {
        end.setDate(end.getDate() + 1);
      }

      query.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    // Check-In Time filter (if applicable)
    if (checkInStart && checkInEnd) {
      const checkInStartDate = new Date(checkInStart);
      const checkInEndDate = new Date(checkInEnd);

      query.checkInTime = {
        $gte: checkInStartDate,
        $lte: checkInEndDate,
      };
    }

    // Check-Out Time filter (if applicable)
    if (checkOutStart && checkOutEnd) {
      const checkOutStartDate = new Date(checkOutStart);
      const checkOutEndDate = new Date(checkOutEnd);

      query.checkOutTime = {
        $gte: checkOutStartDate,
        $lte: checkOutEndDate,
      };
    }

    // Event Time filter (new logic for filtering events by start and end time)
    if (eventStartTime && eventEndTime) {
      const eventStart = new Date(eventStartTime);
      const eventEnd = new Date(eventEndTime);

      // If the event's end time is before the start time, it spans midnight
      if (eventEnd < eventStart) {
        eventEnd.setDate(eventEnd.getDate() + 1); // Adjust end time by adding a day
      }

      query["events.startTime"] = {
        $gte: eventStart.toISOString(),
      };

      query["events.endTime"] = {
        $lte: eventEnd.toISOString(),
      };
    }

    // Fetch attendances based on the constructed query
    const attendances = await Attendance.find(query)
      .populate("employee")
      .populate("location", "locationName address postphone")
      .sort("-createdAt");

    // Fetch schedules based on the constructed query
    const schedules = await Schedule.find(query)
      .populate("location", "locationName address postphone")
      .sort("date");

    res.status(200).json({
      attendances,
      schedules,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});








// Get attendance by ID
// router.get("/get-attendances", async (req, res) => {
//   try {
//     const { location, startDate, endDate, checkInStart, checkInEnd, checkOutStart, checkOutEnd } = req.query;
//     let query = {};

//     // Location filter
//     if (location) {
//       query.location = location; // ObjectId of location
//     }

//     // Date range filter
//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       end.setHours(23, 59, 59, 999);
//       query.createdAt = {
//         $gte: start,
//         $lte: end,
//       };
//     }

//     // Check-In Time filter
//     if (checkInStart && checkInEnd) {
//       const checkInStartDate = new Date(checkInStart);
//       const checkInEndDate = new Date(checkInEnd);

//       query.checkInTime = {
//         $elemMatch: {
//           $gte: checkInStartDate,
//           $lte: checkInEndDate,
//         },
//       };
//     }

//     // Check-Out Time filter
//     if (checkOutStart && checkOutEnd) {
//       const checkOutStartDate = new Date(checkOutStart);
//       const checkOutEndDate = new Date(checkOutEnd);

//       query.checkOutTime = {
//         $elemMatch: {
//           $gte: checkOutStartDate,
//           $lte: checkOutEndDate,
//         },
//       };
//     }

//     // Fetch records
//     const attendances = await Attendance.find(query)
//       .populate("employee")
//       .populate("location", "locationName address")
//       .sort("-createdAt");

//     res.status(200).json({ attendances });
//   } catch (error) {
//     console.error("Error fetching attendances:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // Schedule periodic data fetch
// cron.schedule("0 0 * * *", async () => { // Runs at midnight daily
//   console.log("Running scheduled attendance fetch...");
//   try {
//     const today = new Date();
//     const startOfDay = new Date(today.setHours(0, 0, 0, 0));
//     const endOfDay = new Date(today.setHours(23, 59, 59, 999));

//     // Example query to fetch today's data
//     const query = {
//       createdAt: {
//         $gte: startOfDay,
//         $lte: endOfDay,
//       },
//     };

//     const attendances = await Attendance.find(query)
//       .populate("employee")
//       .populate("location", "locationName address")
//       .sort("-createdAt");

//     console.log("Fetched Attendances:", attendances);
//     // Optional: Save or process fetched data
//   } catch (error) {
//     console.error("Error during scheduled fetch:", error);
//   }
// });


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
    const {
      employeeId,
      locationId,
      scheduleId,
      callingTimes,
      note,
      checkInTime,
      checkOutTime,
      status,
    } = req.body;

    // Validate the input fields
    if (!employeeId || !locationId || !scheduleId) {
      return res
        .status(400)
        .json({ message: "Employee ID, Location ID, and Schedule ID are required." });
    }

    // Fetch the employee, location, and schedule from the database
    const employee = await Employee.findById(employeeId);
    const location = await Location.findById(locationId);
    const schedule = await Schedule.findById(scheduleId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Check if attendance record already exists
    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      location: locationId,
      schedule: scheduleId,
    });

    if (existingAttendance) {
      // Update the existing attendance record
      existingAttendance.callingTimes = callingTimes || existingAttendance.callingTimes;
      existingAttendance.note = note || existingAttendance.note;
      existingAttendance.checkInTime = checkInTime || existingAttendance.checkInTime;
      existingAttendance.checkOutTime = checkOutTime || existingAttendance.checkOutTime;
      existingAttendance.status = status || existingAttendance.status;

      // Save the updated record
      await existingAttendance.save();

      return res
        .status(200)
        .json({ message: "Attendance updated successfully", attendance: existingAttendance });
    } else {
      // Create a new attendance record
      const newAttendance = new Attendance({
        employee: employeeId,
        location: locationId,
        schedule: scheduleId,
        callingTimes: callingTimes || [],
        note: note || [],
        checkInTime: checkInTime || [],
        checkOutTime: checkOutTime || [],
        status: status || "Present",
      });

      // Save the new record
      await newAttendance.save();

      return res
        .status(201)
        .json({ message: "Attendance created successfully", attendance: newAttendance });
    }
  } catch (error) {
    console.error("Error processing attendance:", error);
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

// Update attendance record (check-ou



router.put("/update-attendance/:attendanceId", async (req, res) => {
  try {
    const { attendanceId } = req.params; // Extract attendanceId from URL
    const {
      employeeId,
      locationId,
      scheduleId,
      callingTimes,
      note,
      checkInTime,
      checkOutTime,
      status,
    } = req.body;

    // Check if the attendanceId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      return res.status(400).json({ message: "Invalid attendance ID." });
    }

    // Fetch the attendance record
    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    // Validate the input fields
    if (employeeId) {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      attendance.employee = employeeId;
    }

    if (locationId) {
      const location = await Location.findById(locationId);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      attendance.location = locationId;
    }

    if (scheduleId) {
      const schedule = await Schedule.findById(scheduleId);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      attendance.schedule = scheduleId;
    }

    // Update the fields if provided
    if (callingTimes) attendance.callingTimes = callingTimes;
    if (note) attendance.note = note;
    if (checkInTime) attendance.checkInTime = checkInTime;
    if (checkOutTime) attendance.checkOutTime = checkOutTime;
    if (status) attendance.status = status;

    // Save the updated attendance record
    await attendance.save();

    res.status(200).json({
      message: "Attendance updated successfully.",
      attendance,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update attendance status (Present, Absent, On Leave)

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
