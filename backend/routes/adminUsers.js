const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust path if User model is elsewhere
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Note: All routes in this file will be implicitly protected by authMiddleware and adminMiddleware
// if they are applied at the router level in server.js, or individually here.
// For clarity and explicitness, they are added to each route definition here.

// GET /api/admin/users - List all users
// @desc   Get all users (admin only)
// @access Private/Admin
router.get('/', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('currentPackage'); // Added populate here
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// GET /api/admin/users/:id - Get a single user by ID
// @desc   Get user by ID (admin only)
// @access Private/Admin
router.get('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('currentPackage'); // Added populate here
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error.message);
    if (error.kind === 'ObjectId') { // Handle invalid ObjectId format
      return res.status(400).json({ message: 'Invalid User ID format' });
    }
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// PUT /api/admin/users/:id - Update a user by ID
// @desc   Update user (admin only)
// @access Private/Admin
router.put('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  const { username, email, role } = req.body;
  const userIdToUpdate = req.params.id;
  const adminUserId = req.user.id;

  // Build object with fields to update
  const updateFields = {};
  if (username) updateFields.username = username;
  if (email) updateFields.email = email;
  if (role) {
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'." });
    }
    updateFields.role = role;
  }
  
  // Prevent an admin from demoting themselves if they are the only admin
  // This is a simplified check. A more robust solution might count active admins.
  if (adminUserId === userIdToUpdate && role === 'user') {
    try {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot demote the only admin account." });
      }
    } catch (error) {
        console.error("Error checking admin count:", error);
        return res.status(500).json({ message: "Server error during admin count check." });
    }
  }


  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: 'No fields provided for update.' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userIdToUpdate,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }
    if (error.code === 11000) { // Mongoose duplicate key error (e.g. username or email)
        return res.status(400).json({ message: 'Username or email already exists.' });
    }
    res.status(500).json({ message: 'Server error while updating user' });
  }
});

// DELETE /api/admin/users/:id - Delete a user by ID
// @desc   Delete user (admin only)
// @access Private/Admin
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  const userIdToDelete = req.params.id;
  const adminUserId = req.user.id;

  // Prevent admin from deleting their own account via this panel
  if (adminUserId === userIdToDelete) {
    return res.status(400).json({ message: 'Cannot delete your own account via the admin panel.' });
  }

  try {
    const user = await User.findById(userIdToDelete);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optional: Add a check here if there's a desire to prevent deletion of the "last" admin.
    // However, this can be complex (e.g. what if other admins exist but are inactive?).
    // For now, we allow deletion of any admin except oneself.
    // if (user.role === 'admin') {
    //   const adminCount = await User.countDocuments({ role: 'admin' });
    //   if (adminCount <= 1) {
    //     return res.status(400).json({ message: "Cannot delete the only remaining admin account." });
    //   }
    // }

    await User.findByIdAndDelete(userIdToDelete);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

module.exports = router;
