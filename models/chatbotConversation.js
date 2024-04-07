const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    userID: {
        type: String,
        required: true,
    },
    assignedCode: {
        type: String,
        required: true,
    },
    result: {
        reply: {
            type: String,
            required: true,
        },
        chatHistory: [
            {
                role: {
                    type: String,
                    enum: ['user', 'assistant'],
                    required: true,
                },
                content: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
