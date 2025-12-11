/**
 * User service
 * Handles user-related business logic
 */

const User = require('../models/User');

/**
 * Get user profile
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User profile
 */
const getProfile = async (userId) => {
  return await User.findById(userId);
};

module.exports = {
  getProfile
};

