const mongoose = require('mongoose');

const overallPerformanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true, // Each user can have only one performance record
  },
  rightAnswers: {
    type: Number,
    default: 0,
  },
  wrongAnswers: {
    type: Number,
    default: 0,
  },
  attemptedQuestions: {
    type: Number,
    default: 0,
  },
});

const OverallPerformance = mongoose.model('OverallPerformance', overallPerformanceSchema);

module.exports = OverallPerformance;
