const mongoose = require('mongoose');

const googleTokenSchema = new mongoose.Schema({
  userId: {
    type:String,
    required: true,
  },
  googleToken: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Set the expiration time to 24 hours in seconds
  },
});

const googleToken = mongoose.model('GToken', googleTokenSchema);

module.exports = googleToken;
