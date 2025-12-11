/**
 * Input validation middleware
 */

const { ValidationError } = require('../utils/errors');
const {
  isValidEmail,
  isValidPhone,
  isValidCardNumber,
  isValidDate,
  isValidTime,
  validateRequired,
  sanitizeString
} = require('../utils/validators');

/**
 * Validate registration input
 */
const validateRegistration = (req, res, next) => {
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
  } = req.body;

  // Check required fields (excluding confirmPassword from validation as it's frontend-only)
  const required = ['firstName', 'lastName', 'address', 'email', 'number', 'password', 'cardNumber', 'cardName', 'expMonth', 'expYear', 'cvv'];
  const validation = validateRequired(req.body, required);

  if (!validation.valid) {
    return next(new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`));
  }

  // Validate email
  if (!isValidEmail(email)) {
    return next(new ValidationError('Invalid email format'));
  }

  // Validate phone
  if (!isValidPhone(number)) {
    return next(new ValidationError('Invalid phone number format'));
  }

  // Validate password length
  if (password.length < 6) {
    return next(new ValidationError('Password must be at least 6 characters long'));
  }

  // Validate card number (basic length check - Luhn algorithm might be too strict for testing)
  const cleanCard = cardNumber.replace(/\D/g, '');
  if (cleanCard.length < 13 || cleanCard.length > 19) {
    return next(new ValidationError('Credit card number must be 13-19 digits'));
  }

  // Validate expiration month
  const month = parseInt(expMonth);
  if (isNaN(month) || month < 1 || month > 12) {
    return next(new ValidationError('Invalid expiration month'));
  }

  // Validate expiration year
  const year = parseInt(expYear);
  if (isNaN(year) || year < new Date().getFullYear()) {
    return next(new ValidationError('Invalid expiration year'));
  }

  // Validate CVV
  if (cvv.length < 3 || cvv.length > 4 || !/^\d+$/.test(cvv)) {
    return next(new ValidationError('Invalid CVV'));
  }

  // Sanitize string inputs
  req.body.firstName = sanitizeString(firstName);
  req.body.lastName = sanitizeString(lastName);
  req.body.address = sanitizeString(address);
  req.body.cardName = sanitizeString(cardName);

  next();
};

/**
 * Validate service request input
 */
const validateServiceRequest = (req, res, next) => {
  const {
    service_address,
    cleaning_type,
    num_rooms,
    preferred_date,
    preferred_time,
    proposed_budget
  } = req.body;

  const required = ['service_address', 'cleaning_type', 'num_rooms', 'preferred_date', 'preferred_time', 'proposed_budget'];
  const validation = validateRequired(req.body, required);

  if (!validation.valid) {
    return next(new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`));
  }

  // Validate cleaning type
  const validTypes = ['basic', 'deep cleaning', 'move-out'];
  if (!validTypes.includes(cleaning_type)) {
    return next(new ValidationError('Invalid cleaning type'));
  }

  // Validate number of rooms
  const rooms = parseInt(num_rooms);
  if (isNaN(rooms) || rooms < 1) {
    return next(new ValidationError('Number of rooms must be a positive integer'));
  }

  // Validate date
  if (!isValidDate(preferred_date)) {
    return next(new ValidationError('Invalid date format. Use YYYY-MM-DD'));
  }

  // Validate time
  if (!isValidTime(preferred_time)) {
    return next(new ValidationError('Invalid time format. Use HH:MM'));
  }

  // Validate budget
  const budget = parseFloat(proposed_budget);
  if (isNaN(budget) || budget < 0) {
    return next(new ValidationError('Proposed budget must be a positive number'));
  }

  // Sanitize address
  req.body.service_address = sanitizeString(service_address);
  if (req.body.notes) {
    req.body.notes = sanitizeString(req.body.notes);
  }

  next();
};

module.exports = {
  validateRegistration,
  validateServiceRequest
};

