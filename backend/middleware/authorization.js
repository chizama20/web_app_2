/**
 * Authorization middleware for role-based access control
 */

const { ForbiddenError } = require('../utils/errors');
const { ROLES } = require('../config/constants');

/**
 * Require contractor role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireContractor = (req, res, next) => {
  if (req.user.role !== ROLES.CONTRACTOR) {
    return next(new ForbiddenError('Access denied. Contractor role required.'));
  }
  next();
};

/**
 * Require client role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireClient = (req, res, next) => {
  if (req.user.role !== ROLES.CLIENT) {
    return next(new ForbiddenError('Access denied. Client role required.'));
  }
  next();
};

module.exports = {
  requireContractor,
  requireClient
};

