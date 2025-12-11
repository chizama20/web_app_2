/**
 * Bill controller
 * Handles bill-related HTTP requests
 */

const billService = require('../services/billService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all bills
 * GET /api/bills
 */
const getAllBills = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  const bills = await billService.getAllBills(userId, role);

  res.json(bills);
});

/**
 * Get bill by ID
 * GET /api/bills/:id
 */
const getBill = asyncHandler(async (req, res) => {
  const billId = parseInt(req.params.id);
  const userId = req.user.userId;
  const role = req.user.role;

  const bill = await billService.getBill(billId, userId, role);

  res.json(bill);
});

/**
 * Respond to bill
 * POST /api/bills/:id/responses
 */
const respondToBill = asyncHandler(async (req, res) => {
  const billId = parseInt(req.params.id);
  const userId = req.user.userId;
  const role = req.user.role;
  const responseData = req.body;

  await billService.respondToBill(billId, userId, role, responseData);

  res.status(201).json({
    message: 'Response saved successfully',
    responseId: 'generated'
  });
});

module.exports = {
  getAllBills,
  getBill,
  respondToBill
};

