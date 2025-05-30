const User = require('../models/User'); // Import User model to check role from DB if needed

// This middleware assumes that authMiddleware has already run and req.user is populated.
// However, req.user from authMiddleware might only contain the user ID.
// For role checking, we might need to fetch the user from DB to ensure role is current.

async function adminMiddleware(req, res, next) {
  // req.user should be populated by authMiddleware with user's ID and potentially other details.
  // If req.user.role is not directly available from the JWT payload (e.g. if token only stores user.id),
  // we must fetch the user from the database to check their role.

  if (!req.user || !req.user.id) {
    // This should ideally be caught by authMiddleware if no user is authenticated
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Fetch the user from the database to get the most current role information
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization denied' });
    }

    if (user.role === 'admin') {
      // For convenience, attach the full user object (excluding password) to req.user
      // This ensures subsequent middleware/route handlers have access to the full user profile if needed.
      // However, be mindful of what you attach to req.user.
      // req.user = user.toObject(); // or user, depending on what's needed.
      // delete req.user.password; // Ensure password is not passed along.
      // Or, more simply, just verify role and let subsequent logic fetch user if needed.
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Server error during admin authorization' });
  }
}

module.exports = adminMiddleware;
