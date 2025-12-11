/**
 * Service Request controller
 * Handles service request-related HTTP requests
 */

const serviceRequestService = require('../services/serviceRequestService');
const { asyncHandler } = require('../middleware/errorHandler');
const fs = require('fs');

/**
 * Create a new service request
 * POST /api/service-requests
 */
const createServiceRequest = asyncHandler(async (req, res) => {
  const requestData = req.body;
  const clientId = req.user.userId;

  const result = await serviceRequestService.createServiceRequest(requestData, clientId);

  res.status(201).json({
    message: 'Service request created successfully',
    requestId: result.id
  });
});

/**
 * Upload photos for service request
 * POST /api/service-requests/:id/photos
 */
const uploadPhotos = asyncHandler(async (req, res) => {
  const requestId = parseInt(req.params.id);
  const clientId = req.user.userId;
  const files = req.files || [];

  const photoPaths = await serviceRequestService.uploadPhotos(requestId, clientId, files);

  res.status(201).json({
    message: 'Photos uploaded successfully',
    photos: photoPaths
  });
});

/**
 * Get all service requests
 * GET /api/service-requests
 */
const getAllServiceRequests = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  const requests = await serviceRequestService.getAllServiceRequests(userId, role);

  res.json(requests);
});

/**
 * Get service request by ID
 * GET /api/service-requests/:id
 */
const getServiceRequest = asyncHandler(async (req, res) => {
  const requestId = parseInt(req.params.id);
  const userId = req.user.userId;
  const role = req.user.role;

  const request = await serviceRequestService.getServiceRequest(requestId, userId, role);

  res.json(request);
});

module.exports = {
  createServiceRequest,
  uploadPhotos,
  getAllServiceRequests,
  getServiceRequest
};

