/**
 * User model/repository
 * Handles all database operations for users
 */

const db = require('../config/database');
const { NotFoundError } = require('../utils/errors');

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const create = async (userData) => {
  const {
    clientId,
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

  const sql = `INSERT INTO users 
    (clientId, firstName, lastName, address, email, number, password, cardNumber, cardName, expMonth, expYear, cvv) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const result = await db.query(sql, [
    clientId,
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
  ]);

  return {
    id: result.insertId,
    clientId,
    firstName,
    lastName,
    email
  };
};

/**
 * Find user by email or phone number
 * @param {string} identifier - Email or phone number
 * @returns {Promise<Object|null>} User object or null
 */
const findByEmailOrPhone = async (identifier) => {
  const sql = 'SELECT * FROM users WHERE email = ? OR number = ?';
  const results = await db.query(sql, [identifier, identifier]);
  return results.length > 0 ? results[0] : null;
};

/**
 * Find user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User object
 * @throws {NotFoundError} If user not found
 */
const findById = async (userId) => {
  const sql = 'SELECT id, firstName, lastName, email, number, address, role FROM users WHERE id = ?';
  const results = await db.query(sql, [userId]);
  
  if (results.length === 0) {
    throw new NotFoundError('User');
  }
  
  return results[0];
};

/**
 * Get user role by ID
 * @param {number} userId - User ID
 * @returns {Promise<string>} User role
 */
const getRoleById = async (userId) => {
  const sql = 'SELECT role FROM users WHERE id = ?';
  const results = await db.query(sql, [userId]);
  
  if (results.length === 0) {
    throw new NotFoundError('User');
  }
  
  return results[0].role || 'client';
};

/**
 * Check if email exists
 * @param {string} email - Email address
 * @returns {Promise<boolean>} True if exists
 */
const emailExists = async (email) => {
  const sql = 'SELECT id FROM users WHERE email = ?';
  const results = await db.query(sql, [email]);
  return results.length > 0;
};

/**
 * Check if phone number exists
 * @param {string} number - Phone number
 * @returns {Promise<boolean>} True if exists
 */
const phoneExists = async (number) => {
  const sql = 'SELECT id FROM users WHERE number = ?';
  const results = await db.query(sql, [number]);
  return results.length > 0;
};

module.exports = {
  create,
  findByEmailOrPhone,
  findById,
  getRoleById,
  emailExists,
  phoneExists
};

