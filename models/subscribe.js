const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensure emails are unique
    trim: true,   // Trim whitespace from the email
    lowercase: true, // Store emails in lowercase
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
