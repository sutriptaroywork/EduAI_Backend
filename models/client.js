const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
      },
      mobile: {
        type: String,
        unique: true,
      },
      password: String,
    
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
