const Donation = require('../models/Donation');

/**
 * Calculates verified fundraising totals for a single campaign.
 * Amount Raised = Sum of Verified Successful Donations - Applicable Refunds
 * Remaining Amount = Max(0, Funding Target - Amount Raised)
 * Progress Percentage = Min(100, (Amount Raised / Funding Target) * 100)
 */
async function calculateCampaignTotals(campaignId, fundingTarget = 0) {
  const result = await Donation.aggregate([
    {
      $match: {
        targetCampaign: campaignId,
        transactionStatus: 'successful',
      },
    },
    {
      $group: {
        _id: null,
        grossDonations: { $sum: '$amount' },
        totalRefunds: { $sum: '$refundAmount' },
        successfulDonationCount: { $sum: 1 },
      },
    },
  ]);

  const gross = result[0]?.grossDonations || 0;
  const refunds = result[0]?.totalRefunds || 0;
  const count = result[0]?.successfulDonationCount || 0;

  const amountRaised = Math.max(0, gross - refunds);
  const target = Number(fundingTarget) || 0;
  const remainingAmount = Math.max(0, target - amountRaised);
  const progressPercentage = target > 0 ? Math.min(100, Math.round((amountRaised / target) * 100 * 10) / 10) : 0;

  return {
    amountRaised,
    remainingAmount,
    progressPercentage,
    successfulDonationCount: count,
    grossDonations: gross,
    totalRefunds: refunds,
  };
}

/**
 * Batch calculation of totals for multiple campaigns
 */
async function batchCalculateCampaignTotals(campaignIds) {
  if (!campaignIds || campaignIds.length === 0) return {};

  const objectIds = campaignIds.map((id) => (typeof id === 'string' ? new (require('mongoose').Types.ObjectId)(id) : id));

  const agg = await Donation.aggregate([
    {
      $match: {
        targetCampaign: { $in: objectIds },
        transactionStatus: 'successful',
      },
    },
    {
      $group: {
        _id: '$targetCampaign',
        grossDonations: { $sum: '$amount' },
        totalRefunds: { $sum: '$refundAmount' },
        successfulDonationCount: { $sum: 1 },
      },
    },
  ]);

  const map = {};
  agg.forEach((item) => {
    const gross = item.grossDonations || 0;
    const refunds = item.totalRefunds || 0;
    const count = item.successfulDonationCount || 0;
    const amountRaised = Math.max(0, gross - refunds);
    map[item._id.toString()] = {
      amountRaised,
      successfulDonationCount: count,
      grossDonations: gross,
      totalRefunds: refunds,
    };
  });

  return map;
}

module.exports = {
  calculateCampaignTotals,
  batchCalculateCampaignTotals,
};
