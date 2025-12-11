/**
 * Service Request model/repository
 * Handles all database operations for service requests
 */

const db = require('../config/database');
const { NotFoundError } = require('../utils/errors');

/**
 * Create a new service request
 * @param {Object} requestData - Service request data
 * @returns {Promise<Object>} Created service request
 */
const create = async (requestData) => {
  const {
    client_id,
    service_address,
    cleaning_type,
    num_rooms,
    preferred_date,
    preferred_time,
    proposed_budget,
    notes
  } = requestData;

  const sql = `INSERT INTO service_requests 
    (client_id, service_address, cleaning_type, num_rooms, preferred_date, preferred_time, proposed_budget, notes, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`;

  const result = await db.query(sql, [
    client_id,
    service_address,
    cleaning_type,
    num_rooms,
    preferred_date,
    preferred_time,
    proposed_budget,
    notes || null
  ]);

  return {
    id: result.insertId,
    client_id,
    service_address,
    cleaning_type,
    status: 'pending'
  };
};

/**
 * Find service request by ID
 * @param {number} requestId - Request ID
 * @param {number} userId - Optional user ID for access control
 * @param {string} role - User role
 * @returns {Promise<Object>} Service request with photos
 */
const findById = async (requestId, userId = null, role = null) => {
  let sql, params;

  if (role === 'contractor') {
    sql = `SELECT sr.*, u.firstName, u.lastName, u.email, u.number as phone, u.address
           FROM service_requests sr
           JOIN users u ON sr.client_id = u.id
           WHERE sr.id = ?`;
    params = [requestId];
  } else {
    sql = 'SELECT * FROM service_requests WHERE id = ? AND client_id = ?';
    params = [requestId, userId];
  }

  const results = await db.query(sql, params);

  if (results.length === 0) {
    throw new NotFoundError('Service request');
  }

  const request = results[0];

  // Get photos
  const photos = await db.query('SELECT * FROM service_request_photos WHERE request_id = ?', [requestId]);
  request.photos = photos;

  return request;
};

/**
 * Find all service requests for a user or all requests for contractor
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<Array>} Array of service requests
 */
const findAll = async (userId, role) => {
  let sql, params;

  if (role === 'contractor') {
    sql = `SELECT sr.*, u.firstName, u.lastName, u.email, u.number as phone
           FROM service_requests sr
           JOIN users u ON sr.client_id = u.id
           ORDER BY sr.created_at DESC`;
    params = [];
  } else {
    sql = `SELECT sr.*, 
           (SELECT COUNT(*) FROM service_request_photos WHERE request_id = sr.id) as photo_count
           FROM service_requests sr
           WHERE sr.client_id = ?
           ORDER BY sr.created_at DESC`;
    params = [userId];
  }

  return await db.query(sql, params);
};

/**
 * Update service request status
 * @param {number} requestId - Request ID
 * @param {string} status - New status
 * @returns {Promise<void>}
 */
const updateStatus = async (requestId, status) => {
  const sql = 'UPDATE service_requests SET status = ? WHERE id = ?';
  await db.query(sql, [status, requestId]);
};

/**
 * Check if request belongs to client
 * @param {number} requestId - Request ID
 * @param {number} clientId - Client ID
 * @returns {Promise<boolean>} True if belongs to client
 */
const belongsToClient = async (requestId, clientId) => {
  const sql = 'SELECT id FROM service_requests WHERE id = ? AND client_id = ?';
  const results = await db.query(sql, [requestId, clientId]);
  return results.length > 0;
};

/**
 * Add photos to service request
 * @param {number} requestId - Request ID
 * @param {Array<string>} photoPaths - Array of photo paths
 * @returns {Promise<void>}
 */
const addPhotos = async (requestId, photoPaths) => {
  if (photoPaths.length === 0) return;

  const values = photoPaths.map(photoPath => [requestId, photoPath]);
  const sql = 'INSERT INTO service_request_photos (request_id, photo_path) VALUES ?';
  await db.query(sql, [values]);
};

/**
 * Get photo count for request
 * @param {number} requestId - Request ID
 * @returns {Promise<number>} Photo count
 */
const getPhotoCount = async (requestId) => {
  const sql = 'SELECT COUNT(*) as count FROM service_request_photos WHERE request_id = ?';
  const results = await db.query(sql, [requestId]);
  return results[0].count;
};

module.exports = {
  create,
  findById,
  findAll,
  updateStatus,
  belongsToClient,
  addPhotos,
  getPhotoCount
};

