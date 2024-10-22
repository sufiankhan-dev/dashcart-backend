const mongoose = require("mongoose");

// Schema for schedule timings (days and start/end times)
const ScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  startTime: {
    type: String, // You can also use Date if you want to manage timezones properly
    required: true,
  },
  endTime: {
    //end time of the schedule
    type: String,
    required: true,
  },
});

// Schema for client detailss
const ClientDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  customerNo:{
    type:String,
    required:false

},
  designation: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

// Main Location schema
const LocationSchema = new mongoose.Schema({
  locationName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  // userList: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId, // Reference to User model
  //     ref: "User",
  //     required: true,
  //   },
  // ],
  timeZone: {
    type: String,
    required: true,
  },
  // employees: [
  //   {
  //     // Ensure this is defined
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Employee", // Reference to Employee model
  //   },
  // ],
  locationType: {
    type: mongoose.Schema.Types.ObjectId, // Reference to LocationType model
    ref: "LocationType",
    required: true,
  },

  schedule: [ScheduleSchema], // Array of schedule objects
  clientDetails: [ClientDetailsSchema], // Array of client details objects
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Location", LocationSchema);
