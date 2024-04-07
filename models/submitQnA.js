const mongoose = require('mongoose');

const qnaSchema = new mongoose.Schema({
  usercode: {
    type: String,
    default: ""
  },
  contentcode: {
    type: String,
    default: ""
  },
  dateTime: {
    type: String,
    default: ""
  },
  easy: {
    total: {
      type: Number,
      default: 0
    },
    attempted: {
      type: Number,
      default: 0
    },
    correct: {
      type: Number,
      default: 0
    },
    incorrect: {
      type: Number,
      default: 0
    }
  },
  medium: {
    total: {
      type: Number,
      default: 0
    },
    attempted: {
      type: Number,
      default: 0
    },
    correct: {
      type: Number,
      default: 0
    },
    incorrect: {
      type: Number,
      default: 0
    }
  },
  hard: {
    total: {
      type: Number,
      default: 0
    },
    attempted: {
      type: Number,
      default: 0
    },
    correct: {
      type: Number,
      default: 0
    },
    incorrect: {
      type: Number,
      default: 0
    }
 

}});

const qna = mongoose.model('qna', qnaSchema);

module.exports = qna;