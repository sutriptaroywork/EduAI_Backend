const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type:String,
    required: true,
  },
  notifications: [
    {
      type: {
        type: String,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
    }
  ],
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
