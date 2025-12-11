/**
 * Authentication routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validation');

// POST /register - Register new user
router.post('/register', validateRegistration, authController.register);

// POST /login - Login user
router.post('/login', authController.login);

module.exports = router;

