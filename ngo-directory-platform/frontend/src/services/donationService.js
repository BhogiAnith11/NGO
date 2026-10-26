import api from './api';

// ─── Direct Razorpay Donations ───────────────────────────────────────────────
export const createPaymentOrder = (data) =>
  api.post('/donations/order', data);

export const verifyPayment = (data) =>
  api.post('/donations/verify', data);

export const getMyDonations = () =>
  api.get('/donations/my-donations');

export const getDonationById = (id) =>
  api.get(`/donations/${id}`);

export const getDonationReceipt = (id) =>
  api.get(`/donations/${id}/receipt`);

export const getCampaignDonationsSummary = (campaignId) =>
  api.get(`/medical-assistance/${campaignId}/donations`);

export default {
  createPaymentOrder,
  verifyPayment,
  getMyDonations,
  getDonationById,
  getDonationReceipt,
  getCampaignDonationsSummary,
};
