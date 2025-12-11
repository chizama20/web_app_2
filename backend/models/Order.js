/**
 * Order model/repository
 * Handles all database operations for service orders
 */

const db = require('../config/database');
const { NotFoundError } = require('../utils/errors');

/**
 * Create a new service order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Created order
 */
const create = async (orderData) => {
  const {
    request_id,
    quote_id,
    client_id,
    scheduled_date,
    scheduled_time_start,
    scheduled_time_end,
    final_price
  } = orderData;

  const sql = `INSERT INTO service_orders 
    (request_id, quote_id, client_id, scheduled_date, scheduled_time_start, scheduled_time_end, final_price, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`;

  const result = await db.query(sql, [
    request_id,
    quote_id,
    client_id,
    scheduled_date,
    scheduled_time_start,
    scheduled_time_end,
    final_price
  ]);

  return {
    id: result.insertId,
    status: 'scheduled'
  };
};

/**
 * Find order by ID
 * @param {number} orderId - Order ID
 * @param {number} userId - User ID (for access control)
 * @param {string} role - User role
 * @returns {Promise<Object>} Order object
 */
const findById = async (orderId, userId, role) => {
  let sql, params;

  if (role === 'contractor') {
    sql = `SELECT o.*, sr.service_address, sr.cleaning_type, sr.notes as request_notes, 
           u.firstName, u.lastName, u.email, u.number as phone, u.address
           FROM service_orders o
           JOIN service_requests sr ON o.request_id = sr.id
           JOIN users u ON o.client_id = u.id
           WHERE o.id = ?`;
    params = [orderId];
  } else {
    sql = `SELECT o.*, sr.service_address, sr.cleaning_type, sr.notes as request_notes
           FROM service_orders o
           JOIN service_requests sr ON o.request_id = sr.id
           WHERE o.id = ? AND o.client_id = ?`;
    params = [orderId, userId];
  }

  const results = await db.query(sql, params);

  if (results.length === 0) {
    throw new NotFoundError('Order');
  }

  return results[0];
};

/**
 * Find all orders for a user or all orders for contractor
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<Array>} Array of orders
 */
const findAll = async (userId, role) => {
  let sql, params;

  if (role === 'contractor') {
    sql = `SELECT o.*, sr.service_address, sr.cleaning_type, u.firstName, u.lastName, u.email, u.number as phone
           FROM service_orders o
           JOIN service_requests sr ON o.request_id = sr.id
           JOIN users u ON o.client_id = u.id
           ORDER BY o.created_at DESC`;
    params = [];
  } else {
    sql = `SELECT o.*, sr.service_address, sr.cleaning_type
           FROM service_orders o
           JOIN service_requests sr ON o.request_id = sr.id
           WHERE o.client_id = ?
           ORDER BY o.created_at DESC`;
    params = [userId];
  }

  return await db.query(sql, params);
};

/**
 * Update order status to completed
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Updated order
 */
const markAsCompleted = async (orderId) => {
  const sql = 'UPDATE service_orders SET status = ?, completed_at = NOW() WHERE id = ?';
  await db.query(sql, ['completed', orderId]);

  // Return the updated order
  const results = await db.query('SELECT * FROM service_orders WHERE id = ?', [orderId]);
  return results[0];
};

module.exports = {
  create,
  findById,
  findAll,
  markAsCompleted
};

