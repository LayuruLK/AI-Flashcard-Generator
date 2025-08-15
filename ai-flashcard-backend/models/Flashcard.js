const mongoose = require('mongoose');

const flashcardSchema = mongoose.Schema(
    {
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        },
        subject: {
            type: String,
            default: ''
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium'
        },
        tags: [
            {
                type: String
            }
        ],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

exports.Flashcard = mongoose.model('Flashcard', flashcardSchema);
exports.flashcardSchema = flashcardSchema;
