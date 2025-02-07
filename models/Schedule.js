const mongoose = require("mongoose");
const { checkout } = require("../routes/admin/attendenceController");

const EventSchema = new mongoose.Schema({
  startTime: {
    type: String,
    // required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/, // HH:mm format (no seconds)

  },
  endTime: {
    type: String,
    // required: true,
    match: /^([01]\d|2[0-3]):([0-5]\d)$/, // HH:mm format (no seconds)

  },
 
  assignedEmployee: {
    type: String, // Optional for initial creation
  },
});

const ScheduleSchema = new mongoose.Schema({
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  calltime:{
    type:[Date]

  },
  checkintime:{
    type:[Date]


  },
  checkout:{
    type:[Date]

  },
  Note:{
    type:[String]
  },
  attendances: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Attendance" // Reference to Attendance model
  }],
  date: {
    type: Date,
    required: true,
  },
  events: [EventSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },

  
});

module.exports = mongoose.model("Schedule", ScheduleSchema);

// const mongoose = require("mongoose");

// // Schema for an individual time interval (start and end time)
// const TimeIntervalSchema = new mongoose.Schema({
//   startTime: {
//     type: String, // Storing time as a string, you can modify to Date if necessary
//     required: true,
//   },
//   endTime: {
//     type: String,
//     required: true,
//   },
// });

// // Schema for an event with time intervals for a specific day
// const EventSchema = new mongoose.Schema({
//   day: {
//     type: String, // e.g., Monday, Tuesday, etc.
//     required: true,
//   },
//   intervals: [TimeIntervalSchema], // Array of time intervals (start and end times)
// });

// // Schedule schema to store events by date
// const ScheduleSchema = new mongoose.Schema({
//   location: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Location", // Reference to Location model
//     required: true,
//   },
//   events: [EventSchema], // Array of events, each containing day and multiple time intervals
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("Schedule", ScheduleSchema);
