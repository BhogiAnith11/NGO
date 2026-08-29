const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  volunteerForEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', getEvents);
router.post('/', protect, requireRole('ngo', 'admin'), createEvent);
router.post('/:id/volunteer', volunteerForEvent);

module.exports = router;
