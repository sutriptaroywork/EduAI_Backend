const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
});

const summeryAccessedSchema = new mongoose.Schema({
  usercode: {
    type: String,
    default: ""
  },
  contentcode: {
    type: String,
    default: ""
  },
  accessedTime:{
    type: Date,
    default: Date.now
},
  date: {
    type: String,
    default: ""
  },
  time: {
    type: String,
    default: ""
  },
  content: {
    type: resultSchema,
    default: ""
  }
});


const summeryAccessed = mongoose.model('summeryAccessed', summeryAccessedSchema);

module.exports = summeryAccessed;
