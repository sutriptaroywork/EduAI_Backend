const mongoose = require('mongoose');

// Define a schema for the quiz content
const quizContentSchema = new mongoose.Schema({
  q: {
    type: String,
    required: true,
  },
  c: {
    type: [String],
    required: true,
  },
  a: {
    type: Number,
    required: true,
  },
  e: {
    type: String,
    required: true,
  },
  f: {
    type: String, // You can choose an appropriate data type for the difficulty level
    required: true,
  },
});

const qnaAccessedSchema = new mongoose.Schema({
  usercode: {
    type: String,
    default: ""
  },
  contentcode: {
    type: String,
    default: ""
  },
  date: {
    type: String,
    default: ""
  },
  time: {
    type: String,
    default: ""
  },
  level: {
    type: String,
    default: ""
  },
  content: {
    type: [quizContentSchema], // Embed the quiz content schema as an array
    required: true,
  },
});

const qnaAccessed = mongoose.model('qnaAccessed', qnaAccessedSchema);

module.exports = qnaAccessed;
