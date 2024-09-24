const express = require("express")
const router = express.Router()
const Schedule = require('../../models/Schedule'); 
const Employee = require('../../models/Employe');
const Location = require('../../models/Locationlist');

// Create a new schedule for a specific date and location
router.post('/create-schedule', async (req, res) => {
    try {
        const { locationId, date, events } = req.body;

        if (!locationId || !date || !events || events.length === 0) {
            return res.status(400).json({ message: 'Location, date, and events are required.' });
        }

        // Validate if employees exist
        for (const event of events) {
            const employee = await Employee.findById(event.assignedEmployee);
            if (!employee) {
                return res.status(404).json({ message: `Employee with ID ${event.assignedEmployee} not found.` });
            }
        }

        const newSchedule = new Schedule({
            location: locationId,
            date,
            events
        });

        await newSchedule.save();
        res.status(201).json({ message: 'Schedule created successfully.', schedule: newSchedule });
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Fetch schedules for a specific month and location
router.get('/get-schedules', async (req, res) => {
    try {
        const { locationId, month, year } = req.query;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of the month

        const schedules = await Schedule.find({
            location: locationId,
            date: { $gte: startDate, $lt: endDate }
        }).populate('events.assignedEmployee', 'employeeName').populate('location', 'locationName');

        res.status(200).json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});
module.exports = router