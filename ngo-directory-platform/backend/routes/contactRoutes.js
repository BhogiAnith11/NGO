const express = require('express');
const router = express.Router();
const {
  createContact,
  getContacts,
  updateContactStatus,
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/', createContact);
router.get('/', protect, requireRole('admin'), getContacts);
router.patch('/:id/status', protect, requireRole('admin'), updateContactStatus);

module.exports = router;
