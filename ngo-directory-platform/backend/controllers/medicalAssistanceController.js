const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const MedicalAssistance = require('../models/MedicalAssistance');
const MedicalUpdate = require('../models/MedicalUpdate');
const Donation = require('../models/Donation');
const { calculateCampaignTotals, batchCalculateCampaignTotals } = require('../utils/campaignTotals');
const { privateDocDir } = require('../middleware/medicalUpload');

// Helper to filter out private fields for public consumption
const sanitizePublicCampaign = (campaign, totals = {}) => {
  const obj = campaign.toObject ? campaign.toObject() : { ...campaign };

  // Remove private fields completely
  delete obj.privatePatientDetails;
  delete obj.reports;
  delete obj.pauseReason;

  // Mask representative private contact info for public viewers
  if (obj.representative) {
    obj.representative = {
      name: obj.representative.name,
      relationship: obj.representative.relationship,
    };
  }

  // Supporting documents: only expose public metadata (title, docType, uploadedAt), NOT file paths
  if (obj.supportingDocuments) {
    obj.documentSummary = obj.supportingDocuments.map((doc) => ({
      _id: doc._id,
      title: doc.title,
      documentType: doc.documentType,
      uploadedAt: doc.uploadedAt,
    }));
    delete obj.supportingDocuments;
  }

  // Hospital details: if patient opted out of showing hospital publicly, mask it
  if (obj.hospitalDetails && !obj.hospitalDetails.showHospitalPublicly) {
    obj.hospitalDetails = {
      showHospitalPublicly: false,
      hospitalLocation: obj.district,
    };
  }

  // Attach verified financial totals
  obj.amountRaised = totals.amountRaised ?? 0;
  obj.remainingAmount = totals.remainingAmount ?? (obj.fundingTarget - obj.amountRaised);
  obj.progressPercentage = totals.progressPercentage ?? 0;
  obj.successfulDonationCount = totals.successfulDonationCount ?? 0;

  return obj;
};

// @desc    Submit a new medical assistance request
// @route   POST /api/medical-assistance
// @access  Private (Authenticated users: patient/donor/volunteer/ngo)
const submitApplication = asyncHandler(async (req, res) => {
  const {
    patientDisplayName,
    fullName,
    age,
    contactPhone,
    contactEmail,
    address,
    district,
    village,
    emergencyContact,
    amountAlreadyReceived,
    representativeName,
    representativeRelationship,
    representativePhone,
    representativeEmail,
    conditionCategory,
    medicalSummary,
    treatmentDetails,
    hospitalName,
    hospitalLocation,
    doctorName,
    estimatedCost,
    admissionDate,
    showHospitalPublicly,
    serviceLocation,
    fundingTarget,
    urgency,
    treatmentDeadline,
    publicConsent,
  } = req.body;

  if (!patientDisplayName || !district || !conditionCategory || !medicalSummary || !fundingTarget) {
    res.status(400);
    throw new Error('Please fill all required medical assistance application fields.');
  }

  if (Number(fundingTarget) < 100) {
    res.status(400);
    throw new Error('Funding target must be at least ₹100.');
  }

  if (publicConsent === false || publicConsent === 'false') {
    res.status(400);
    throw new Error('Consent and authorization confirmation is mandatory before submitting.');
  }

  // Handle uploaded files
  let patientPhotoUrl = null;
  const supportingDocuments = [];

  if (req.files) {
    if (req.files.patientPhoto && req.files.patientPhoto[0]) {
      patientPhotoUrl = `/uploads/photos/${req.files.patientPhoto[0].filename}`;
    }

    if (req.files.supportingDocuments) {
      req.files.supportingDocuments.forEach((file) => {
        supportingDocuments.push({
          title: file.originalname.replace(path.extname(file.originalname), ''),
          documentType: 'medical_report',
          fileName: file.filename,
          filePath: file.path,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          uploadedAt: new Date(),
        });
      });
    }
  }

  const campaign = await MedicalAssistance.create({
    createdBy: req.user._id,
    representative: {
      name: representativeName || req.user.name,
      relationship: representativeRelationship || 'Self',
      phone: representativePhone || req.user.phone,
      email: representativeEmail || req.user.email,
      emergencyContact,
    },
    patientDisplayName: patientDisplayName.trim(),
    privatePatientDetails: {
      fullName: fullName || patientDisplayName,
      age: age ? Number(age) : undefined,
      contactPhone,
      contactEmail,
      address,
      district,
      village,
      emergencyContact,
      photoUrl: patientPhotoUrl,
      amountAlreadyReceived: amountAlreadyReceived ? Number(amountAlreadyReceived) : 0,
    },
    conditionCategory,
    medicalSummary: medicalSummary.trim(),
    treatmentDetails: treatmentDetails ? treatmentDetails.trim() : undefined,
    hospitalDetails: {
      hospitalName,
      hospitalLocation,
      doctorName,
      estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
      admissionDate: admissionDate ? new Date(admissionDate) : undefined,
      showHospitalPublicly: showHospitalPublicly !== 'false' && showHospitalPublicly !== false,
    },
    district: district.trim(),
    serviceLocation: serviceLocation ? serviceLocation.trim() : district.trim(),
    fundingTarget: Number(fundingTarget),
    fundingCurrency: 'INR',
    urgency: urgency || 'urgent',
    treatmentDeadline: treatmentDeadline ? new Date(treatmentDeadline) : undefined,
    patientPhoto: patientPhotoUrl,
    supportingDocuments,
    verificationStatus: 'Pending',
    campaignStatus: 'Active',
    publicConsent: true,
  });

  res.status(201).json({
    success: true,
    message: 'Medical assistance application submitted successfully. It is now queued for administrator review.',
    data: campaign,
  });
});

// @desc    List approved public medical assistance campaigns
// @route   GET /api/medical-assistance
// @access  Public
const getPublicCampaigns = asyncHandler(async (req, res) => {
  const { search, district, category, urgency, status, sortBy, progress } = req.query;

  // Public directory strictly shows Approved campaigns and ignores Paused campaigns
  const filter = {
    verificationStatus: 'Approved',
  };

  if (status && ['Active', 'Goal Reached', 'Completed'].includes(status)) {
    filter.campaignStatus = status;
  } else {
    filter.campaignStatus = { $in: ['Active', 'Goal Reached', 'Completed'] };
  }

  if (district && district.trim() !== '') {
    filter.district = new RegExp(district.trim(), 'i');
  }

  if (category && category.trim() !== '') {
    filter.conditionCategory = category.trim();
  }

  if (urgency && urgency.trim() !== '') {
    filter.urgency = urgency.trim();
  }

  if (search && search.trim() !== '') {
    const term = search.trim();
    filter.$or = [
      { patientDisplayName: new RegExp(term, 'i') },
      { conditionCategory: new RegExp(term, 'i') },
      { district: new RegExp(term, 'i') },
      { medicalSummary: new RegExp(term, 'i') },
      { 'hospitalDetails.hospitalName': new RegExp(term, 'i') },
    ];
  }

  // Base sorting
  let sortOption = { createdAt: -1 };
  if (sortBy === 'newest') sortOption = { createdAt: -1 };
  else if (sortBy === 'deadline') sortOption = { treatmentDeadline: 1 };
  else if (sortBy === 'target_desc') sortOption = { fundingTarget: -1 };
  else if (sortBy === 'target_asc') sortOption = { fundingTarget: 1 };

  const campaigns = await MedicalAssistance.find(filter)
    .populate('createdBy', 'name')
    .sort(sortOption)
    .lean();

  // Batch calculate verified donation totals
  const campaignIds = campaigns.map((c) => c._id);
  const totalsMap = await batchCalculateCampaignTotals(campaignIds);

  let formatted = campaigns.map((c) => {
    const totals = totalsMap[c._id.toString()] || {
      amountRaised: 0,
      successfulDonationCount: 0,
      grossDonations: 0,
      totalRefunds: 0,
    };
    const target = c.fundingTarget || 0;
    const remainingAmount = Math.max(0, target - totals.amountRaised);
    const progressPercentage = target > 0 ? Math.min(100, Math.round((totals.amountRaised / target) * 100 * 10) / 10) : 0;

    return sanitizePublicCampaign(c, {
      amountRaised: totals.amountRaised,
      remainingAmount,
      progressPercentage,
      successfulDonationCount: totals.successfulDonationCount,
    });
  });

  // Client progress filtering (e.g., '<25%', '25-75%', '>75%', 'reached')
  if (progress) {
    if (progress === 'under_50') {
      formatted = formatted.filter((c) => c.progressPercentage < 50);
    } else if (progress === '50_plus') {
      formatted = formatted.filter((c) => c.progressPercentage >= 50 && c.progressPercentage < 100);
    } else if (progress === 'completed') {
      formatted = formatted.filter((c) => c.progressPercentage >= 100);
    }
  }

  // Urgency or closest to target custom sorting
  if (sortBy === 'most_urgent') {
    const urgencyOrder = { life_threatening: 4, critical: 3, urgent: 2, routine: 1 };
    formatted.sort((a, b) => (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0));
  } else if (sortBy === 'closest_to_target') {
    formatted.sort((a, b) => b.progressPercentage - a.progressPercentage);
  }

  res.json({
    success: true,
    count: formatted.length,
    data: formatted,
  });
});

// @desc    Get a single medical assistance campaign profile
// @route   GET /api/medical-assistance/:id
// @access  Public / Authorized (shows private info if creator or admin)
const getCampaignById = asyncHandler(async (req, res) => {
  const campaign = await MedicalAssistance.findById(req.params.id)
    .populate('createdBy', 'name email role phone')
    .populate('reviewedBy', 'name role');

  if (!campaign) {
    res.status(404);
    throw new Error('Medical assistance campaign not found');
  }

  // Calculate verified financial totals
  const totals = await calculateCampaignTotals(campaign._id, campaign.fundingTarget);

  // Check if authenticated user is the campaign creator or an admin
  const isAuthorized =
    req.user &&
    (req.user.role === 'admin' ||
      (campaign.createdBy && campaign.createdBy._id.toString() === req.user._id.toString()));

  // Fetch approved public treatment updates
  const updates = await MedicalUpdate.find({
    campaign: campaign._id,
    ...(isAuthorized ? {} : { visibility: 'public' }),
  })
    .populate('author', 'name')
    .sort({ createdAt: -1 });

  // Fetch recent donations (privacy-preserving)
  const recentDonations = await Donation.find({
    targetCampaign: campaign._id,
    transactionStatus: 'successful',
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('amount isAnonymous donorMessage createdAt name');

  const sanitizedDonations = recentDonations.map((d) => ({
    _id: d._id,
    amount: d.amount,
    donorName: d.isAnonymous ? 'Generous Donor' : d.name || 'Kind Supporter',
    donorMessage: d.donorMessage || null,
    createdAt: d.createdAt,
  }));

  if (!isAuthorized) {
    // If not approved and not creator/admin, deny access
    if (campaign.verificationStatus !== 'Approved') {
      res.status(403);
      throw new Error('This campaign is pending verification and is not yet publicly visible.');
    }

    const publicProfile = sanitizePublicCampaign(campaign, totals);
    return res.json({
      success: true,
      data: {
        ...publicProfile,
        updates,
        recentDonations: sanitizedDonations,
      },
    });
  }

  // For creator or admin: include full details
  const fullData = campaign.toObject();
  fullData.amountRaised = totals.amountRaised;
  fullData.remainingAmount = totals.remainingAmount;
  fullData.progressPercentage = totals.progressPercentage;
  fullData.successfulDonationCount = totals.successfulDonationCount;
  fullData.updates = updates;
  fullData.recentDonations = sanitizedDonations;

  res.json({
    success: true,
    data: fullData,
  });
});

// @desc    Update an authorized medical assistance campaign
// @route   PUT /api/medical-assistance/:id
// @access  Private (Owner before approval or Admin)
const updateCampaign = asyncHandler(async (req, res) => {
  const campaign = await MedicalAssistance.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  const isOwner = campaign.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to modify this campaign');
  }

  // Users can only edit general info if status is Pending or Under Review
  if (!isAdmin && !['Pending', 'Under Review'].includes(campaign.verificationStatus)) {
    // If already approved, allow editing only treatment updates, not fundingTarget or core details
    res.status(400);
    throw new Error('Approved campaigns cannot be edited directly. Please post a treatment update.');
  }

  const allowedFields = [
    'patientDisplayName',
    'conditionCategory',
    'medicalSummary',
    'treatmentDetails',
    'district',
    'serviceLocation',
    'fundingTarget',
    'urgency',
    'treatmentDeadline',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      campaign[field] = req.body[field];
    }
  });

  if (req.body.hospitalDetails) {
    campaign.hospitalDetails = {
      ...campaign.hospitalDetails.toObject(),
      ...req.body.hospitalDetails,
    };
  }

  if (req.body.representative) {
    campaign.representative = {
      ...campaign.representative.toObject(),
      ...req.body.representative,
    };
  }

  if (isOwner && req.body.privatePatientDetails) {
    campaign.privatePatientDetails = {
      ...campaign.privatePatientDetails.toObject(),
      ...req.body.privatePatientDetails,
    };
  }

  await campaign.save();

  res.json({
    success: true,
    message: 'Campaign details updated successfully',
    data: campaign,
  });
});

// @desc    Submit a draft campaign for verification
// @route   PATCH /api/medical-assistance/:id/submit
// @access  Private (Owner)
const submitDraft = asyncHandler(async (req, res) => {
  const campaign = await MedicalAssistance.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  if (campaign.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to submit this campaign');
  }

  campaign.verificationStatus = 'Pending';
  await campaign.save();

  res.json({
    success: true,
    message: 'Application submitted for official verification',
    data: campaign,
  });
});

// @desc    Request campaign closure (goal reached or treatment completed)
// @route   PATCH /api/medical-assistance/:id/close
// @access  Private (Owner or Admin)
const closeCampaign = asyncHandler(async (req, res) => {
  const campaign = await MedicalAssistance.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  const isOwner = campaign.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to request closure');
  }

  const reason = req.body.reason || 'Treatment completed / Funding goal reached';
  campaign.campaignStatus = 'Completed';
  await campaign.save();

  res.json({
    success: true,
    message: `Campaign marked as Completed (${reason})`,
    data: campaign,
  });
});

// @desc    Create a treatment update
// @route   POST /api/medical-assistance/:id/updates
// @access  Private (Campaign owner or Admin)
const createMedicalUpdate = asyncHandler(async (req, res) => {
  const campaign = await MedicalAssistance.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  const isOwner = campaign.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Only the campaign applicant or admin can post treatment updates.');
  }

  const { title, description, visibility } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error('Update title and description are required.');
  }

  const images = [];
  if (req.files && req.files.images) {
    req.files.images.forEach((f) => {
      images.push(`/uploads/photos/${f.filename}`);
    });
  }

  const update = await MedicalUpdate.create({
    campaign: campaign._id,
    author: req.user._id,
    title: title.trim(),
    description: description.trim(),
    images,
    visibility: visibility || 'public',
  });

  res.status(201).json({
    success: true,
    message: 'Treatment progress update published successfully',
    data: update,
  });
});

// @desc    Get updates for a campaign
// @route   GET /api/medical-assistance/:id/updates
// @access  Public / Authorized
const getMedicalUpdates = asyncHandler(async (req, res) => {
  const campaign = await MedicalAssistance.findById(req.params.id);
  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  const isAuthorized =
    req.user &&
    (req.user.role === 'admin' ||
      (campaign.createdBy && campaign.createdBy.toString() === req.user._id.toString()));

  const filter = {
    campaign: campaign._id,
    ...(isAuthorized ? {} : { visibility: 'public' }),
  };

  const updates = await MedicalUpdate.find(filter)
    .populate('author', 'name')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: updates.length,
    data: updates,
  });
});

// @desc    Report a suspicious campaign
// @route   POST /api/medical-assistance/:id/report
// @access  Public / Authenticated
const reportCampaign = asyncHandler(async (req, res) => {
  const campaign = await MedicalAssistance.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  const { reason, details, reporterName, reporterEmail } = req.body;

  if (!reason || reason.trim() === '') {
    res.status(400);
    throw new Error('Please specify the reason for reporting this campaign.');
  }

  campaign.reports.push({
    reportedBy: req.user ? req.user._id : null,
    reporterName: reporterName || req.user?.name || 'Concerned Citizen',
    reporterEmail: reporterEmail || req.user?.email || null,
    reason: reason.trim(),
    details: details ? details.trim() : '',
    createdAt: new Date(),
  });

  await campaign.save();

  res.status(201).json({
    success: true,
    message: 'Report received. The district nodal administration will review this campaign immediately.',
  });
});

// @desc    Securely view/download a private medical document
// @route   GET /api/medical-assistance/:id/documents/:docId
// @access  Private (Authorized Creator or Admin only)
const getPrivateDocument = asyncHandler(async (req, res) => {
  const campaign = await MedicalAssistance.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  const isOwner = campaign.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Access denied. Medical documents are strictly confidential and restricted to authorized parties.');
  }

  const doc = campaign.supportingDocuments.id(req.params.docId);
  if (!doc) {
    res.status(404);
    throw new Error('Requested document not found');
  }

  const filePath = doc.filePath || path.join(privateDocDir, doc.fileName);

  if (!fs.existsSync(filePath)) {
    res.status(404);
    throw new Error('Document file is missing from secure storage.');
  }

  res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `inline; filename="${doc.originalName || doc.fileName}"`);
  res.sendFile(path.resolve(filePath));
});

// @desc    Upload additional requested documents
// @route   POST /api/medical-assistance/:id/documents
// @access  Private (Campaign Creator)
const uploadAdditionalDocuments = asyncHandler(async (req, res) => {
  const campaign = await MedicalAssistance.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  const isOwner = campaign.createdBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to upload documents for this campaign');
  }

  if (!req.files || !req.files.supportingDocuments || req.files.supportingDocuments.length === 0) {
    res.status(400);
    throw new Error('Please select at least one supporting document file to upload.');
  }

  const docType = req.body.documentType || 'medical_report';

  req.files.supportingDocuments.forEach((file) => {
    campaign.supportingDocuments.push({
      title: req.body.title || file.originalname.replace(path.extname(file.originalname), ''),
      documentType: docType,
      fileName: file.filename,
      filePath: file.path,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    });
  });

  // If status was Under Review with requested docs, update status back to Pending for review
  if (campaign.verificationStatus === 'Under Review') {
    campaign.verificationStatus = 'Pending';
  }

  await campaign.save();

  res.status(201).json({
    success: true,
    message: 'Additional supporting documents uploaded securely.',
    data: campaign.supportingDocuments,
  });
});

// @desc    Get logged in user's medical assistance campaigns
// @route   GET /api/medical-assistance/mine
// @access  Private
const getMyCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await MedicalAssistance.find({ createdBy: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  const campaignIds = campaigns.map((c) => c._id);
  const totalsMap = await batchCalculateCampaignTotals(campaignIds);

  const populated = campaigns.map((c) => {
    const totals = totalsMap[c._id.toString()] || {
      amountRaised: 0,
      successfulDonationCount: 0,
      grossDonations: 0,
      totalRefunds: 0,
    };
    const target = c.fundingTarget || 0;
    const remainingAmount = Math.max(0, target - totals.amountRaised);
    const progressPercentage = target > 0 ? Math.min(100, Math.round((totals.amountRaised / target) * 100 * 10) / 10) : 0;

    return {
      ...c,
      amountRaised: totals.amountRaised,
      remainingAmount,
      progressPercentage,
      successfulDonationCount: totals.successfulDonationCount,
    };
  });

  res.json({
    success: true,
    count: populated.length,
    data: populated,
  });
});

module.exports = {
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
};
