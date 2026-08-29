const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  getNGOs,
  getNGOById,
  createNGO,
  updateNGO,
  getMyNGO,
} = require('../controllers/ngoController');

// Multer storage for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `logo_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

router.get('/', getNGOs);
router.get('/mine', protect, requireRole('ngo'), getMyNGO);
router.get('/:id', getNGOById);
router.post('/', protect, requireRole('ngo'), upload.single('logo'), createNGO);
router.put('/:id', protect, requireRole('ngo'), upload.single('logo'), updateNGO);

module.exports = router;
