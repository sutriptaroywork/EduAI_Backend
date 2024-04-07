const mongoose = require('mongoose');

const weeklyHoursSpentSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  loginTime: {
    type: Date,
    required: true,
  },
  logoutTime: {
    type: Date,
  },

});

const weeklyHoursSpent = mongoose.model('weeklyHoursSpent', weeklyHoursSpentSchema);

module.exports = weeklyHoursSpent;
