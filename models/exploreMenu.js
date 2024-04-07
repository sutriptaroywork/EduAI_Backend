const mongoose = require('mongoose');

const submenuSchema = new mongoose.Schema({
  name: String,
});

const menuSchema = new mongoose.Schema({
  name: String,
  submenu: [submenuSchema],
});

module.exports = mongoose.model('Menu', menuSchema);
