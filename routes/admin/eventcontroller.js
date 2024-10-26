const express = require("express");
const router = express.Router();
const Event = require("../../models/Event"); // Import Event model
const Employee = require("../../models/Employe");

// GET all events by location and date range
router.get("/get-events", async (req, res) => {
  try {
    const { locationId, start, end } = req.query;
    const events = await Event.find({
      locationId,
      start: { $gte: new Date(start) },
      end: { $lte: new Date(end) },
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error });
  }
});

// POST a new event
router.post("/create-events", async (req, res) => {
  try {
    const { title, start, end, locationId, assignedEmployee } = req.body;
    const newEvent = new Event({
      title,
      start,
      end,
      locationId,
      assignedEmployee,
    });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Failed to create event", error });
  }
});

// DELETE an event by ID
router.delete("/delete-events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event", error });
  }
});

module.exports = router;
