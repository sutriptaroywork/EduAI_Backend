const mongoose = require('mongoose');

const newProfileSchema = new mongoose.Schema({
  id: { type:String, required: false, unique: true },
  fullname: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  grade: { type: String, required: true },
  school: { type: String, required: true },
  city: { type: String, required: true },
  referralCode: { type: String, unique: true },
  areaOfInterest: { type: [String] }, // Array to store multiple interests
  completed: { type: Boolean },

});

const ProfileNew = mongoose.model('NewProfile', newProfileSchema);

module.exports = ProfileNew;
