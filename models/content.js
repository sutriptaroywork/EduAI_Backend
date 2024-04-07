const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category: String,
  subcategories: String,
});

const contentSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String, // 'pdf' or 'video'
  contentUrl: String,
  assigned_code: String,
  viewedAt: Date,
  viewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  categories: [categorySchema], // Array of category objects
});

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;





















// const mongoose = require('mongoose');

// const contentSchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   type: String, // 'pdf' or 'video'
//   contentUrl: String,
//   assigned_code: String,
//   viewedAt: Date,
//   viewCount: {
//     type: Number,
//     default: 0,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Content = mongoose.model('Content', contentSchema);

// module.exports = Content;
