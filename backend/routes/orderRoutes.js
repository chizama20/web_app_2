/**
 * Order routes
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');
const { requireContractor } = require('../middleware/authorization');

// GET /api/orders - Get all orders
router.get('/', authenticateToken, orderController.getAllOrders);

// GET /api/orders/:id - Get order by ID
router.get('/:id', authenticateToken, orderController.getOrder);

// PUT /api/orders/:id/complete - Mark order as completed
router.put(
  '/:id/complete',
  authenticateToken,
  requireContractor,
  orderController.completeOrder
);

module.exports = router;

