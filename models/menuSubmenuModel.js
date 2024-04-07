const mongoose = require('mongoose');

// Define the schema for the "data" field
const menuSubmenuSchema = new mongoose.Schema({
  grades: [String],
  subject: [String],
  category: [String],
  publisher: [String],     // Allow an array of strings
});

// Create the Mongoose model
const menuSubmenuModel = mongoose.model('Data', menuSubmenuSchema);

module.exports = menuSubmenuModel;