/**
 * Main router that combines all routes
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const serviceRequestRoutes = require('./serviceRequestRoutes');
const quoteRoutes = require('./quoteRoutes');
const orderRoutes = require('./orderRoutes');
const billRoutes = require('./billRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const quoteController = require('../controllers/quoteController');
const { authenticateToken } = require('../middleware/auth');

// Mount routes
router.use('/', authRoutes);
router.use('/', userRoutes);
router.use('/api/service-requests', serviceRequestRoutes);
router.use('/api/quotes', quoteRoutes);
router.use('/api/orders', orderRoutes);
router.use('/api/bills', billRoutes);
router.use('/api/analytics', analyticsRoutes);

// Special route: Get quotes for a request
router.get(
  '/api/service-requests/:requestId/quotes',
  authenticateToken,
  quoteController.getQuotesByRequest
);

module.exports = router;

