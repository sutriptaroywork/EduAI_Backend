const mongoose = require('mongoose');

const resetPassSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // Set an expiration time for the documents (e.g., 1 hour)
  },
});

const ResetPass = mongoose.model('ResetPass', resetPassSchema);

module.exports = ResetPass;
