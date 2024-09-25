const express = require('express');
const router = express.Router();
const Location = require('../../models/Locationlist');  // Assuming this is the path to your Location model

// Create a new Location
router.post('/create-location', async (req, res) => {
    try {
        const { locationName, address, userList, timeZone, locationType, parentLocation, schedule, clientDetails } = req.body;

        // Validate required fields
        if (!locationName || !address || !userList || !timeZone || !locationType || !schedule || !clientDetails) {
            return res.status(400).json({ message: 'Required fields are missing.' });
        }

        // Create a new Location instance
        const newLocation = new Location({
            locationName,
            address,
            userList,
            timeZone,
            locationType,
            parentLocation,
            schedule,
            clientDetails
        });

        // Save the new Location to the database
        await newLocation.save();
        return res.status(201).json({ message: 'Location created successfully.', location: newLocation });
    } catch (error) {
        console.error('Error creating Location:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get all Locations
router.get('/get-locations', async (req, res) => {
    try {
        const locations = await Location.find()
            .populate('userList')       // Populate user details
            .populate('timeZone')       // Populate timezone details
            .populate('locationType')   // Populate location type details
            .populate('parentLocation'); // Populate parent location details
        res.status(200).json(locations);
    } catch (error) {
        console.error('Error fetching Locations:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get a single Location by ID
router.get('/get-location/:id', async (req, res) => {
    try {
        const location = await Location.findById(req.params.id)
            .populate('userList')
            .populate('timeZone')
            .populate('locationType')
            .populate('parentLocation');
        if (!location) return res.status(404).json({ message: 'Location not found' });
        res.status(200).json(location);
    } catch (error) {
        console.error('Error fetching Location:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


router.put('/update-location/:id', async (req, res) => {
    try {
        const { locationName, address, userList, timeZone, locationType, parentLocation, schedule, clientDetails } = req.body;

        // Validate required fields
        if (!locationName || !address || !userList || !timeZone || !locationType || !schedule || !clientDetails) {
            return res.status(400).json({ message: 'Required fields are missing.' });
        }

        // Find the location by ID and update it
        const updatedLocation = await Location.findByIdAndUpdate(
            req.params.id,
            { locationName, address, userList, timeZone, locationType, parentLocation, schedule, clientDetails },
            { new: true, runValidators: true }
        );

        if (!updatedLocation) return res.status(404).json({ message: 'Location not found' });

        return res.status(200).json({ message: 'Location updated successfully.', location: updatedLocation });
    } catch (error) {
        console.error('Error updating Location:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});


router.delete('/delete-location/:id', async (req, res) => {
    try {
        const location = await Location.findByIdAndDelete(req.params.id);

        if (!location) return res.status(404).json({ message: 'Location not found' });

        return res.status(200).json({ message: 'Location deleted successfully.' });
    } catch (error) {
        console.error('Error deleting Location:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
