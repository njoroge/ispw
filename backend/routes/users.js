const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust path if User model is elsewhere
const authMiddleware = require('../middleware/authMiddleware'); // Adjust path if middleware is elsewhere
const bcrypt = require('bcryptjs'); // For password comparison and hashing (though hashing is via pre-save hook)

// PUT /api/users/me/profile - Update current logged-in user's profile (username, email)
// @desc   Update user's own profile
// @access Private
router.put('/me/profile', authMiddleware, async (req, res) => {
  const userId = req.user.id; // From authMiddleware
  const { username, email } = req.body;

  const updateFields = {};
  if (username !== undefined) { // Check for undefined to allow sending empty string if desired by client, though usually validated
    if (typeof username !== 'string') return res.status(400).json({ message: 'Username must be a string.' });
    updateFields.username = username;
  }
  if (email !== undefined) {
    if (typeof email !== 'string') return res.status(400).json({ message: 'Email must be a string.' });
    updateFields.email = email.toLowerCase(); // Store email in lowercase
  }

  // Handle empty update or if only non-updatable fields were sent
  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: 'No valid fields provided for update.' });
  }
  
  // Explicitly disallow role or password updates via this route
  if (req.body.role || req.body.password) {
      return res.status(400).json({ message: 'Role and password cannot be updated via this route.' });
  }


  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      // This case should ideally not be reached if token is valid and user exists
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    if (error.code === 11000) { // Mongoose duplicate key error
      let field = 'unknown';
      if (error.keyValue.email) field = 'Email';
      if (error.keyValue.username) field = 'Username';
      return res.status(400).json({ message: `Error: ${field} already exists.` });
    }
    if (error.name === 'ValidationError') { // Mongoose validation error
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error updating profile.' });
  }
});

// PUT /api/users/me/password - Update current logged-in user's password
// @desc   Update user's own password
// @access Private
router.put('/me/password', authMiddleware, async (req, res) => {
  const userId = req.user.id; // From authMiddleware
  const { currentPassword, newPassword } = req.body;

  // Input Validation
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide current and new passwords.' });
  }

  if (newPassword.length < 6) { // Or use your defined password policy length
    return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
  }

  try {
    // Fetch User (including password field for comparison)
    const user = await User.findById(userId);
    if (!user) {
      // This case should ideally not be reached if token is valid
      return res.status(404).json({ message: 'User not found.' });
    }

    // Verify Current Password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    // Hash and Update New Password
    // The pre-save hook in User.js will handle the actual hashing
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully.' });

  } catch (error) {
    console.error('Error updating password:', error.message);
    // Mongoose validation errors (e.g., if password length is also in schema and pre-save hook fails)
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while updating password.' });
  }
});

module.exports = router;
