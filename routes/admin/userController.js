const express = require("express");
const router = express.Router();
const User = require("../../models/User");

const bcrypt = require("bcryptjs");
const Role = require("../../models/Role");
const emailValidation = require("../../helper/fieldValidation").emailValidation;

router.get("/get-users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch users with roles populated, excluding the password field
    const users = await User.find({
      // type: "user",
      status: { $ne: "deleted" },
    })
      .select("-password") // Exclude password
      .limit(limit)
      .skip(skip)
      .populate("role", "name permissions");

    // Total count of users (excluding deleted ones)
    const total = await User.countDocuments({
      // type: "user",
      status: { $ne: "deleted" },
    });

    const hasNextPage = skip + limit < total;

    // Pagination information
    const paginationObj = {
      page,
      limit,
      total,
      hasNextPage,
    };

    // Respond with users and pagination details
    res.status(200).json({ users, pagination: paginationObj });
  } catch (error) {
    console.error("Error fetching users", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.log("error fetching user", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/create-user", async (req, res) => {
  try {
    const {
      country, // Country
      state, // State
      city, // City
      firstName, // First Name
      lastName, // Last Name
      middleName, // Middle Name (optional)
      phoneNumber1, // Phone Number 1
      phoneNumber2, // Phone Number 2 (optional)
      email, // Primary Email
      secondaryEmail, // Secondary Email (optional)
      address, // Address (optional)
      dateOfBirth, // Date of Birth
      gender, // Gender
      password, // Password
      role, // Role ID (added role reference)
    } = req.body;

    // List of required fields for clarity
    const requiredFields = {
      country,
      state,
      city,
      firstName,
      lastName,
      phoneNumber1,
      email,
      dateOfBirth,
      gender,
      password,
    };

    // Check for missing required fields
    for (let [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res
          .status(400)
          .json({ message: `${key} is required and must be filled.` });
      }
    }

    // Validate email format
    if (!emailValidation(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Ensure the email is unique
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Check if phone number is unique
    const phoneExists = await User.findOne({ phoneNumber1 });
    if (phoneExists) {
      return res.status(400).json({
        message: "Phone number is already associated with another account.",
      });
    }

    // Check if the date of birth is in a valid format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Format: YYYY-MM-DD
    if (!dateRegex.test(dateOfBirth)) {
      return res
        .status(400)
        .json({ message: "Date of birth must be in the format YYYY-MM-DD." });
    }

    // Validate role if provided
    let roleReference;
    if (role) {
      roleReference = await Role.findById(role);
      if (!roleReference) {
        return res.status(400).json({ message: "Invalid role ID." });
      }
    } else {
      // Optionally, assign a default role if none is provided
      roleReference = await Role.findOne({ name: "User" });
      if (!roleReference) {
        return res.status(400).json({ message: "Default role not found." });
      }
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create the new user instance with the role reference
    const newUser = new User({
      country,
      state,
      city,
      firstName,
      lastName,
      middleName,
      phoneNumber1,
      phoneNumber2,
      email: email.toLowerCase(),
      secondaryEmail,
      address,
      dateOfBirth,
      gender,
      password: hashedPassword,
      role: roleReference._id,
    });

    // Save the new user to the database
    await newUser.save();

    return res
      .status(201)
      .json({ message: "User created successfully.", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/update-user/:id", async (req, res) => {
  try {
    const { email, firstName, lastName, phoneNumber1, password, role } =
      req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate the email if it's being updated
    if (email && !emailValidation(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Check if the phone number is unique if it's being updated
    if (phoneNumber1 && phoneNumber1 !== user.phoneNumber1) {
      const phoneExists = await User.findOne({ phoneNumber1 });
      if (phoneExists) {
        return res.status(400).json({
          message: "Phone number is already associated with another account.",
        });
      }
    }

    // Update the user's details
    if (email) user.email = email.toLowerCase();
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber1) user.phoneNumber1 = phoneNumber1;

    // Hash the password if it's being updated
    if (password) {
      user.password = bcrypt.hashSync(password, 10);
    }

    // Update role if provided without changing the type
    if (role) {
      const roleReference = await Role.findById(role);
      if (!roleReference) {
        return res.status(400).json({ message: "Invalid role ID." });
      }
      user.role = roleReference._id;
      // Removed the code that sets user.type based on the role
    }

    // Save the updated user
    await user.save();

    return res
      .status(200)
      .json({ message: "User updated successfully.", user });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.delete("/delete-user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Set user status to 'deleted'
    user.status = "deleted";

    // Do not modify the 'role' field, just save the updated status
    await user.save({ validateBeforeSave: false }); // Disable validation temporarily

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.put("/update-user-status/:id", async (req, res) => {
  try {
    console.log("User ID from Params: ", req.params.id);

    // Find the user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Current User Status: ", user.status);

    // Toggle the user status between 'active' and 'inactive' or set to deleted
    user.status = user.status === "active" ? "inactive" : "deleted";

    // Save the updated status
    await user.save();

    console.log("Updated User Status: ", user.status);

    // Send success response
    res.status(200).json({
      message: "User status updated successfully",
      status: user.status,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
