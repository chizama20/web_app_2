/**
 * Order service
 * Handles order business logic
 */

const Order = require('../models/Order');
const Bill = require('../models/Bill');
const { ValidationError } = require('../utils/errors');

/**
 * Get order by ID
 * @param {number} orderId - Order ID
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<Object>} Order object
 */
const getOrder = async (orderId, userId, role) => {
  return await Order.findById(orderId, userId, role);
};

/**
 * Get all orders
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<Array>} Array of orders
 */
const getAllOrders = async (userId, role) => {
  return await Order.findAll(userId, role);
};

/**
 * Mark order as completed and create bill
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Created bill
 */
const completeOrder = async (orderId) => {
  // Get order to check status
  const order = await Order.findById(orderId, null, 'contractor');

  if (order.status === 'completed') {
    throw new ValidationError('Order already completed');
  }

  // Mark order as completed
  await Order.markAsCompleted(orderId);

  // Create bill
  const bill = await Bill.create({
    order_id: orderId,
    client_id: order.client_id,
    amount: order.final_price
  });

  return bill;
};

module.exports = {
  getOrder,
  getAllOrders,
  completeOrder
};

