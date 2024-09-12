const express = require("express");
const router = express.Router()
const Review = require("../../models/Review")
const Vendor = require("../../models/Vendor")

router.get("/get-reviews/:vendorId", async (req, res) => {
    try {
        const reviews = await Review.find({vendor: req.params.vendorId}).populate("user", "-password -role -email -createdAt -updatedAt -__v").select("-__v -createdAt -updatedAt -vendor")
        
        const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length

        res.status(200).json({reviews: reviews, averageRating: averageRating})
    } catch(error) {
        console.log("Error fetching reviews", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

router.post("/create-review", async(req,res) => {
    try {
        const { vendor, rating, review } = req.body
        if (!vendor || !rating || !review) return res.status(400).json({ message: "All fields are required" })
        
        if (!req.user) return res.status(401).json({ message: "Need to be Signed in to leave" })
        if ((rating < 0 || rating > 5)) return res.status(400).json({ message: "Rating must be between 1 and 5" })
        const createReview = new Review({
            user: req.user._id,
            vendor,
            rating,
            review
        })
        await createReview.save()

        res.status(201).json({ message: "Review created successfully" })
    } catch(error) {
        console.log("Error creating review", error)
        res.status(500).json({ message: "Internal server error" })
    }
})

module.exports = router