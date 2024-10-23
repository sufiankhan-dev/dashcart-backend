const mongoose = require("mongoose");

// Schema for schedule timings (days and start/end times)
// const ScheduleSchema = new mongoose.Schema({
//   day: {
//     type: String,
//     enum: [
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//       "Sunday",
//     ],
//     required: true,
//   },
//   startTime: {
//     type: String, // You can also use Date if you want to manage timezones properly
//     required: true,
//   },
//   endTime: {
//     //end time of the schedule
//     type: String,
//     required: true,
//   },
// });

// Schema for a specific day with start and end time
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
  intervals: [
    {
      startTime: {
        type: String, // Storing time as a string, you can modify to Date if necessary
        required: true,
      },
      endTime: {
        type: String, // End time of the schedule
        required: true,
      },
    },
  ],
});

// Schema for client detailss
const ClientDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
  },
 
  designation: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
});

// Main Location schema
const LocationSchema = new mongoose.Schema({
  customerNo:{
    type:String,
    required:false

},
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
