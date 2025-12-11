/**
 * Analytics controller for contractor dashboard
 * Handles analytics queries for Anna's dashboard
 */

const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get frequent clients (most completed service orders)
 * GET /api/analytics/frequent-clients
 */
const getFrequentClients = asyncHandler(async (req, res) => {
  const sql = `
    SELECT u.id, u.firstName, u.lastName, u.email, COUNT(so.id) as completed_orders
    FROM users u
    INNER JOIN service_orders so ON u.id = so.client_id
    WHERE so.status = 'completed'
    GROUP BY u.id, u.firstName, u.lastName, u.email
    ORDER BY completed_orders DESC
    LIMIT 10
  `;

  const results = await db.query(sql);
  res.json(results);
});

/**
 * Get uncommitted clients (3+ requests but never completed an order)
 * GET /api/analytics/uncommitted-clients
 */
const getUncommittedClients = asyncHandler(async (req, res) => {
  const sql = `
    SELECT u.id, u.firstName, u.lastName, u.email, COUNT(sr.id) as total_requests
    FROM users u
    INNER JOIN service_requests sr ON u.id = sr.client_id
    LEFT JOIN service_orders so ON u.id = so.client_id AND so.status = 'completed'
    WHERE so.id IS NULL
    GROUP BY u.id, u.firstName, u.lastName, u.email
    HAVING total_requests >= 3
    ORDER BY total_requests DESC
  `;

  const results = await db.query(sql);
  res.json(results);
});

/**
 * Get this month's accepted quotes
 * GET /api/analytics/monthly-quotes?month=2024-12
 */
const getMonthlyQuotes = asyncHandler(async (req, res) => {
  const { month } = req.query; // Format: YYYY-MM
  const monthFilter = month || new Date().toISOString().slice(0, 7);

  const sql = `
    SELECT q.*, sr.service_address, sr.cleaning_type,
           u.firstName, u.lastName, u.email
    FROM quotes q
    INNER JOIN service_requests sr ON q.request_id = sr.id
    INNER JOIN users u ON sr.client_id = u.id
    WHERE q.status = 'accepted'
    AND DATE_FORMAT(q.created_at, '%Y-%m') = ?
    ORDER BY q.created_at DESC
  `;

  const results = await db.query(sql, [monthFilter]);
  res.json(results);
});

/**
 * Get prospective clients (registered but never submitted request)
 * GET /api/analytics/prospective-clients
 */
const getProspectiveClients = asyncHandler(async (req, res) => {
  const sql = `
    SELECT u.id, u.firstName, u.lastName, u.email, u.created_at
    FROM users u
    LEFT JOIN service_requests sr ON u.id = sr.client_id
    WHERE u.role = 'client' AND sr.id IS NULL
    ORDER BY u.created_at DESC
  `;

  const results = await db.query(sql);
  res.json(results);
});

/**
 * Get largest completed jobs by number of rooms
 * GET /api/analytics/largest-jobs
 */
const getLargestJobs = asyncHandler(async (req, res) => {
  const sql = `
    SELECT sr.id, sr.service_address, sr.cleaning_type, sr.num_rooms,
           u.firstName, u.lastName, so.completed_at, so.final_price
    FROM service_requests sr
    INNER JOIN service_orders so ON sr.id = so.request_id
    INNER JOIN users u ON sr.client_id = u.id
    WHERE so.status = 'completed'
    ORDER BY sr.num_rooms DESC, so.final_price DESC
    LIMIT 10
  `;

  const results = await db.query(sql);
  res.json(results);
});

/**
 * Get overdue bills (unpaid bills older than one week)
 * GET /api/analytics/overdue-bills
 */
const getOverdueBills = asyncHandler(async (req, res) => {
  const sql = `
    SELECT b.id, b.amount, b.created_at,
           u.firstName, u.lastName, u.email,
           so.id as order_id, sr.service_address
    FROM bills b
    INNER JOIN service_orders so ON b.order_id = so.id
    INNER JOIN service_requests sr ON so.request_id = sr.id
    INNER JOIN users u ON b.client_id = u.id
    WHERE b.status != 'paid'
    AND b.created_at < DATE_SUB(NOW(), INTERVAL 1 WEEK)
    ORDER BY b.created_at ASC
  `;

  const results = await db.query(sql);
  res.json(results);
});

/**
 * Get bad clients (never paid any overdue bill)
 * GET /api/analytics/bad-clients
 */
const getBadClients = asyncHandler(async (req, res) => {
  const sql = `
    SELECT u.id, u.firstName, u.lastName, u.email,
           COUNT(b.id) as overdue_bills,
           SUM(b.amount) as total_overdue_amount
    FROM users u
    INNER JOIN bills b ON u.id = b.client_id
    WHERE b.status != 'paid'
    AND b.created_at < DATE_SUB(NOW(), INTERVAL 1 WEEK)
    GROUP BY u.id, u.firstName, u.lastName, u.email
    HAVING overdue_bills > 0
    ORDER BY total_overdue_amount DESC
  `;

  const results = await db.query(sql);
  res.json(results);
});

/**
 * Get good clients (always paid bills within 24 hours)
 * GET /api/analytics/good-clients
 */
const getGoodClients = asyncHandler(async (req, res) => {
  const sql = `
    SELECT u.id, u.firstName, u.lastName, u.email,
           COUNT(b.id) as total_bills,
           AVG(TIMESTAMPDIFF(HOUR, b.created_at, b.paid_at)) as avg_payment_hours
    FROM users u
    INNER JOIN bills b ON u.id = b.client_id
    WHERE b.status = 'paid'
    AND b.paid_at IS NOT NULL
    AND TIMESTAMPDIFF(HOUR, b.created_at, b.paid_at) <= 24
    GROUP BY u.id, u.firstName, u.lastName, u.email
    HAVING total_bills > 0
    AND NOT EXISTS (
      SELECT 1 FROM bills b2
      WHERE b2.client_id = u.id
      AND (b2.status != 'paid' OR TIMESTAMPDIFF(HOUR, b2.created_at, COALESCE(b2.paid_at, NOW())) > 24)
    )
    ORDER BY avg_payment_hours ASC
  `;

  const results = await db.query(sql);
  res.json(results);
});

module.exports = {
  getFrequentClients,
  getUncommittedClients,
  getMonthlyQuotes,
  getProspectiveClients,
  getLargestJobs,
  getOverdueBills,
  getBadClients,
  getGoodClients
};