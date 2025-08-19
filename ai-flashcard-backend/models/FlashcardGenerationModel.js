const mongoose = require('mongoose');

const flashcardGenerationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    originalContent: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String
    },
    fileType: {
        type: String,
        enum: ['pdf', 'txt', 'md']
    },
    flashcards: [{
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        }
    }],
    requestedAt: {
        type: Date,
        default: Date.now
    }
});

exports.FlashcardGeneration = mongoose.model('FlashcardGeneration', flashcardGenerationSchema);
exports.flashcardGenerationSchema = flashcardGenerationSchema;