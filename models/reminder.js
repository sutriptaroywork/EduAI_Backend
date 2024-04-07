const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  priority: {
    type: String, // You can change the data type to match your specific priorities (e.g., 'High', 'Medium', 'Low')
    required: true,
  },
  userId: {
    type: String, // Assuming you have a User model with ObjectId as the user's ID
    ref: 'User', // Reference to the User model
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
