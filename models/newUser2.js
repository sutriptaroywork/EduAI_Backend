const mongoose = require('mongoose');

const newUser2Schema = new mongoose.Schema({
    email: {
        type: String,
    },
    mobile: {
        type: String,
    },
    password: String,


});
newUser2Schema.index(
    { email: 1, mobile: 1},
    { unique: true }
);

const newUser2 = mongoose.model('newUser2', newUser2Schema);

module.exports = newUser2;
