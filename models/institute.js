const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  institute: {
    type: String,
    required: true,
  },
});

const InstituteModel = mongoose.model('Institute', instituteSchema);

module.exports = InstituteModel;
