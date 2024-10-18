const mongoose = require("mongoose");
require("dotenv").config();
const { MONGO_URI } = process.env;

exports.connect = () => {
  console.log("Mongo URI:", MONGO_URI); // Debugging line
  // Connecting to the database
  mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }) // Optional options for newer versions
    .then(() => {
      console.log("Successfully connected to ", MONGO_URI);
    })
    .catch((error) => {
      console.log("Database connection failed. Exiting now...");
      console.error(error);
      process.exit(1);
    });
};
