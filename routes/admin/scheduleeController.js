// const express = require("express")
// const router = express.Router()
// const Schedule = require('../../models/Schedule');
// const Employee = require('../../models/Employe');
// const Location = require('../../models/Locationlist');

// // Create a new schedule for a specific date and location
// router.post('/create-schedule', async (req, res) => {
//     try {
//         const { locationId, date, events } = req.body;

//         if (!locationId || !date || !events || events.length === 0) {
//             return res.status(400).json({ message: 'Location, date, and events are required.' });
//         }

//         // Validate if employees exist
//         for (const event of events) {
//             const employee = await Employee.findById(event.assignedEmployee);
//             if (!employee) {
//                 return res.status(404).json({ message: `Employee with ID ${event.assignedEmployee} not found.` });
//             }
//         }

//         const newSchedule = new Schedule({
//             location: locationId,
//             date,
//             events
//         });

//         await newSchedule.save();
//         res.status(201).json({ message: 'Schedule created successfully.', schedule: newSchedule });
//     } catch (error) {
//         console.error('Error creating schedule:', error);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// });

// // Fetch schedules for a specific month and location
// router.get('/get-schedules', async (req, res) => {
//     try {
//         const { locationId, month, year } = req.query;

//         // Ensure month and year are numbers and valid
//         const parsedMonth = parseInt(month, 10);
//         const parsedYear = parseInt(year, 10);

//         if (isNaN(parsedMonth) || isNaN(parsedYear) || parsedMonth < 1 || parsedMonth > 12) {
//             return res.status(400).json({ message: 'Invalid month or year.' });
//         }

//         // Create start and end dates for the query
//         const startDate = new Date(parsedYear, parsedMonth - 1, 1);
//         const endDate = new Date(parsedYear, parsedMonth, 0); // Last day of the month

//         // Find schedules in the date range for the given location
//         const schedules = await Schedule.find({
//             location: locationId,
//             date: { $gte: startDate, $lt: endDate }
//         })
//         .populate('events.assignedEmployee', 'employeeName')
//         .populate('location', 'locationName');

//         res.status(200).json(schedules);
//     } catch (error) {
//         console.error('Error fetching schedules:', error);
//         res.status(500).json({ message: 'Internal server error.' });
//     }
// });

// module.exports = router

// const express = require("express");
// const router = express.Router();
// const Schedule = require("../../models/Schedule");
// const Employee = require("../../models/Employe");
// const Location = require("../../models/Locationlist");

// // Create a new schedule for a specific date and location with start and end times
// router.post("/create-schedule", async (req, res) => {
//   try {
//     const { locationId, date, events } = req.body;

//     if (!locationId || !date || !events || events.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Location, date, and events are required." });
//     }

//     // Validate if employees and event times exist
//     for (const event of events) {
//       const { assignedEmployee, startTime, endTime } = event;

//       if (!startTime || !endTime) {
//         return res.status(400).json({
//           message: "Start time and end time are required for each event.",
//         });
//       }

//       const employee = await Employee.findById(assignedEmployee);
//       if (!employee) {
//         return res
//           .status(404)
//           .json({ message: `Employee with ID ${assignedEmployee} not found.` });
//       }
//     }

//     const newSchedule = new Schedule({
//       location: locationId,
//       date,
//       events,
//     });

//     await newSchedule.save();
//     res.status(201).json({
//       message: "Schedule created successfully.",
//       schedule: newSchedule,
//     });
//   } catch (error) {
//     console.error("Error creating schedule:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// });

// // Fetch schedules for a specific month and location
// router.get("/get-schedules", async (req, res) => {
//   try {
//     const { locationId, month, year } = req.query;

//     // Ensure month and year are numbers and valid
//     const parsedMonth = parseInt(month, 10);
//     const parsedYear = parseInt(year, 10);

//     if (
//       isNaN(parsedMonth) ||
//       isNaN(parsedYear) ||
//       parsedMonth < 1 ||
//       parsedMonth > 12
//     ) {
//       return res.status(400).json({ message: "Invalid month or year." });
//     }

//     // Create start and end dates for the query
//     const startDate = new Date(parsedYear, parsedMonth - 1, 1);
//     const endDate = new Date(parsedYear, parsedMonth, 0); // Last day of the month

//     // Find schedules in the date range for the given location
//     const schedules = await Schedule.find({
//       location: locationId,
//       date: { $gte: startDate, $lt: endDate },
//     })
//       .populate("events.assignedEmployee", "employeeName")
//       .populate("location", "locationName");

//     res.status(200).json(schedules);
//   } catch (error) {
//     console.error("Error fetching schedules:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// });

// // Delete a schedule by ID
// router.delete("/delete-schedule/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Check if the schedule exists
//     const schedule = await Schedule.findById(id);
//     if (!schedule) {
//       return res.status(404).json({ message: "Schedule not found." });
//     }

//     // Delete the schedule
//     await Schedule.findByIdAndDelete(id);
//     res.status(200).json({ message: "Schedule deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting schedule:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const Schedule = require("../../models/Schedule");
const Employee = require("../../models/Employe");
const Location = require("../../models/Locationlist");

// Create a new schedule for a specific date and location with start and end times

router.get('/schedule/:scheduleId', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    return res.status(200).json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});


router.post("/create-schedule", async (req, res) => {
  try {
    const { locationId, date, events } = req.body;

    if (!locationId || !date || !events || events.length === 0) {
      return res.status(400).json({
        message: "Location, date, and events are required.",
      });
    }

    // Validate events
    for (const event of events) {
      if (!event.startTime || !event.endTime) {
        return res.status(400).json({
          message: "Start and end times are required for each event.",
        });
      }
    }

    // ✅ Convert the date properly to ensure it's saved correctly
    const inputDate = new Date(date); // Convert incoming date
    const utcDate = new Date(Date.UTC(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate())); 

    const newSchedule = new Schedule({
      location: locationId,
      date: utcDate, // ✅ Store date correctly in UTC
      events,
    });

    await newSchedule.save();

    res.status(201).json({
      message: "Schedule created successfully.",
      schedule: newSchedule,
    });
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


// Fetch schedules for a specific month and location
router.get("/get-schedules", async (req, res) => {
  try {
    const { locationId, month, year } = req.query;

    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    if (isNaN(parsedMonth) || isNaN(parsedYear) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ message: "Invalid month or year." });
    }

    // Calculate the start and end dates for previous, current, and next month
    const startDatePrevMonth = new Date(Date.UTC(parsedYear, parsedMonth - 2, 1)); // Previous month
    const endDatePrevMonth = new Date(Date.UTC(parsedYear, parsedMonth - 1, 0, 23, 59, 59)); // End of previous month

    const startDateCurrentMonth = new Date(Date.UTC(parsedYear, parsedMonth - 1, 1)); // Current month
    const endDateCurrentMonth = new Date(Date.UTC(parsedYear, parsedMonth, 0, 23, 59, 59)); // End of current month

    const startDateNextMonth = new Date(Date.UTC(parsedYear, parsedMonth, 1)); // Next month
    const endDateNextMonth = new Date(Date.UTC(parsedYear, parsedMonth + 1, 0, 23, 59, 59)); // End of next month

    console.log("Fetching schedules from", startDatePrevMonth.toISOString(), "to", endDateNextMonth.toISOString());

    // Fetch schedules for the three months
    const schedules = await Schedule.find({
      location: locationId,
      date: { 
        $gte: startDatePrevMonth, 
        $lte: endDateNextMonth 
      },
    }).populate("location");

    const formattedSchedules = schedules.map((schedule) => ({
      ...schedule._doc,
      date: new Date(schedule.date).toISOString(), // Convert all stored dates to UTC
    }));

    res.status(200).json(formattedSchedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});






router.put("/update-schedule/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { events } = req.body;

    if (!events || events.length === 0) {
      return res
        .status(400)
        .json({ message: "Events with assigned employees are required." });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    // Update only assignedEmployee in each event
    schedule.events.forEach((existingEvent, index) => {
      if (events[index] && events[index].assignedEmployee) {
        existingEvent.assignedEmployee = events[index].assignedEmployee;
      }
    });

    await schedule.save();
    res
      .status(200)
      .json({ message: "Schedule updated successfully.", schedule });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Delete a schedule by ID
router.delete("/delete-schedule/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the schedule exists
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    // Delete the schedule
    await Schedule.findByIdAndDelete(id);
    res.status(200).json({ message: "Schedule deleted successfully." });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});





router.post("/attendence-schedule", async (req, res) => {
  try {
    const { location, calltime, checkintime, checkout, attendances, date, events } = req.body;

    // Validate the location is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(location)) {
      return res.status(400).json({ message: "Invalid location ID" });
    }

    // Create a new Schedule document
    const schedule = new Schedule({
      location,
      calltime,
      checkintime,
      checkout,
      attendances,
      date,
      events,
    });

    // Save to the database
    await schedule.save();
    res.status(201).json({ message: "Schedule created successfully", schedule });
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



router.get("/get-attendence-schedule", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = {};

    // Add date filtering if both startDate and endDate are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Set the date filter
      filter.date = { $gte: start, $lte: end };
    }

    // Fetch schedules with filters, populated references, and field selection
    const schedules = await Schedule.find(filter)
      .populate("location", "locationName address postphone") // Populate location with specific fields
      .populate("attendances") // Populate attendances
      .select("-events.startTime -events.endTime"); // Exclude startTime and endTime from events

    // Respond with the filtered schedules
    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});



router.put("/attendence-schedule/:id", async (req, res) => {
  try {
    const { location, calltime, checkintime, checkout, attendances, date, events } = req.body;
    const scheduleId = req.params.id; // Get the schedule ID from the URL parameter

    // Find the schedule by its ID and update it
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      {
        location,
        calltime,
        checkintime,
        checkout,
        attendances,
        date,
        events,
      },
      { new: true } // Return the updated document
    );

    // Check if the schedule was found and updated
    if (!updatedSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Send the updated schedule as the response
    res.status(200).json({ message: "Schedule updated successfully", updatedSchedule });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update-timings", async (req, res) => {
  try {
    const { scheduleId, callTime, checkInTime, checkOutTime, note } = req.body;  // Note is expected to be an array

    // Validate input
    if (!scheduleId || !callTime || !checkInTime || !checkOutTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the schedule by ID
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Helper function to convert time to date
    const convertToDate = (time) => {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    const callTimeDate = convertToDate(callTime);
    const checkInTimeDate = convertToDate(checkInTime);
    const checkOutTimeDate = convertToDate(checkOutTime);
    if (!Array.isArray(schedule.calltime)) schedule.calltime = [];
    if (!Array.isArray(schedule.checkintime)) schedule.checkintime = [];
    if (!Array.isArray(schedule.checkout)) schedule.checkout = [];
    if (!Array.isArray(schedule.Note)) schedule.Note = [];  // Ensure the note field is an array

    // Update check-in, check-out, and call time
    schedule.calltime.push(callTimeDate);
    schedule.checkintime.push(checkInTimeDate);
    schedule.checkout.push(checkOutTimeDate);

    // Update the Note field, appending the new note to the existing ones
    schedule.Note.push(note);

    // Save updated schedule
    await schedule.save();

    res.status(200).json({
      message: "Schedule updated successfully",
      schedule,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});





module.exports = router;
