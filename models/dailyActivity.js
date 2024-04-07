const mongoose = require('mongoose');

const dailyActivitySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  hoursSpent: {
    type: Number,
    required: true,
  },
  activityType: {
    type: String, // "qna" or "chat"
    required: true,
  },
});

const DailyActivity = mongoose.model('DailyActivity', dailyActivitySchema);

module.exports = DailyActivity;
