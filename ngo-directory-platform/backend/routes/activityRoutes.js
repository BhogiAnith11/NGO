const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :id from parent router
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { createActivity, getActivities, deleteActivity } = require('../controllers/activityController');

// Multer for activity images (multiple)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `activity_${Date.now()}_${file.originalname}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

router.get('/', getActivities);
router.post(
  '/',
  protect,
  requireRole('ngo'),
  upload.array('images', 5),
  createActivity
);
router.delete('/:activityId', protect, requireRole('ngo'), deleteActivity);

module.exports = router;
