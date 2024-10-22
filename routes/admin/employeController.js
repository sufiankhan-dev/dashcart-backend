const express = require("express");
const router = express.Router();
const Employee = require("../../models/Employe");

// Get all employees with pagination
router.get("/get-employees", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const skip = (page - 1) * parseInt(limit);
    const total = await Employee.countDocuments();
    const hasNextPage = skip + parseInt(limit) < total;
    const employees = await Employee.find().limit(limit).skip(skip).sort("createdAt")

    const paginationObj = {
      page,
      limit,
      total,
      hasNextPage,
    };

    res.status(200).json({ employees, pagination: paginationObj });
  } catch (error) {
    console.log("Error fetching employees", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get employee by ID
router.get("/get-employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.status(200).json(employee);
  } catch (error) {
    console.log("Error fetching employee", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new employee
router.post("/create-employee", async (req, res) => {
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
      notes, // optional
      approved,
      salarystatus, // optional
      status, // optional
    } = req.body;

    // Validate required fields
    if (
      !employeeName ||
      !employeeAddress ||
      !contactNumber1 ||
      !employeeCategory ||
      !guardCardNumber ||
      !issueDate ||
      !expiryDate ||
      !payRate ||
      !managerName
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
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
      notes, // optional
      approved,
      salarystatus, // defaults to false
      status, // defaults to "active"
    });

    // Save the new employee to the database
    await newEmployee.save();
    return res.status(201).json({ message: "Employee created successfully." });
  } catch (error) {
    console.error("Error creating employee:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// Update employee by ID
router.put("/update-employee/:id", async (req, res) => {
  const employeeId = req.params.id;
  const {
    employeeName,
    employeeAddress,
    contactNumber1,
    employeeIDNumber,
    employeeCategory,
    guardCardNumber,
    issueDate,
    expiryDate,
    payRate,
    managerName,
    approved,
    status,
  } = req.body;

  try {
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update employee fields
    employee.employeeName = employeeName || employee.employeeName;
    employee.employeeAddress = employeeAddress || employee.employeeAddress;
    employee.contactNumber1 = contactNumber1 || employee.contactNumber1;
    employee.employeeIDNumber = employeeIDNumber || employee.employeeIDNumber;
    employee.employeeCategory = employeeCategory || employee.employeeCategory;
    employee.guardCardNumber = guardCardNumber || employee.guardCardNumber;
    employee.issueDate = issueDate || employee.issueDate;
    employee.expiryDate = expiryDate || employee.expiryDate;
    employee.payRate = payRate || employee.payRate;
    employee.managerName = managerName || employee.managerName;
    employee.approved = approved !== undefined ? approved : employee.approved;
    employee.status = status || employee.status;

    await employee.save();

    return res
      .status(200)
      .json({ message: "Employee updated successfully", employee });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Route to change salary status
router.put("/change-salarystatus/:id", async (req, res) => {
  try {
    // Find employee by ID
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Toggle salarystatus between 'paid' and 'unpaid'
    employee.salarystatus =
      employee.salarystatus === "paid" ? "unpaid" : "paid";

    // Save updated employee
    await employee.save();

    // Respond with success
    res
      .status(200)
      .json({
        message: "Employee salary status updated successfully",
        salarystatus: employee.salarystatus,
      });
  } catch (error) {
    console.error("Error updating salary status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/change-status/:id", async (req, res) => {
  const { status } = req.body; // new status
  const validStatuses = ["active", "inactive"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status provided" });
  }

  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ message: "Employee status updated", employee });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
});
router.delete("/delete-employe/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    res.status(200).json({ message: "delete employe successfully" });
  } catch (error) {
    console.log("Error delete-employe", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
