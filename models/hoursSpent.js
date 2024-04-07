const mongoose = require('mongoose');

const hoursSpentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  loginTime: {
    type: Date,
    required: true,
  },
  logoutTime: {
    type: Date,
  },
  token: {
    type: String,
    required: true,
  },
});

const HoursSpent = mongoose.model('HoursSpent', hoursSpentSchema);

module.exports = HoursSpent;
