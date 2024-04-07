const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  userId: {
    type: String,
    required: true,
    ref: 'User', // Reference to your User model
  },
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
