const mongoose = require('mongoose');

const orderHistorySchema = new mongoose.Schema({
  orderDate: {
    type: Date,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  orderedQuantity: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const tokenUsageSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  tokensUsed: {
    type: Number,
    required: true,
  },
  tokensRemaining: {
    type: Number,
    required: true,
  },
  uploadedMaterial: {
    type: String,
    required: true,
  },
});

const orgProfileSchema = new mongoose.Schema({
  publisher_code: {
    type: String,
    unique: true,
    required: true,
  },
  organisation_name: String,
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  email: { type: String },
  year_of_establishment: String,
  address_line_1: String,
  address_line_2: String,
  pincode: String,
  city: String,
  state: String,
  country: String,
  contact_number: String,
  gst_number: String,
  organisation_website: String,
  profile_picture: String, // Assuming BASE64 is a string representation
  content_type: {
    type: [String],
    enum: {
      values: ['books', 'study material', 'videos'],
      message: '{VALUE} is not supported'
    }
  },
  description: String,
  referralCode: {
    type: String,
    default: ""
  },
  completed: Boolean,
  tokenBalance: {
    type: Number,
    default: 0,
  },
  couponHistory:[String],
  orderHistory: {
    type: [orderHistorySchema],
    default: [],
  },
  tokenUsage: {
    type: [tokenUsageSchema],
    default: [],
  },
  type: {
    type: String,
    enum : {
      values: ['publisher','school', 'coaching'],
      message: '{VALUE} is not supported'
    },
    default: 'publisher'
  },
  holdingBalance: { type: Number, default: 0 }
});

const OrganizationProfile = mongoose.model('orgProfile', orgProfileSchema);

module.exports = OrganizationProfile;
