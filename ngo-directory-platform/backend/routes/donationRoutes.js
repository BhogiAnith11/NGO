const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  getMyDonations,
  getDonationById,
  getDonationReceipt,
  createDonation,
  getDonations,
  getNgoDonations,
} = require('../controllers/donationController');

// ─── Direct Razorpay Medical Assistance Donations ───
router.post('/order', optionalAuth, createPaymentOrder);
router.post('/verify', optionalAuth, verifyPayment);
router.post('/webhook', handleWebhook);
router.get('/my-donations', protect, getMyDonations);
router.get('/:id/receipt', protect, getDonationReceipt);
router.get('/:id', protect, getDonationById);

// ─── Legacy NGO in-kind & offline donations ───
router.post('/', optionalAuth, createDonation);
router.get('/', protect, requireRole('admin'), getDonations);
router.get('/ngo/:ngoId', protect, getNgoDonations);

module.exports = router;
