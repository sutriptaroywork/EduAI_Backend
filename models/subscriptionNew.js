const mongoose = require('mongoose');

const subsNew = new mongoose.Schema({
    id: { type:String, required: true, unique: true },
    status: { type: String },
    planName: { type: String, required: true },
    startDate: { type: Date, default: Date.now },
    expiredDate: { type: Date },
    duration: { type: Number }, // Duration in days or months, adjust as needed
    paymentMethod: { type: String },
});

subsNew.index(
    // { mobile: 1 }, // Remove the reference to "email" in the compound index
    { unique: true }
);

const subNew = mongoose.model('subsNew', subsNew);

module.exports = subNew;
