const mongoose = require("mongoose");

// Schema for an individual event (start and end time with employee assignment)
const EventSchema = new mongoose.Schema({
  startTime: {
    type: String, // Storing time as a string, you can modify to Date if necessary
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  assignedEmployee: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: "Employee", // Reference to Employee model
    type: String,
    // required: true,
  },
});

// Schedule schema to store events by date
const ScheduleSchema = new mongoose.Schema({
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location", // Reference to Location model
    required: true,
  },
  date: {
    type: Date, // Date for the schedule (specific day)
    required: true,
  },
  events: [EventSchema], // Array of events
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
