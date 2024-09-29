const mongoose = require('mongoose');

// Schema for Attendance
const AttendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',  
        required: true,
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',  // Reference to Location model
        required: true,
    },
    checkInRecords: [{
        checkInTime: {
            type: Date,
            required: true,  // Check-in time is required
        },
        checkInLocationName: {
            type: String,  // Store the location name for check-in
            required: true,
        },
        contactNumber: {
            type: String,  // Store contact number for check-in
            required: true,
        }
    }],
    checkOutRecords: [{
        checkOutTime: {
            type: Date,
            required: true, 
        },
        checkOutLocationName: {
            type: String,  // Store the location name for check-out
            required: true,
        },
        contactNumber: {
            type: String,  // Store contact number for check-out
            required: true,
        }
    }],
    status: {
        type: String,
        enum: ['Present', 'Absent', 'On Leave'],  // Attendance status
        default: 'Present',
    },
    createdAt: {
        type: Date,
        default: Date.now,  // Automatically record the creation time
    }
});

AttendanceSchema.index({ employee: 1 });
AttendanceSchema.index({ location: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
