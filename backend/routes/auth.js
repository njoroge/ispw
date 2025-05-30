const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming User.js is in ../models/

// Use JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Create new user instance (password will be hashed by pre-save hook in User model)
    user = new User({
      username,
      email,
      password, // Password will be hashed by pre-save hook
    });

    // TEMPORARY: Seed first admin user
    // This is a temporary mechanism for MVP/testing to create an admin user.
    // In a production environment, use a more secure method for admin creation
    // (e.g., a separate script, an admin panel, or manual DB update).
    if (email === 'admin@example.com') {
      user.role = 'admin';
    }

    // Save user to database
    await user.save();

    // Respond (excluding password)
    const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
    };

    res.status(201).json({ message: 'User registered successfully', user: userResponse });

  } catch (error) {
    console.error('Registration error:', error.message);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// GET /api/auth/me - Get current logged-in user's profile
// @desc   Get user profile
// @access Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user.id is available from authMiddleware
    const user = await User.findById(req.user.id)
      .select('-password') // Exclude password from the result
      .populate('currentPackage'); // Populate the 'currentPackage' field

    if (!user) {
      // This case should ideally not be reached if token is valid and user exists
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials (user not found)' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials (password mismatch)' });
    }

    // Generate JWT
    const payload = {
      user: {
        id: user.id,
        // username: user.username, // Optionally include username or other details
        // email: user.email
      },
    };

    jwt.sign(
      payload,
      JWT_SECRET, // Use the JWT_SECRET from .env
      { expiresIn: 3600 }, // Expires in 1 hour (3600 seconds)
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
