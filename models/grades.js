const mongoose = require('mongoose');

// Define the submenu schema
const subMenuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

// Define the "Grades" schema
const gradesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  submenu: [subMenuSchema], // Array of submenu items
});

// Define the model for the "Grades" collection
const Grades = mongoose.model('Grades', gradesSchema);

module.exports = Grades;
