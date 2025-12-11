/**
 * Service Request routes
 */

const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
const { authenticateToken } = require('../middleware/auth');
const { requireClient } = require('../middleware/authorization');
const { validateServiceRequest } = require('../middleware/validation');
const { upload } = require('../config/multer');

// POST /api/service-requests - Create service request
router.post(
  '/',
  authenticateToken,
  requireClient,
  validateServiceRequest,
  serviceRequestController.createServiceRequest
);

// POST /api/service-requests/:id/photos - Upload photos
router.post(
  '/:id/photos',
  authenticateToken,
  requireClient,
  upload.array('photos', 5),
  serviceRequestController.uploadPhotos
);

// GET /api/service-requests - Get all service requests
router.get('/', authenticateToken, serviceRequestController.getAllServiceRequests);

// GET /api/service-requests/:id - Get service request by ID
router.get('/:id', authenticateToken, serviceRequestController.getServiceRequest);

module.exports = router;

