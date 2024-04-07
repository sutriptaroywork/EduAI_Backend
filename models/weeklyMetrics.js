const mongoose = require('mongoose');

const weeklyMetricsSchema = new mongoose.Schema({
  weekStartDate: {
    type: Date,
    required: true,
  },
  weekEndDate: {
    type: Date,
    required: true,
  },
  qnaHoursSpent: {
    type: Number,
    required: true,
  },
  chatHoursSpent: {
    type: Number,
    required: true,
  },
});

const WeeklyMetrics = mongoose.model('WeeklyMetrics', weeklyMetricsSchema);

module.exports = WeeklyMetrics;
