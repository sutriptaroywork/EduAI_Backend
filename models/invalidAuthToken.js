const mongoose = require('mongoose');

const invalidAuthTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const InvalidAuthTokens = mongoose.model('invalidAuthTokens',invalidAuthTokenSchema)

module.exports = InvalidAuthTokens
