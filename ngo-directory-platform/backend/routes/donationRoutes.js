const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonations,
  getNgoDonations,
} = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/', createDonation);
router.get('/', protect, requireRole('admin'), getDonations);
router.get('/ngo/:ngoId', protect, getNgoDonations);

module.exports = router;
