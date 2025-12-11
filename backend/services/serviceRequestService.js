/**
 * Service Request service
 * Handles service request business logic
 */

const ServiceRequest = require('../models/ServiceRequest');
const { ValidationError } = require('../utils/errors');
const { UPLOAD } = require('../config/constants');

/**
 * Create a new service request
 * @param {Object} requestData - Service request data
 * @param {number} clientId - Client ID
 * @returns {Promise<Object>} Created service request
 */
const createServiceRequest = async (requestData, clientId) => {
  return await ServiceRequest.create({
    ...requestData,
    client_id: clientId
  });
};

/**
 * Get service request by ID
 * @param {number} requestId - Request ID
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<Object>} Service request
 */
const getServiceRequest = async (requestId, userId, role) => {
  return await ServiceRequest.findById(requestId, userId, role);
};

/**
 * Get all service requests
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @returns {Promise<Array>} Array of service requests
 */
const getAllServiceRequests = async (userId, role) => {
  return await ServiceRequest.findAll(userId, role);
};

/**
 * Upload photos for service request
 * @param {number} requestId - Request ID
 * @param {number} clientId - Client ID
 * @param {Array} files - Uploaded files
 * @returns {Promise<Array>} Array of photo paths
 */
const uploadPhotos = async (requestId, clientId, files) => {
  // Verify request belongs to client
  const belongsToClient = await ServiceRequest.belongsToClient(requestId, clientId);
  if (!belongsToClient) {
    throw new ValidationError('Service request not found or access denied');
  }

  // Check existing photo count
  const existingCount = await ServiceRequest.getPhotoCount(requestId);
  const newPhotos = files || [];

  if (existingCount + newPhotos.length > UPLOAD.MAX_FILES) {
    // Clean up uploaded files
    const fs = require('fs');
    newPhotos.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    throw new ValidationError(`Maximum ${UPLOAD.MAX_FILES} photos allowed per request`);
  }

  if (newPhotos.length === 0) {
    throw new ValidationError('No photos uploaded');
  }

  // Save photo paths
  const path = require('path');
  const photoPaths = newPhotos.map(file => `/uploads/service-requests/${path.basename(file.path)}`);
  
  await ServiceRequest.addPhotos(requestId, photoPaths);

  return photoPaths;
};

module.exports = {
  createServiceRequest,
  getServiceRequest,
  getAllServiceRequests,
  uploadPhotos
};

