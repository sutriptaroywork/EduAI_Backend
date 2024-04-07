const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['b2b', 'b2c'],
  },
  orderId: String,
  transactionID: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'newProf',
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed'],
  },
  amount: Number,  
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
