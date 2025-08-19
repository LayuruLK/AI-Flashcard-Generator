const express = require('express');
const router = express.Router();
const { Flashcard } = require('../models/Flashcard');
const { User } = require('../models/User');
const auth = require('../security/auth'); // 

const multer = require('multer');
const { uploadToCloudinary } = require('../helpers/cloudinaryStorage');
const fs = require('fs');
const pdfParse = require('pdf-parse'); // for PDF text extraction
const { generateFlashcardsFromText } = require('../services/aiFlashcardService');
const { FlashcardGeneration } = require('../models/FlashcardGenerationModel');

const upload = multer({ storage: multer.memoryStorage() });

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


// ✅ Generate flashcards from uploaded resource or pasted text
router.post('/generate-from-resource/:userId', auth, upload.single('resource'), async (req, res) => {
    try {
        const userId = req.params.userId; 
        let extractedText = '';
        let fileUrl = null;
        let fileType = null;
        let originalContent = '';

        // 1️⃣ Handle file upload if provided
        if (req.file) {
            // Upload file to Cloudinary
            fileUrl = await uploadToCloudinary(req.file);
            fileType = req.file.originalname.split('.').pop().toLowerCase();

            if (fileType === 'pdf') {
                const data = await pdfParse(req.file.buffer);
                extractedText = data.text;
                originalContent = extractedText;
            } else if (['txt', 'md'].includes(fileType)) {
                extractedText = req.file.buffer.toString('utf-8');
                originalContent = extractedText;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Unsupported file type for text extraction'
                });
            }
        }
        // 2️⃣ Handle pasted text if provided
        else if (req.body.text && req.body.text.trim()) {
            extractedText = req.body.text.trim();
            originalContent = extractedText;
        }
        // 3️⃣ No valid input
        else {
            return res.status(400).json({
                success: false,
                message: 'No file or text provided'
            });
        }

        // 4️⃣ Check extracted text
        if (!extractedText.trim()) {
            return res.status(400).json({
                success: false,
                message: 'No readable text found'
            });
        }

        // 5️⃣ Generate flashcards
        const flashcards = await generateFlashcardsFromText(extractedText);

        // 6️⃣ Save to FlashcardGeneration model
        const generationRecord = new FlashcardGeneration({
            userId,
            originalContent,
            fileUrl,
            fileType,
            flashcards
        });

        await generationRecord.save();

        // 7️⃣ Return results
        res.status(200).json({
            success: true,
            generationId: generationRecord._id,
            fileUrl,
            generatedFlashcards: flashcards
        });

    } catch (error) {
        console.error('Error generating flashcards:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating flashcards',
            error: error.message
        });
    }
});


module.exports = router;
