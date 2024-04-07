const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    required: true,
  },
  specifications: {
    type: [String],
    required: true,
  },
  type: {
    type: String,
    enum: ['subscription', 'token'],
    required: true,
  },
}, {
  timestamps: true, // This will add createdAt and updatedAt fields
});

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
