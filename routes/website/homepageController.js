const express = require("express")
const router = express.Router()
const Category = require("../../models/Category")
const Product = require("../../models/Product")
const Brand = require("../../models/Brand")
const HomePage = require("../../models/HomePage")
const Vendor = require("../../models/Vendor")
const Schedule = require("../../models/Schedule")

router.get("/get-homepage", async (req, res) => {
    try {
        const homepage = await HomePage.findOne()
        if (!homepage) return res.status(404).json({message: "Homepage not found"})
        
        const categories = await Category.find()
        const products = await Product.find().limit(8).populate("category").populate("brand")
        const vendors = await Vendor.find({type: "vendor"}).limit(8).select("-password -role -featured")
        const brands = await Brand.find().limit(8)

        const featuredProducts = await Product.find({featured: true}).limit(8).populate("category").populate("brand")
        const featuredVendors = await Vendor.find({featured: true, type: "vendor"}).limit(8).select("-password -role -featured")
        const featuredBrands = await Brand.find({featured: true}).limit(8)

        const obj = {
            homepage,
            categories,
            products,
            vendors,
            brands,
            featuredProducts,
            featuredVendors,
            featuredBrands
        }

        res.status(200).json(obj)
    } catch(error) {
        console.log(error)
        res.status(500).json({message: "Internal server error"})
    }
})

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

module.exports = router