/**
 * Quote service
 * Handles quote business logic
 */

const Quote = require('../models/Quote');
const ServiceRequest = require('../models/ServiceRequest');
const Order = require('../models/Order');
const { ValidationError } = require('../utils/errors');

/**
 * Create a quote or rejection
 * @param {Object} quoteData - Quote data
 * @param {number} contractorId - Contractor ID
 * @returns {Promise<Object>} Created quote
 */
const createQuote = async (quoteData, contractorId) => {
  const quote = await Quote.create({
    ...quoteData,
    contractor_id: contractorId
  });

  // Update request status
  if (quoteData.is_rejection) {
    await ServiceRequest.updateStatus(quoteData.request_id, 'rejected');
  } else {
    await ServiceRequest.updateStatus(quoteData.request_id, 'quote_sent');
  }

  return quote;
};

/**
 * Get quote by ID
 * @param {number} quoteId - Quote ID
 * @returns {Promise<Object>} Quote with responses
 */
const getQuote = async (quoteId) => {
  return await Quote.findById(quoteId);
};

/**
 * Get all quotes for a request
 * @param {number} requestId - Request ID
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<Array>} Array of quotes
 */
const getQuotesByRequest = async (requestId, userId, role) => {
  return await Quote.findByRequestId(requestId, userId, role);
};

/**
 * Respond to quote (accept/renegotiate)
 * @param {number} quoteId - Quote ID
 * @param {number} userId - User ID
 * @param {string} responseType - Response type (accept/renegotiate/counter)
 * @param {string} counterNote - Optional counter note
 * @returns {Promise<Object>} Response object
 */
const respondToQuote = async (quoteId, userId, responseType, counterNote) => {
  // Verify quote belongs to user
  const belongsToUser = await Quote.belongsToUser(quoteId, userId);
  if (!belongsToUser) {
    throw new ValidationError('Quote not found or access denied');
  }

  // Get quote
  const quote = await Quote.findById(quoteId);

  // Check if quote already has final status
  if (quote.status === 'accepted' || quote.status === 'rejected') {
    throw new ValidationError('Quote already has final status');
  }

  // Create response
  await Quote.createResponse({
    quote_id: quoteId,
    responder_id: userId,
    response_type: responseType,
    counter_note: counterNote
  });

  // Handle acceptance - create order
  if (responseType === 'accept') {
    await Quote.updateStatus(quoteId, 'accepted');
    await ServiceRequest.updateStatus(quote.request_id, 'accepted');

    // Create service order
    await Order.create({
      request_id: quote.request_id,
      quote_id: quoteId,
      client_id: userId,
      scheduled_date: quote.scheduled_date,
      scheduled_time_start: quote.scheduled_time_start,
      scheduled_time_end: quote.scheduled_time_end,
      final_price: quote.adjusted_price
    });
  } else {
    // Renegotiating
    await Quote.updateStatus(quoteId, 'renegotiating');
  }

  return { success: true };
};

module.exports = {
  createQuote,
  getQuote,
  getQuotesByRequest,
  respondToQuote
};

