const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const Service = require('../services/GenericService');
const multer = require('multer');
const { uploadToCloudinary } = require('../helpers/cloudinaryStorage');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const name = 'User';

// Configure multer to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Get all users
router.get('/', async (req, res) => {
    Service.getAll(res, User, name).catch((error) => {
        res.status(500).send(error + " Server Error")
    })
})

// Get User By id
router.get('/profile/:id', async (req, res) => {
    Service.getById(req, res, User, name).catch((error) => {
        res.status(500).send(error + " Server Error")
    })
})

// getCount
router.get('/get/count', (req, res) => {
    Service.getCount(res, User, name).catch((error) => {
        res.status(500).send(error + " Server Error")
    })
})

// Post new User
router.post('/register', upload.single('profilePhoto'), async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            nic,
            email,
            gender,
            password,
            phone,
            addressline1,
            addressline2,
            city,
            district,
            province,
        } = req.body;

        // Validation
        const requiredFields = [
            { field: firstName, name: "First Name" },
            { field: lastName, name: "Last Name" },
            { field: nic, name: "NIC" },
            { field: gender, name: "Gender" },
            { field: password, name: "Password" },
            { field: phone, name: "Phone" },
            { field: city, name: "City" },
            { field: district, name: "District" },
            { field: province, name: "Province" }
        ];

        const missingFields = requiredFields.filter(field => !field.field);
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Please fill all required fields: ${missingFields.map(f => f.name).join(', ')}`
            });
        }

        // Check for existing user by email or NIC
        const existingUser = await User.findOne({
            $or: [{ email }, { nic }]
        });

        if (existingUser) {
            let message = "User already registered!";
            if (existingUser.email === email) {
                message = "Email already in use";
            } else if (existingUser.nic === nic) {
                message = "NIC already registered";
            }
            return res.status(400).json({
                success: false,
                message
            });
        }

        // Upload to Cloudinary if photo exists
        let profilePhotoUrl = '';
        if (req.file) {
            try {
                profilePhotoUrl = await uploadToCloudinary(req.file);
            } catch (uploadError) {
                return res.status(500).json({
                    success: false,
                    message: 'Profile photo upload failed'
                });
            }
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            nic,
            gender,
            email,
            passwordHash: bcrypt.hashSync(password, 10),
            phone,
            addressline1,
            addressline2,
            city,
            district,
            province,
            profilePhoto: profilePhotoUrl
        });

        // Save user
        await user.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user
        });

    } catch (error) {
        console.error('Internal Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});


// User login
router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.SECRET_KEY;

    if (!user) {
        return res.status(400).send('The user not found');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        try {
            const token = jwt.sign(
                { userId: user._id },
                secret,
                { expiresIn: '1d' }
            );
            res.status(200).json({ user: { _id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, nic: user.nic, city: user.city, district: user.district }, token });
        } catch (error) {
            console.error('Error signing JWT token:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(400).json({ error: 'Password is wrong' });
    }
});

module.exports = router;