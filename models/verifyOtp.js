const mongoose = require('mongoose');

const verifyotpSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  mobile: {
    type: String,
  },
  otp: String,
  createdAt: {
    type: Date,
    default: Date.now, // Set the default creation date to the current time
    expires: 600, // Specify the TTL in seconds (2 minutes)
  },
});

verifyotpSchema.index(
  { email: 1, mobile: 1 },
  { expireAfterSeconds: 0 } // Set to 0 to use the expiration from the 'createdAt' field
);

const verifyotp = mongoose.model('verifyotp', verifyotpSchema);

module.exports = verifyotp;
