/**
 * Bill routes
 */

const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/bills - Get all bills
router.get('/', authenticateToken, billController.getAllBills);

// GET /api/bills/:id - Get bill by ID
router.get('/:id', authenticateToken, billController.getBill);

// POST /api/bills/:id/responses - Respond to bill
router.post('/:id/responses', authenticateToken, billController.respondToBill);

module.exports = router;

