const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendConnectRequest,
  getInbox,
  updateRequestStatus,
} = require('../controllers/connectController');

router.post('/:ngoId', protect, sendConnectRequest);
router.get('/inbox', protect, getInbox);
router.patch('/:requestId', protect, updateRequestStatus);

module.exports = router;
