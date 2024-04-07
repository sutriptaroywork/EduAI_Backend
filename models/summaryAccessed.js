const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    message: {
      type: String,
      required: true,
    },
  });
 
const summarySchema = new mongoose.Schema({
    usercode: {
        type: String,
        default: ""
    },
    contentcode: {
        type: String,
        default: ""
    },
    dateTime: {
        type: Date,
        default: Date.now
    },
    content: {
        type: resultSchema,
        default: ""
    }
});
 
const SummaryModel = mongoose.model('Summary', summarySchema);
 
module.exports = SummaryModel;