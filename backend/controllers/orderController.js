/**
 * Order controller
 * Handles order-related HTTP requests
 */

const orderService = require('../services/orderService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all orders
 * GET /api/orders
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  const orders = await orderService.getAllOrders(userId, role);

  res.json(orders);
});

/**
 * Get order by ID
 * GET /api/orders/:id
 */
const getOrder = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id);
  const userId = req.user.userId;
  const role = req.user.role;

  const order = await orderService.getOrder(orderId, userId, role);

  res.json(order);
});

/**
 * Mark order as completed
 * PUT /api/orders/:id/complete
 */
const completeOrder = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id);

  const bill = await orderService.completeOrder(orderId);

  res.json({
    message: 'Order completed and bill created',
    billId: bill.id
  });
});

module.exports = {
  getAllOrders,
  getOrder,
  completeOrder
};

