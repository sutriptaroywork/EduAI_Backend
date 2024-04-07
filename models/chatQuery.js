const mongoose = require('mongoose');

const chatQuerySchema = new mongoose.Schema({
  usercode: {
    type: String,
    default: ""
  },
  contentcode: {
    type: String,
    default: ""
  },
  date_Time: {
    type: String,
    default: ""
  },
  time: {
    type: String,
    default: ""
  },
  content: [{
    type: String,
    required: true
  }],
});

const chatQuery = mongoose.model('chatQuery', chatQuerySchema);

module.exports = chatQuery;
