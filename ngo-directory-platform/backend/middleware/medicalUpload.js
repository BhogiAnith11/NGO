const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const privateDocDir = path.join(__dirname, '../uploads/private_medical');
const publicPhotoDir = path.join(__dirname, '../uploads/photos');

if (!fs.existsSync(privateDocDir)) {
  fs.mkdirSync(privateDocDir, { recursive: true });
}
if (!fs.existsSync(publicPhotoDir)) {
  fs.mkdirSync(publicPhotoDir, { recursive: true });
}

// Storage for private medical documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'patientPhoto') {
      cb(null, publicPhotoDir);
    } else {
      cb(null, privateDocDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const prefix = file.fieldname === 'patientPhoto' ? 'photo' : 'doc';
    cb(null, `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${cleanBase}${ext}`);
  },
});

// File filter enforcing allowed MIME types & extensions
const documentFileFilter = (req, file, cb) => {
  const allowedDocExts = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
  const allowedPhotoExts = ['.jpg', '.jpeg', '.png', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'patientPhoto') {
    if (allowedPhotoExts.includes(ext) && file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    return cb(new Error('Patient photograph must be a valid image file (JPG, PNG, WEBP)'));
  }

  // Supporting documents
  if (allowedDocExts.includes(ext)) {
    return cb(null, true);
  }
  return cb(new Error('Supporting documents must be PDF, JPG, PNG, or WEBP files'));
};

const medicalUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
  fileFilter: documentFileFilter,
});

module.exports = {
  medicalUpload,
  privateDocDir,
  publicPhotoDir,
};
