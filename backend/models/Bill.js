/**
 * Bill model/repository
 * Handles all database operations for bills
 */

const db = require('../config/database');
const { NotFoundError } = require('../utils/errors');

/**
 * Create a new bill
 * @param {Object} billData - Bill data
 * @returns {Promise<Object>} Created bill
 */
const create = async (billData) => {
  const { order_id, client_id, amount } = billData;

  const sql = `INSERT INTO bills (order_id, client_id, amount, status) 
               VALUES (?, ?, ?, 'pending')`;

  const result = await db.query(sql, [order_id, client_id, amount]);
  return {
    id: result.insertId,
    status: 'pending'
  };
};

/**
 * Find bill by ID with response history
 * @param {number} billId - Bill ID
 * @param {number} userId - User ID (for access control)
 * @param {string} role - User role
 * @returns {Promise<Object>} Bill with responses
 */
const findById = async (billId, userId, role) => {
  let sql, params;

  if (role === 'contractor') {
    sql = `SELECT b.*, o.final_price, sr.service_address, u.firstName, u.lastName, u.email
           FROM bills b
           JOIN service_orders o ON b.order_id = o.id
           JOIN service_requests sr ON o.request_id = sr.id
           JOIN users u ON b.client_id = u.id
           WHERE b.id = ?`;
    params = [billId];
  } else {
    sql = `SELECT b.*, o.final_price, sr.service_address
           FROM bills b
           JOIN service_orders o ON b.order_id = o.id
           JOIN service_requests sr ON o.request_id = sr.id
           WHERE b.id = ? AND b.client_id = ?`;
    params = [billId, userId];
  }

  const results = await db.query(sql, params);

  if (results.length === 0) {
    throw new NotFoundError('Bill');
  }

  const bill = results[0];

  // Get response history
  const responses = await db.query(`SELECT br.*, u.firstName, u.lastName, u.role 
    FROM bill_responses br
    JOIN users u ON br.responder_id = u.id
    WHERE br.bill_id = ?
    ORDER BY br.created_at ASC`, [billId]);

  bill.responses = responses;
  return bill;
};

/**
 * Find all bills for a user or all bills for contractor
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<Array>} Array of bills
 */
const findAll = async (userId, role) => {
  let sql, params;

  if (role === 'contractor') {
    sql = `SELECT b.*, o.final_price, sr.service_address, u.firstName, u.lastName, u.email
           FROM bills b
           JOIN service_orders o ON b.order_id = o.id
           JOIN service_requests sr ON o.request_id = sr.id
           JOIN users u ON b.client_id = u.id
           ORDER BY b.created_at DESC`;
    params = [];
  } else {
    sql = `SELECT b.*, o.final_price, sr.service_address
           FROM bills b
           JOIN service_orders o ON b.order_id = o.id
           JOIN service_requests sr ON o.request_id = sr.id
           WHERE b.client_id = ?
           ORDER BY b.created_at DESC`;
    params = [userId];
  }

  return await db.query(sql, params);
};

/**
 * Update bill status
 * @param {number} billId - Bill ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
const updateStatus = async (billId, status) => {
  if (status === 'paid') {
    const sql = 'UPDATE bills SET status = ?, paid_at = NOW() WHERE id = ?';
    await db.query(sql, [status, billId]);
  } else {
    const sql = 'UPDATE bills SET status = ? WHERE id = ?';
    await db.query(sql, [status, billId]);
  }
};

/**
 * Update bill amount
 * @param {number} billId - Bill ID
 * @param {number} amount - New amount
 * @returns {Promise<void>}
 */
const updateAmount = async (billId, amount) => {
  const sql = 'UPDATE bills SET amount = ?, status = ? WHERE id = ?';
  await db.query(sql, [amount, 'pending', billId]);
};

/**
 * Create bill response
 * @param {Object} responseData - Response data
 * @returns {Promise<Object>} Created response
 */
const createResponse = async (responseData) => {
  const { bill_id, responder_id, response_type, dispute_note, revised_amount, revision_note } = responseData;

  let sql, params;

  if (response_type === 'revise') {
    sql = `INSERT INTO bill_responses (bill_id, responder_id, response_type, revised_amount, revision_note) 
           VALUES (?, ?, ?, ?, ?)`;
    params = [bill_id, responder_id, response_type, revised_amount, revision_note || null];
  } else if (response_type === 'dispute') {
    sql = `INSERT INTO bill_responses (bill_id, responder_id, response_type, dispute_note) 
           VALUES (?, ?, ?, ?)`;
    params = [bill_id, responder_id, response_type, dispute_note];
  } else {
    sql = `INSERT INTO bill_responses (bill_id, responder_id, response_type) 
           VALUES (?, ?, ?)`;
    params = [bill_id, responder_id, response_type];
  }

  const result = await db.query(sql, params);
  return { id: result.insertId };
};

module.exports = {
  create,
  findById,
  findAll,
  updateStatus,
  updateAmount,
  createResponse
};

