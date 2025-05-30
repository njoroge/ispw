const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Package = require('../models/Package');

// POST /api/subscriptions/subscribe
// @desc   Subscribe user to a package
// @access Private
router.post('/subscribe', authMiddleware, async (req, res) => {
  const { packageId } = req.body;
  const userId = req.user.id; // From authMiddleware

  // Validate packageId
  if (!packageId) {
    return res.status(400).json({ message: 'Package ID is required' });
  }

  try {
    // Check if the package exists
    const selectedPackage = await Package.findById(packageId);
    if (!selectedPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      // This should ideally not happen if the token is valid and user exists
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's subscription
    user.currentPackage = selectedPackage._id; // or packageId
    user.subscriptionDate = Date.now();

    await user.save();

    // Return success response (you might want to populate currentPackage details)
    // For simplicity, just returning relevant user fields excluding password.
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      currentPackage: user.currentPackage,
      subscriptionDate: user.subscriptionDate,
    };

    res.json({ message: 'Successfully subscribed to package', user: userResponse });

  } catch (error) {
    console.error('Subscription error:', error.message);
    if (error.kind === 'ObjectId' && error.path === '_id' && error.name === 'CastError') {
        // Handle invalid ObjectId format for packageId
        return res.status(400).json({ message: 'Invalid Package ID format' });
    }
    res.status(500).json({ message: 'Server error during subscription' });
  }
});

module.exports = router;
