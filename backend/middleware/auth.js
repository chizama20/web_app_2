/**
 * Authentication middleware
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const { UnauthorizedError } = require('../utils/errors');
const db = require('../config/database');

/**
 * Authenticate JWT token and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader; // Token is passed directly, not as "Bearer <token>"

    if (!token) {
      throw new UnauthorizedError('Access denied. No token provided.');
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired token.');
    }

    // Fetch user role from database to ensure it's current
    const users = await db.query('SELECT id, role FROM users WHERE id = ?', [decoded.userId]);
    
    if (users.length === 0) {
      throw new UnauthorizedError('User not found.');
    }

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      role: users[0].role || 'client'
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticateToken
};

