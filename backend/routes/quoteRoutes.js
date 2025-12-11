/**
 * Quote routes
 */

const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const { authenticateToken } = require('../middleware/auth');
const { requireContractor, requireClient } = require('../middleware/authorization');

// POST /api/quotes - Create quote or rejection
router.post('/', authenticateToken, requireContractor, quoteController.createQuote);

// GET /api/quotes/:id - Get quote by ID
router.get('/:id', authenticateToken, quoteController.getQuote);

// POST /api/quotes/:id/responses - Respond to quote
router.post(
  '/:id/responses',
  authenticateToken,
  requireClient,
  quoteController.respondToQuote
);

module.exports = router;

