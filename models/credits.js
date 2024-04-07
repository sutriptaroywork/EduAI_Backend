const mongoose = require('mongoose');

const creditsSchema = new mongoose.Schema({
    id: {
        type: String, // Assuming you have a User model with ObjectId as the user's ID
        required: true,
      },
    myReferralCode: {
      type: String,
      required: true,
    },
    referredIds: [
      {
        userId: {
          type: String,
          required: true,
        },
        creditsScore: {
          type: Number,
          required: true,
        },
      }
    ],
  });
  
  const Credits = mongoose.model('Credits1', creditsSchema);
  
  module.exports = Credits;