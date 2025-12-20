const jwt = require('jsonwebtoken');

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Verify JWT token
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_change_this', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      clientId: decoded.clientId
    };

    next();
  });
};


module.exports = authenticateToken;