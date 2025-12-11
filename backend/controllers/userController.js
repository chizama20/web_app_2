/**
 * User controller
 * Handles user-related HTTP requests
 */

const userService = require('../services/userService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get user profile
 * GET /profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const profile = await userService.getProfile(userId);

  res.json(profile);
});

module.exports = {
  getProfile
};

