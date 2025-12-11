/**
 * User routes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// GET /profile - Get user profile
router.get('/profile', authenticateToken, userController.getProfile);

module.exports = router;

