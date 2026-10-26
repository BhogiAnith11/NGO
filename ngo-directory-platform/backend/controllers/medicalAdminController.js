const asyncHandler = require('express-async-handler');
const MedicalAssistance = require('../models/MedicalAssistance');
const Donation = require('../models/Donation');
const { calculateCampaignTotals, batchCalculateCampaignTotals } = require('../utils/campaignTotals');

// @desc    List medical assistance applications for review (Admin)
// @route   GET /api/admin/medical-assistance
// @access  Private (Admin only)
const getAdminCampaigns = asyncHandler(async (req, res) => {
  const { status, campaignStatus, urgency, search } = req.query;

  const filter = {};
  if (status) filter.verificationStatus = status;
  if (campaignStatus) filter.campaignStatus = campaignStatus;
  if (urgency) filter.urgency = urgency;

  if (search && search.trim() !== '') {
    const term = search.trim();
    filter.$or = [
      { patientDisplayName: new RegExp(term, 'i') },
      { 'privatePatientDetails.fullName': new RegExp(term, 'i') },
      { district: new RegExp(term, 'i') },
      { conditionCategory: new RegExp(term, 'i') },
    ];
  }

  const campaigns = await MedicalAssistance.find(filter)
    .populate('createdBy', 'name email phone role')
    .populate('reviewedBy', 'name role')
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
      reportCount: c.reports?.length || 0,
    };
  });

  res.json({
    success: true,
    count: populated.length,
    data: populated,
  });
});

// @desc    Approve a medical assistance application
// @route   PATCH /api/admin/medical-assistance/:id/approve
// @access  Private (Admin only)
const approveCampaign = asyncHandler(async (req, res) => {
  const campaign = await MedicalAssistance.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Medical assistance application not found');
  }

  campaign.verificationStatus = 'Approved';
  campaign.campaignStatus = 'Active';
  campaign.reviewedBy = req.user._id;
  campaign.reviewedAt = new Date();
  campaign.rejectionReason = undefined;

  await campaign.save();

  res.json({
    success: true,
    message: `Medical assistance campaign for "${campaign.patientDisplayName}" approved and verified. It is now accepting public donations.`,
    data: campaign,
  });
});

// @desc    Reject a medical assistance application
// @route   PATCH /api/admin/medical-assistance/:id/reject
// @access  Private (Admin only)
const rejectCampaign = asyncHandler(async (req, res) => {
  const campaign = await MedicalAssistance.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Medical assistance application not found');
  }

  const { rejectionReason } = req.body;
  if (!rejectionReason || rejectionReason.trim() === '') {
    res.status(400);
    throw new Error('Rejection reason is required.');
  }

  campaign.verificationStatus = 'Rejected';
  campaign.campaignStatus = 'Closed';
  campaign.reviewedBy = req.user._id;
  campaign.reviewedAt = new Date();
  campaign.rejectionReason = rejectionReason.trim();

  await campaign.save();

  res.json({
    success: true,
    message: `Medical assistance application rejected with specified reason.`,
    data: campaign,
  });
});

// @desc    Request additional supporting documents
// @route   PATCH /api/admin/medical-assistance/:id/request-documents
// @access  Private (Admin only)
const requestDocuments = asyncHandler(async (req, res) => {
  const campaign = await MedicalAssistance.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Medical assistance application not found');
  }

  const { documentsRequested } = req.body;
  if (!documentsRequested || documentsRequested.trim() === '') {
    res.status(400);
    throw new Error('Please specify the documents or information required.');
  }

  campaign.verificationStatus = 'Under Review';
  campaign.documentsRequested = documentsRequested.trim();
  campaign.reviewedBy = req.user._id;
  campaign.reviewedAt = new Date();

  await campaign.save();

  res.json({
    success: true,
    message: 'Additional documents requested from applicant.',
    data: campaign,
  });
});

// @desc    Pause a suspicious or flagged campaign
// @route   PATCH /api/admin/medical-assistance/:id/pause
// @access  Private (Admin only)
const pauseCampaign = asyncHandler(async (req, res) => {
  const campaign = await MedicalAssistance.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  const { pauseReason } = req.body;
  campaign.campaignStatus = 'Paused';
  campaign.pauseReason = pauseReason ? pauseReason.trim() : 'Flagged for administrative review';
  campaign.reviewedBy = req.user._id;
  campaign.reviewedAt = new Date();

  await campaign.save();

  res.json({
    success: true,
    message: 'Campaign has been paused. It is temporarily hidden from the public directory and cannot accept donations.',
    data: campaign,
  });
});

// @desc    Resume a paused campaign
// @route   PATCH /api/admin/medical-assistance/:id/resume
// @access  Private (Admin only)
const resumeCampaign = asyncHandler(async (req, res) => {
  const campaign = await MedicalAssistance.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  campaign.campaignStatus = 'Active';
  campaign.pauseReason = undefined;

  await campaign.save();

  res.json({
    success: true,
    message: 'Campaign has been resumed and is now active.',
    data: campaign,
  });
});

// @desc    Get medical assistance & donation analytics
// @route   GET /api/admin/medical-assistance/analytics
// @access  Private (Admin only)
const getMedicalAnalytics = asyncHandler(async (req, res) => {
  const [
    totalApplications,
    pendingApplications,
    underReviewApplications,
    approvedCampaigns,
    rejectedApplications,
    activeCampaigns,
    completedCampaigns,
    reportedCountAgg,
    donationAgg,
  ] = await Promise.all([
    MedicalAssistance.countDocuments(),
    MedicalAssistance.countDocuments({ verificationStatus: 'Pending' }),
    MedicalAssistance.countDocuments({ verificationStatus: 'Under Review' }),
    MedicalAssistance.countDocuments({ verificationStatus: 'Approved' }),
    MedicalAssistance.countDocuments({ verificationStatus: 'Rejected' }),
    MedicalAssistance.countDocuments({ verificationStatus: 'Approved', campaignStatus: 'Active' }),
    MedicalAssistance.countDocuments({ campaignStatus: 'Completed' }),
    MedicalAssistance.aggregate([
      { $match: { 'reports.0': { $exists: true } } },
      { $count: 'count' },
    ]),
    Donation.aggregate([
      { $match: { transactionStatus: 'successful' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalRefunds: { $sum: '$refundAmount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const gross = donationAgg[0]?.totalAmount || 0;
  const refunds = donationAgg[0]?.totalRefunds || 0;
  const totalConfirmedDonations = Math.max(0, gross - refunds);

  res.json({
    success: true,
    data: {
      totalApplications,
      pendingApplications,
      underReviewApplications,
      approvedCampaigns,
      rejectedApplications,
      activeCampaigns,
      completedCampaigns,
      reportedCampaigns: reportedCountAgg[0]?.count || 0,
      totalConfirmedDonations,
      grossDonations: gross,
      totalRefunds: refunds,
      successfulTransactionCount: donationAgg[0]?.count || 0,
    },
  });
});

module.exports = {
  getAdminCampaigns,
  approveCampaign,
  rejectCampaign,
  requestDocuments,
  pauseCampaign,
  resumeCampaign,
  getMedicalAnalytics,
};
