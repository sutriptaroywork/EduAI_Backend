const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  b2b: {
    type: Boolean,
    default: false,
  },
  b2c: {
    type: Boolean,
    default: false,
  },
});

const Maintenance = mongoose.model('maintenance', maintenanceSchema);

module.exports = Maintenance;
