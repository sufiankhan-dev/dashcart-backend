const express = require('express');
const router = express.Router();
const Attendance = require('../../models/Attendence'); 
const Employee = require('../../models/Employe');    
const Location = require('../../models/Locationlist');     

// Get all attendances with pagination
router.get('/get-attendances', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const total = await Attendance.countDocuments();
        const hasNextPage = (skip + limit) < total;

        const attendances = await Attendance.find()
            .populate('employee', 'employeeName employeeIDNumber')  
            .populate('location', 'locationName address') 
            .limit(limit)
            .skip(skip);

        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
        };

        res.status(200).json({ attendances, pagination: paginationObj });
    } catch (error) {
        console.error('Error fetching attendances', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get attendance by ID
router.get('/get-attendance/:id', async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id)
            .populate('employee', 'employeeName employeeIDNumber')  
            .populate('location', 'locationName address');  

        if (!attendance) return res.status(404).json({ message: 'Attendance not found' });

        res.status(200).json(attendance);
    } catch (error) {
        console.error('Error fetching attendance', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create new attendance record (check-in)
router.post('/create-attendance', async (req, res) => {
    try {
        const {
            employeeId,
            locationId,
            checkInTime,
            checkInLocationName,
            contactNumber
        } = req.body;

        if (!employeeId || !locationId || !checkInTime || !checkInLocationName || !contactNumber) {
            return res.status(400).json({ message: 'All required fields must be filled.' });
        }

        const employee = await Employee.findById(employeeId);
        const location = await Location.findById(locationId);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        if (!location) return res.status(404).json({ message: 'Location not found' });

        const newAttendance = new Attendance({
            employee: employeeId,
            location: locationId,
            checkInRecords: [{
                checkInTime,
                checkInLocationName,
                contactNumber
            }]
        });

        await newAttendance.save();
        res.status(201).json({ message: 'Attendance created successfully.' });
    } catch (error) {
        console.error('Error creating attendance:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update attendance record (check-out)
router.put('/update-attendance/:id', async (req, res) => {
    try {
        const {
            checkOutTime,
            checkOutLocationName,
            contactNumber
        } = req.body;

        if (!checkOutTime || !checkOutLocationName || !contactNumber) {
            return res.status(400).json({ message: 'Check-out time, location, and contact number must be provided.' });
        }

        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) return res.status(404).json({ message: 'Attendance not found' });

        attendance.checkOutRecords.push({
            checkOutTime,
            checkOutLocationName,
            contactNumber
        });

        await attendance.save();
        res.status(200).json({ message: 'Attendance updated successfully.' });
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update attendance status (Present, Absent, On Leave)
router.patch('/update-attendance-status/:id', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['Present', 'Absent', 'On Leave'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) return res.status(404).json({ message: 'Attendance not found' });

        attendance.status = status;

        await attendance.save();
        res.status(200).json({ message: 'Attendance status updated successfully.' });
    } catch (error) {
        console.error('Error updating attendance status:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Delete an attendance by ID
router.delete('/delete-attendance/:id', async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance not found' });
        }

        res.status(200).json({ message: 'Attendance deleted successfully.' });
    } catch (error) {
        console.error('Error deleting attendance:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


module.exports = router;
