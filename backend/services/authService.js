/**
 * Authentication service
 * Handles authentication business logic
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');
const { encrypt } = require('../utils/encryption');
const { UnauthorizedError, ValidationError } = require('../utils/errors');
const User = require('../models/User');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User object with clientId
 */
const register = async (userData) => {
  const {
    firstName,
    lastName,
    address,
    email,
    number,
    password,
    cardNumber,
    cardName,
    expMonth,
    expYear,
    cvv
  } = userData;

  // Check if email already exists
  if (await User.emailExists(email)) {
    throw new ValidationError('Email already registered');
  }

  // Check if phone already exists
  if (await User.phoneExists(number)) {
    throw new ValidationError('Phone number already registered');
  }

  // Generate unique client ID
  const clientId = uuidv4();

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Encrypt credit card data
  const encryptedCardNumber = encrypt(cardNumber);
  const encryptedCVV = encrypt(cvv);

  // Create user
  const user = await User.create({
    clientId,
    firstName,
    lastName,
    address,
    email,
    number,
    password: hashedPassword,
    cardNumber: encryptedCardNumber,
    cardName,
    expMonth,
    expYear,
    cvv: encryptedCVV
  });

  return {
    clientId: user.clientId,
    id: user.id
  };
};

/**
 * Login user
 * @param {string} identifier - Email or phone number
 * @param {string} password - User password
 * @returns {Promise<Object>} Token and user info
 */
const login = async (identifier, password) => {
  // Find user by email or phone
  const user = await User.findByEmailOrPhone(identifier);

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate JWT token
  const userRole = user.role || 'client';
  const token = jwt.sign(
    { userId: user.id, role: userRole },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    role: userRole,
    userId: user.id,
    user: {
      id: user.id,
      role: userRole
    }
  };
};

module.exports = {
  register,
  login
};

