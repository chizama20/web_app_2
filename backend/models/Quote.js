/**
 * Quote model/repository
 * Handles all database operations for quotes
 */

const db = require('../config/database');
const { NotFoundError } = require('../utils/errors');

/**
 * Create a new quote
 * @param {Object} quoteData - Quote data
 * @returns {Promise<Object>} Created quote
 */
const create = async (quoteData) => {
  const {
    request_id,
    contractor_id,
    adjusted_price,
    scheduled_date,
    scheduled_time_start,
    scheduled_time_end,
    notes,
    is_rejection,
    rejection_reason
  } = quoteData;

  if (is_rejection) {
    const sql = `INSERT INTO quotes 
      (request_id, contractor_id, adjusted_price, scheduled_date, scheduled_time_start, scheduled_time_end, notes, status, is_rejection, rejection_reason) 
      VALUES (?, ?, 0, CURDATE(), '00:00:00', '00:00:00', ?, 'rejected', TRUE, ?)`;
    
    const result = await db.query(sql, [request_id, contractor_id, notes || null, rejection_reason]);
    return { id: result.insertId, status: 'rejected' };
  } else {
    const sql = `INSERT INTO quotes 
      (request_id, contractor_id, adjusted_price, scheduled_date, scheduled_time_start, scheduled_time_end, notes, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`;
    
    const result = await db.query(sql, [
      request_id,
      contractor_id,
      adjusted_price,
      scheduled_date,
      scheduled_time_start,
      scheduled_time_end,
      notes || null
    ]);
    return { id: result.insertId, status: 'pending' };
  }
};

/**
 * Find quote by ID with response history
 * @param {number} quoteId - Quote ID
 * @returns {Promise<Object>} Quote with responses
 */
const findById = async (quoteId) => {
  const sql = `SELECT q.*, sr.client_id, sr.service_address, sr.cleaning_type, sr.proposed_budget
               FROM quotes q
               JOIN service_requests sr ON q.request_id = sr.id
               WHERE q.id = ?`;

  const results = await db.query(sql, [quoteId]);

  if (results.length === 0) {
    throw new NotFoundError('Quote');
  }

  const quote = results[0];

  // Get response history
  const responses = await db.query(`SELECT qr.*, u.firstName, u.lastName, u.role 
    FROM quote_responses qr
    JOIN users u ON qr.responder_id = u.id
    WHERE qr.quote_id = ?
    ORDER BY qr.created_at ASC`, [quoteId]);

  quote.responses = responses;
  return quote;
};

/**
 * Find all quotes for a request
 * @param {number} requestId - Request ID
 * @param {number} userId - User ID (for access control)
 * @param {string} role - User role
 * @returns {Promise<Array>} Array of quotes with responses
 */
const findByRequestId = async (requestId, userId, role) => {
  let sql = `SELECT q.* FROM quotes q JOIN service_requests sr ON q.request_id = sr.id WHERE sr.id = ?`;
  let params = [requestId];

  if (role === 'client') {
    sql += ' AND sr.client_id = ?';
    params.push(userId);
  }

  sql += ' ORDER BY q.created_at DESC';

  const quotes = await db.query(sql, params);

  if (quotes.length === 0) {
    return [];
  }

  // Get responses for all quotes
  const quoteIds = quotes.map(q => q.id);
  const responses = await db.query(`SELECT qr.*, u.firstName, u.lastName, u.role 
    FROM quote_responses qr
    JOIN users u ON qr.responder_id = u.id
    WHERE qr.quote_id IN (?)
    ORDER BY qr.created_at ASC`, [quoteIds]);

  // Attach responses to quotes
  quotes.forEach(quote => {
    quote.responses = responses.filter(r => r.quote_id === quote.id);
  });

  return quotes;
};

/**
 * Update quote status
 * @param {number} quoteId - Quote ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
const updateStatus = async (quoteId, status) => {
  const sql = 'UPDATE quotes SET status = ? WHERE id = ?';
  await db.query(sql, [status, quoteId]);
};

/**
 * Create quote response
 * @param {Object} responseData - Response data
 * @returns {Promise<Object>} Created response
 */
const createResponse = async (responseData) => {
  const { quote_id, responder_id, response_type, counter_note } = responseData;

  const sql = `INSERT INTO quote_responses (quote_id, responder_id, response_type, counter_note) 
               VALUES (?, ?, ?, ?)`;

  const result = await db.query(sql, [quote_id, responder_id, response_type, counter_note || null]);
  return { id: result.insertId };
};

/**
 * Check if quote belongs to user's request
 * @param {number} quoteId - Quote ID
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} True if belongs to user
 */
const belongsToUser = async (quoteId, userId) => {
  const sql = `SELECT q.id FROM quotes q
               JOIN service_requests sr ON q.request_id = sr.id
               WHERE q.id = ? AND sr.client_id = ?`;
  const results = await db.query(sql, [quoteId, userId]);
  return results.length > 0;
};

module.exports = {
  create,
  findById,
  findByRequestId,
  updateStatus,
  createResponse,
  belongsToUser
};

