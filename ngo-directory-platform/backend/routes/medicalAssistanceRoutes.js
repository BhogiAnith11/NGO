const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { medicalUpload } = require('../middleware/medicalUpload');
const {
  submitApplication,
  getPublicCampaigns,
  getCampaignById,
  updateCampaign,
  submitDraft,
  closeCampaign,
  createMedicalUpdate,
  getMedicalUpdates,
  reportCampaign,
  getPrivateDocument,
  uploadAdditionalDocuments,
  getMyCampaigns,
} = require('../controllers/medicalAssistanceController');
const { getCampaignDonationsSummary } = require('../controllers/donationController');

// Multer fields configuration for application submission
const applicationUpload = medicalUpload.fields([
  { name: 'patientPhoto', maxCount: 1 },
  { name: 'supportingDocuments', maxCount: 10 },
]);

const documentsUpload = medicalUpload.fields([
  { name: 'supportingDocuments', maxCount: 10 },
]);

const updateImagesUpload = medicalUpload.fields([
  { name: 'images', maxCount: 5 },
]);

// 1. Submit application (Private)
router.post('/', protect, applicationUpload, submitApplication);

// 2. List public approved campaigns
router.get('/', getPublicCampaigns);

// 3. User's own campaigns
router.get('/mine', protect, getMyCampaigns);

// 4. Single campaign profile (Public with optional auth for creator/admin extra access)
router.get('/:id', optionalAuth, getCampaignById);

// 5. Update authorized campaign
router.put('/:id', protect, updateCampaign);

// 6. Submit draft
router.patch('/:id/submit', protect, submitDraft);

// 7. Request closure
router.patch('/:id/close', protect, closeCampaign);

// 8. Treatment progress updates
router.post('/:id/updates', protect, updateImagesUpload, createMedicalUpdate);
router.get('/:id/updates', optionalAuth, getMedicalUpdates);

// 9. Report suspicious campaign
router.post('/:id/report', optionalAuth, reportCampaign);

// 10. Secure private medical document view/download (Strict authorization check inside controller)
router.get('/:id/documents/:docId', protect, getPrivateDocument);

// 11. Upload additional documents requested by admin
router.post('/:id/documents', protect, documentsUpload, uploadAdditionalDocuments);

// 12. Public donations summary for a campaign
router.get('/:id/donations', getCampaignDonationsSummary);

module.exports = router;
