const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: String,
  description: String,
  type: String, // 'qna' or 'chat'
  viewedAt: Date,
  viewCount:Number,
  assigned_code: {
    type: String,
    required: true,
  },
  duration: Number, // Store the duration in seconds
  contentUrl: String,
  });


const History = mongoose.model('History', historySchema);

module.exports = History;










// const mongoose = require('mongoose');

// const historySchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   title: String,
//   description: String,
//   type: String, // 'pdf' or 'video'
//   viewedAt: Date,
//   assigned_code: {
//     type: String,
//     required: true,
//   },
//   viewCount: {
//     type: Number,
//     default: 0,
//   },
//   contentUrl: String,
// });


// const History = mongoose.model('History', historySchema);

// module.exports = History;

