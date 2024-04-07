const mongoose = require('mongoose');

const popularSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: String,
  type: String, // 'pdf' or 'video'
  contentUrl: String,
  viewCount:Number,
  assigned_code: {
    type: String,
    required: true
  }
});

popularSchema.index({ userId: 1, assigned_code: 1 }, { unique: true })

const PopularContent = mongoose.model('PopularContent', popularSchema);

module.exports = PopularContent;
