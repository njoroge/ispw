const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if not token
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Token should be in "Bearer TOKEN_STRING" format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token format is "Bearer <token>"' });
  }
  const token = parts[1];

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Assuming your JWT payload is like { user: { id: '...' } }
    // Adjust if your payload structure is different
    if (!decoded.user || !decoded.user.id) {
        console.error('Decoded token does not contain user.id:', decoded);
        return res.status(401).json({ message: 'Token is not valid (missing user ID)' });
    }
    req.user = decoded.user; 
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = authMiddleware;
