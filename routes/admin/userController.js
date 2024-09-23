const express = require("express")
const router = express.Router()
const User = require("../../models/User")

const bycrypt = require("bcryptjs")
const Role = require("../../models/Role")
const emailValidation = require("../../helper/fieldValidation").emailValidation

router.get("/get-users", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch users with roles populated, excluding the password field
        const users = await User.find({
            type: "user",
            status: { $ne: "deleted" }
        })
        .select('-password')  // Exclude password
        .limit(limit)
        .skip(skip)
        .populate('role', 'name permissions') 

        // Total count of users (excluding deleted ones)
        const total = await User.countDocuments({
            type: "user",
            status: { $ne: "deleted" }
        });

        const hasNextPage = (skip + limit) < total;

        // Pagination information
        const paginationObj = {
            page,
            limit,
            total,
            hasNextPage
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
        const user = await User.findById(req.params.id).select('-password')
        if(!user) return res.status(404).json({message: "User not found"})
        res.status(200).json(user)
    } catch (error) {
        console.log("error fetching user", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.post("/create-user", async (req, res) => {
    try {
      const {
        country,           // Country
        state,             // State
        city,              // City
        firstName,         // First Name
        lastName,          // Last Name
        middleName,        // Middle Name (optional)
        phoneNumber1,      // Phone Number 1
        phoneNumber2,      // Phone Number 2 (optional)
        email,             // Primary Email
        secondaryEmail,    // Secondary Email (optional)
        address,           // Address (optional)
        dateOfBirth,       // Date of Birth
        gender,            // Gender
        password,          // Password
        role               // Role ID (added role reference)
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
        password
      };
  
      // Check for missing required fields
      for (let [key, value] of Object.entries(requiredFields)) {
        if (!value) {
          return res.status(400).json({ message: `${key} is required and must be filled.` });
        }
      }
  
      // Validate email format
      if (!emailValidation(email)) {
        return res.status(400).json({ message: "Invalid email format." });
      }
  
      // Ensure the email is unique
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists." });
      }
  
      // Check if phone number is unique
      const phoneExists = await User.findOne({ phoneNumber1 });
      if (phoneExists) {
        return res.status(400).json({ message: "Phone number is already associated with another account." });
      }
  
      // Check if the date of birth is in a valid format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Format: YYYY-MM-DD
      if (!dateRegex.test(dateOfBirth)) {
        return res.status(400).json({ message: "Date of birth must be in the format YYYY-MM-DD." });
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
      const hashedPassword = bycrypt.hashSync(password, 10);
  
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
        role: roleReference._id // Reference to Role ID
      });
  
      // Save the new user to the database
      await newUser.save();
  
      return res.status(201).json({ message: "User created successfully.", user: newUser });
  
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  });

router.put("/update-user/:id", async (req, res) => {
    try {
        let {name, email, password, phone} = req.body
        const user = await User.findById(req.params.id)
        if(!user) return res.status(404).json({message: "User not found"})
        if (email) {
            email = email.toLowerCase()
            if(!emailValidation(email)) return res.status(400).json({message: "Invalid email format"})
            const userExists = await User.findOne({email})
            if(userExists && userExists._id.toString() !== req.params.id) return res.status(400).json({message: "User Email already exists"})
        }
        if (phone) {
            const phoneExists = await User.findOne({phone})
            if(phoneExists && phoneExists._id.toString() !== req.params.id) return res.status(400).json({message: "User Phone already exists"})
        }

        user.name = name || user.name   
        user.email = email || user.email
        user.password = password ? bycrypt.hashSync(password, 10) : user.password
        user.phone = phone || user.phone

        await user.save()
        res.status(200).json({message: "User updated successfully"})
    } catch (error) {
        console.log("error updating user", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.put("/change-status/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user) return res.status(404).json({message: "User not found"})
        
        if (user.status === "active") {
            user.status = "inactive"
        } else {
            user.status = "active"
        }

        await user.save()
        res.status(200).json({message: "User status updated successfully"})
    } catch (error) {
        console.log("error changing user status", error)
        res.status(500).json({message: "Internal server error"})
    }
})

router.delete("/delete-user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user) return res.status(404).json({message: "User not found"})
        
        user.name = user.name + "-deleted"
        user.email = user.email + "-deleted"
        user.phone = user.phone + "-deleted"    
        user.status = "deleted"

        await user.save()
    
        res.status(200).json({message: "User deleted successfully"})
    } catch (error) {
        console.log("error deleting user", error)
        res.status(500).json({message: "Internal server error"})
    }
})

module.exports = router