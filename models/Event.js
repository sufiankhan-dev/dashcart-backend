// models/event.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    date: { type: Date, required: true },
    events: [
      {
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        assignedEmployee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
