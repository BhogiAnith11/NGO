const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  adminGetNGOs,
  updateNGOStatus,
  getAnalytics,
  exportCSV,
} = require('../controllers/adminController');
const { adminGetActivities, updateActivityStatus } = require('../controllers/activityController');
const { adminGetEvents, updateEventStatus } = require('../controllers/eventController');
const {
  getAdminCampaigns,
  approveCampaign,
  rejectCampaign,
  requestDocuments,
  pauseCampaign,
  resumeCampaign,
  getMedicalAnalytics,
} = require('../controllers/medicalAdminController');

router.use(protect, requireRole('admin'));

// Existing NGO administration routes
router.get('/ngos', adminGetNGOs);
router.patch('/ngos/:id/status', updateNGOStatus);
router.get('/activities', adminGetActivities);
router.patch('/activities/:id/status', updateActivityStatus);
router.get('/events', adminGetEvents);
router.patch('/events/:id/status', updateEventStatus);
router.get('/analytics', getAnalytics);
router.get('/export', exportCSV);

// Medical Assistance administration routes
router.get('/medical-assistance', getAdminCampaigns);
router.patch('/medical-assistance/:id/approve', approveCampaign);
router.patch('/medical-assistance/:id/reject', rejectCampaign);
router.patch('/medical-assistance/:id/request-documents', requestDocuments);
router.patch('/medical-assistance/:id/pause', pauseCampaign);
router.patch('/medical-assistance/:id/resume', resumeCampaign);
router.get('/medical-assistance/analytics', getMedicalAnalytics);

module.exports = router;
