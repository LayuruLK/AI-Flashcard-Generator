const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const Service = require('../services/GenericService');
const multer = require('multer');
const { uploadToCloudinary } = require('../helpers/cloudinaryStorage');
const bcrypt = require('bcrypt');
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

    // Check for existing user
    const alreadyUser = await User.findOne({ nic });
    if (alreadyUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User already registered!" 
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

module.exports = router;