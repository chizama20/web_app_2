/**
 * Bill service
 * Handles bill business logic
 */

const Bill = require('../models/Bill');
const { ValidationError, ForbiddenError } = require('../utils/errors');

/**
 * Get bill by ID
 * @param {number} billId - Bill ID
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<Object>} Bill object
 */
const getBill = async (billId, userId, role) => {
  return await Bill.findById(billId, userId, role);
};

/**
 * Get all bills
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<Array>} Array of bills
 */
const getAllBills = async (userId, role) => {
  return await Bill.findAll(userId, role);
};

/**
 * Respond to bill (pay, dispute, or revise)
 * @param {number} billId - Bill ID
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @param {Object} responseData - Response data
 * @returns {Promise<Object>} Response object
 */
const respondToBill = async (billId, userId, role, responseData) => {
  const { response_type, dispute_note, revised_amount, revision_note } = responseData;

  // Validate role-based actions
  if (role === 'client' && response_type === 'revise') {
    throw new ForbiddenError('Only contractor can revise bills');
  }

  if (role === 'contractor' && (response_type === 'pay' || response_type === 'dispute')) {
    throw new ForbiddenError('Only clients can pay or dispute bills');
  }

  // Get bill (this also checks access)
  const bill = await Bill.findById(billId, userId, role);

  // Validate bill status
  if (bill.status === 'paid' && response_type !== 'revise') {
    throw new ValidationError('Bill already paid');
  }

  // Validate required fields based on response type
  if (response_type === 'revise' && !revised_amount) {
    throw new ValidationError('Revised amount is required');
  }

  if (response_type === 'dispute' && !dispute_note) {
    throw new ValidationError('Dispute note is required');
  }

  // Create response
  await Bill.createResponse({
    bill_id: billId,
    responder_id: userId,
    response_type,
    dispute_note,
    revised_amount,
    revision_note
  });

  // Update bill based on response
  if (response_type === 'pay') {
    await Bill.updateStatus(billId, 'paid');
  } else if (response_type === 'dispute') {
    await Bill.updateStatus(billId, 'disputed');
  } else if (response_type === 'revise') {
    await Bill.updateAmount(billId, revised_amount);
  }

  return { success: true };
};

module.exports = {
  getBill,
  getAllBills,
  respondToBill
};

