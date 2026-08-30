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

router.use(protect, requireRole('admin'));

router.get('/ngos', adminGetNGOs);
router.patch('/ngos/:id/status', updateNGOStatus);
router.get('/activities', adminGetActivities);
router.patch('/activities/:id/status', updateActivityStatus);
router.get('/events', adminGetEvents);
router.patch('/events/:id/status', updateEventStatus);
router.get('/analytics', getAnalytics);
router.get('/export', exportCSV);

module.exports = router;
