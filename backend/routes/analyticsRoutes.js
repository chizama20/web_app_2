/**
 * Analytics routes for contractor dashboard
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorization');

// All analytics routes require authentication and contractor role
router.use(authenticateToken);
router.use(requireRole(['contractor']));

// Analytics endpoints
router.get('/frequent-clients', analyticsController.getFrequentClients);
router.get('/uncommitted-clients', analyticsController.getUncommittedClients);
router.get('/monthly-quotes', analyticsController.getMonthlyQuotes);
router.get('/prospective-clients', analyticsController.getProspectiveClients);
router.get('/largest-jobs', analyticsController.getLargestJobs);
router.get('/overdue-bills', analyticsController.getOverdueBills);
router.get('/bad-clients', analyticsController.getBadClients);
router.get('/good-clients', analyticsController.getGoodClients);

module.exports = router;