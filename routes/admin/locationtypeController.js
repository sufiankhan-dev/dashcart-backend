const express = require('express');
const router = express.Router();
const LocationType = require('../../models/Locationtype'); 

// Create a new LocationType
router.post('/create-location-type', async (req, res) => {
    try {
        const { name, maincategory } = req.body;

        // Validate required fields
        if (!name || !maincategory) {
            return res.status(400).json({ message: 'Name and maincategory are required fields.' });
        }

        // Ensure maincategory value is valid (since enum is set in the model)
        const validCategories = ["Commercial", "Construction"];
        if (!validCategories.includes(maincategory)) {
            return res.status(400).json({ message: 'Invalid maincategory. Allowed values are Commercial and Construction.' });
        }

        // Create a new LocationType instance
        const newLocationType = new LocationType({
            name,
            maincategory
        });

        // Save the new LocationType to the database
        await newLocationType.save();
        return res.status(201).json({ message: 'LocationType created successfully.', locationType: newLocationType });
    } catch (error) {
        console.error('Error creating LocationType:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get all LocationTypes with pagination
router.get('/get-location-types', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await LocationType.countDocuments();
        const locationTypes = await LocationType.find().skip(skip).limit(limit);
        const hasNextPage = (skip + limit) < total;

        const pagination = {
            page,
            limit,
            total,
            hasNextPage
        };

        return res.status(200).json({ locationTypes, pagination });
    } catch (error) {
        console.error('Error fetching LocationTypes:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get a single LocationType by ID
router.get('/get-location-types/:id', async (req, res) => {
    try {
        const locationType = await LocationType.findById(req.params.id);
        if (!locationType) {
            return res.status(404).json({ message: 'LocationType not found.' });
        }
        return res.status(200).json(locationType);
    } catch (error) {
        console.error('Error fetching LocationType:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
