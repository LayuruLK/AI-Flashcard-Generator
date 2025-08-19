const express = require('express');
const router = express.Router();
const Service = require('../services/GenericService');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { FlashcardGeneration } = require('../models/FlashcardGenerationModel');
const name = 'FlashCardHistory';

// Get all history
router.get('/', async (req, res) => {
    Service.getAll(res, FlashcardGeneration, name).catch((error) => {
        res.status(500).send(error + " Server Error")
    })
})


// Get flashcard history by user ID
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find all flashcard generations for this user
        const history = await FlashcardGeneration.find({ userId })
            .sort({ requestedAt: -1 }); // Sort by newest first
        
        
        if (!history ) {
            return res.status(404).json({
                success: false,
                message: 'No flashcard history found for this user'
            });
        }

        res.status(200).json({
            success: true,
            data: history,
            message: 'Flashcard history retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching flashcard history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch flashcard history',
            error: error.message
        });
    }
});

module.exports = router;