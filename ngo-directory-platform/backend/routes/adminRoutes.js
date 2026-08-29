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

router.use(protect, requireRole('admin'));

router.get('/ngos', adminGetNGOs);
router.patch('/ngos/:id/status', updateNGOStatus);
router.get('/analytics', getAnalytics);
router.get('/export', exportCSV);

module.exports = router;
