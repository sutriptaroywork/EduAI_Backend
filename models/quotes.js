const mongoose = require('mongoose');

const quotesSchema = new mongoose.Schema({
  quoteText: String,
  author: String,
});


const Quotes = mongoose.model('Quotes', quotesSchema);

module.exports = Quotes;
