const express = require('express');
const router = express.Router();
const { Flashcard } = require('../models/Flashcard');
const { User } = require('../models/User');
const auth = require('../security/auth'); // 

// ✅ Get all flashcards (pagination optional)
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const flashcards = await Flashcard.find()
            .populate('user', 'firstName lastName email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Flashcard.countDocuments();

        res.status(200).json({
            success: true,
            data: flashcards,
            total: count,
            page: Number(page),
            pages: Math.ceil(count / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Get flashcards by user ID
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const flashcards = await Flashcard.find({ user: req.params.userId })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: flashcards });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Get single flashcard
router.get('/:id', auth, async (req, res) => {
    try {
        const flashcard = await Flashcard.findById(req.params.id)
            .populate('user', 'firstName lastName email');

        if (!flashcard) {
            return res.status(404).json({ success: false, message: 'Flashcard not found' });
        }

        res.status(200).json({ success: true, data: flashcard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Create flashcard
router.post('/', auth, async (req, res) => {
    try {
        const { question, answer, subject, difficulty, tags } = req.body;

        if (!question || !answer) {
            return res.status(400).json({ success: false, message: 'Question and answer are required' });
        }

        const user = await User.findById(req.user.userId); // ✅ from token
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        const flashcard = new Flashcard({
            question,
            answer,
            subject,
            difficulty,
            tags,
            user: req.user.userId
        });

        await flashcard.save();
        res.status(201).json({ success: true, data: flashcard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Update flashcard
router.put('/:id', auth, async (req, res) => {
    try {
        const flashcard = await Flashcard.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId }, // ✅ Only owner can update
            { ...req.body },
            { new: true }
        );

        if (!flashcard) {
            return res.status(404).json({ success: false, message: 'Flashcard not found or not authorized' });
        }

        res.status(200).json({ success: true, data: flashcard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Delete flashcard
router.delete('/:id', auth, async (req, res) => {
    try {
        const flashcard = await Flashcard.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId // ✅ Only owner can delete
        });

        if (!flashcard) {
            return res.status(404).json({ success: false, message: 'Flashcard not found or not authorized' });
        }

        res.status(200).json({ success: true, message: 'Flashcard deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ Get count of flashcards
router.get('/get/count', auth, async (req, res) => {
    try {
        const count = await Flashcard.countDocuments({ user: req.user.userId });
        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
