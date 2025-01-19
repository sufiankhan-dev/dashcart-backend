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
      return res
        .status(400)
        .json({ message: "Location, date, and events are required." });
    }

    // Validate that each event has only start and end times (no assignedEmployee needed here)
    for (const event of events) {
      const { startTime, endTime } = event;
      if (!startTime || !endTime) {
        return res.status(400).json({
          message: "Start and end times are required for each event.",
        });
      }
    }

    const newSchedule = new Schedule({ location: locationId, date, events });
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

    // Ensure month and year are numbers and valid
    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    if (
      isNaN(parsedMonth) ||
      isNaN(parsedYear) ||
      parsedMonth < 1 ||
      parsedMonth > 12
    ) {
      return res.status(400).json({ message: "Invalid month or year." });
    }

    // Create start and end dates for the query
    const startDate = new Date(parsedYear, parsedMonth - 1, 1);
    const endDate = new Date(parsedYear, parsedMonth, 0); // Last day of the month

    // Find schedules in the date range for the given location
    const schedules = await Schedule.find({
      location: locationId,
      date: { $gte: startDate, $lt: endDate },
    })
      // .populate("events.assignedEmployee", "employeeName")
      .populate("location");

    res.status(200).json(schedules);
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

module.exports = router;
