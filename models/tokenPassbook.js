const mongoose = require('mongoose');
const { Schema } = mongoose;
// Define the enum values for segment type
const segmentTypeEnum = ['chat', 'upload_book', 'upload_chapter']; // Add other segment types as needed
const transactionTypeEnum = ['debit','credit'];
const segmentSchema = new Schema({
    segmentId: { type: String, required: true },
    segmentType: { type: String, enum: segmentTypeEnum, required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    description: { type: String, required: true },
    transactionType: { type: String, enum: transactionTypeEnum, required: true },
    timestamp: { type: Date, default: Date.now },
});
const Segment = mongoose.model('token_passbook', segmentSchema);
module.exports = Segment;