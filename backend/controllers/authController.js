/**
 * Authentication controller
 * Handles authentication-related HTTP requests
 */

const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Register a new user
 * POST /register
 */
const register = asyncHandler(async (req, res) => {
  const userData = req.body;
  const result = await authService.register(userData);

  res.status(201).json({
    message: 'User registered successfully',
    clientid: result.clientId
  });
});

/**
 * Login user
 * POST /login
 */
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const result = await authService.login(identifier, password);

  res.json(result);
});

module.exports = {
  register,
  login
};

