const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
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
