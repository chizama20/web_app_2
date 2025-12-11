/**
 * Quote controller
 * Handles quote-related HTTP requests
 */

const quoteService = require('../services/quoteService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Create a quote or rejection
 * POST /api/quotes
 */
const createQuote = asyncHandler(async (req, res) => {
  const quoteData = req.body;

  const result = await quoteService.createQuote(quoteData, req.user.userId);

  res.status(201).json({
    message: quoteData.is_rejection ? 'Request rejected' : 'Quote created successfully',
    quoteId: result.id
  });
});

/**
 * Get quote by ID
 * GET /api/quotes/:id
 */
const getQuote = asyncHandler(async (req, res) => {
  const quoteId = parseInt(req.params.id);
  const quote = await quoteService.getQuote(quoteId);

  // Check access permission for clients
  if (req.user.role === 'client' && quote.client_id !== req.user.userId) {
    return res.status(403).json({
      message: 'Access denied'
    });
  }

  res.json(quote);
});

/**
 * Respond to quote
 * POST /api/quotes/:id/responses
 */
const respondToQuote = asyncHandler(async (req, res) => {
  const quoteId = parseInt(req.params.id);
  const { response_type, counter_note } = req.body;

  await quoteService.respondToQuote(
    quoteId,
    req.user.userId,
    response_type,
    counter_note
  );

  res.status(201).json({
    message: 'Response saved successfully',
    responseId: 'generated'
  });
});

/**
 * Get all quotes for a request
 * GET /api/service-requests/:requestId/quotes
 */
const getQuotesByRequest = asyncHandler(async (req, res) => {
  const requestId = parseInt(req.params.requestId);
  const userId = req.user.userId;
  const role = req.user.role;

  const quotes = await quoteService.getQuotesByRequest(requestId, userId, role);

  res.json(quotes);
});

module.exports = {
  createQuote,
  getQuote,
  respondToQuote,
  getQuotesByRequest
};

