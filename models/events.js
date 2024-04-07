const mongoose = require('mongoose');

const events1Schema = new mongoose.Schema({
    id: {
        type: String, // Assuming you have a User model with ObjectId as the user's ID
        required: true,
      },
    title: {
    type: String, 
    required: true,
  },
 
  subtitle: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const events = mongoose.model('Events1', events1Schema);

module.exports = events;
