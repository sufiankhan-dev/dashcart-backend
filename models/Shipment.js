const mongoose = require('mongoose');

const ShipmentSchema = new mongoose.Schema({
    freightShipped: {
        type: String,
        required: true
    },
    
    carrierRequirements: {
        type: String,
        enum: ['Refrigeration', 'Hazardous Materials', 'Oversized Load', 'None'], // Add more if needed
        default: 'None'
    },

    
    pickingUpFrom: {
        city: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        }
    },

    // Delivery Location Details
    deliveryTo: {
        city: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        }
    },

    // Pick-Up Date
    pickUpDate: {
        type: Date,
        required: true
    },

    // Delivery Date
    deliveryDateBy: {
        type: Date,
        required: true
    },

    // Freight Description
    freightDescription: {
        type: String,
        required: true
    },

    // Freight Images (Multiple Images)
    freightImages: [
        {
            type: String, // Storing URLs or file paths to images
            required: false
        }
    ]
}, {
    timestamps: true // Automatically adds createdAt and updatedAt timestamps
});

// Export the model
module.exports = mongoose.model('Shipment', ShipmentSchema);
