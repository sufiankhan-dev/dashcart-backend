const express = require('express');
const router = express.Router();
const Employee = require('../../models/Employe');

// Get all employees with pagination
router.get('/get-employees', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const skip = (page - 1) * parseInt(limit);
        const total = await Employee.countDocuments();
        const hasNextPage = (skip + parseInt(limit)) < total;
        const employees = await Employee.find().limit(limit).skip(skip);
        
        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
        };
        
        res.status(200).json({ employees, pagination: paginationObj });
    } catch (error) {
        console.log("Error fetching employees", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get employee by ID
router.get('/get-employees/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.status(200).json(employee);
    } catch (error) {
        console.log("Error fetching employee", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Create a new employee
router.post('/create-employee', async (req, res) => {
    try {
        const {
            employeeName,
            employeeAddress,
            contactNumber1,
            contactNumber2, // optional
            employeeCategory,
            guardCardNumber,
            issueDate,
            expiryDate,
            payRate,
            managerName,
            notes,          // optional
            approved,       // optional
            status          // optional
        } = req.body;

        // Validate required fields
        if (!employeeName || !employeeAddress || !contactNumber1 || !employeeCategory || !guardCardNumber || !issueDate || !expiryDate || !payRate || !managerName) {
            return res.status(400).json({ message: 'All required fields must be filled.' });
        }

        // Create new employee instance
        const newEmployee = new Employee({
            employeeName,
            employeeAddress,
            contactNumber1,
            contactNumber2, // optional
            employeeCategory,
            guardCardNumber,
            issueDate,
            expiryDate,
            payRate,
            managerName,
            notes,          // optional
            approved,       // defaults to false
            status          // defaults to "active"
        });

        // Save the new employee to the database
        await newEmployee.save();
        return res.status(201).json({ message: 'Employee created successfully.' });
    } catch (error) {
        console.error('Error creating employee:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
