import api from './api';

// ─── Public & Patient Medical Assistance Service ─────────────────────────────
export const getPublicCampaigns = (params) =>
  api.get('/medical-assistance', { params });

export const getCampaignById = (id) =>
  api.get(`/medical-assistance/${id}`);

export const submitApplication = (formData) =>
  api.post('/medical-assistance', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateCampaign = (id, data) =>
  api.put(`/medical-assistance/${id}`, data);

export const submitDraftCampaign = (id) =>
  api.patch(`/medical-assistance/${id}/submit`);

export const closeCampaign = (id, data) =>
  api.patch(`/medical-assistance/${id}/close`, data);

export const createTreatmentUpdate = (id, formData) =>
  api.post(`/medical-assistance/${id}/updates`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getTreatmentUpdates = (id) =>
  api.get(`/medical-assistance/${id}/updates`);

export const reportCampaign = (id, data) =>
  api.post(`/medical-assistance/${id}/report`, data);

export const uploadAdditionalDocuments = (id, formData) =>
  api.post(`/medical-assistance/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getPrivateDocumentUrl = (campaignId, docId) => {
  const baseURL = import.meta.env.VITE_API_URL || '/api';
  return `${baseURL}/medical-assistance/${campaignId}/documents/${docId}`;
};

export const getMyMedicalCampaigns = () =>
  api.get('/medical-assistance/mine');

// ─── Admin Medical Verification Service ──────────────────────────────────────
export const adminGetMedicalCampaigns = (params) =>
  api.get('/admin/medical-assistance', { params });

export const adminApproveCampaign = (id) =>
  api.patch(`/admin/medical-assistance/${id}/approve`);

export const adminRejectCampaign = (id, data) =>
  api.patch(`/admin/medical-assistance/${id}/reject`, data);

export const adminRequestDocuments = (id, data) =>
  api.patch(`/admin/medical-assistance/${id}/request-documents`, data);

export const adminPauseCampaign = (id, data) =>
  api.patch(`/admin/medical-assistance/${id}/pause`, data);

export const adminResumeCampaign = (id) =>
  api.patch(`/admin/medical-assistance/${id}/resume`);

export const adminGetMedicalAnalytics = () =>
  api.get('/admin/medical-assistance/analytics');

export default {
  getPublicCampaigns,
  getCampaignById,
  submitApplication,
  updateCampaign,
  submitDraftCampaign,
  closeCampaign,
  createTreatmentUpdate,
  getTreatmentUpdates,
  reportCampaign,
  uploadAdditionalDocuments,
  getPrivateDocumentUrl,
  getMyMedicalCampaigns,
  adminGetMedicalCampaigns,
  adminApproveCampaign,
  adminRejectCampaign,
  adminRequestDocuments,
  adminPauseCampaign,
  adminResumeCampaign,
  adminGetMedicalAnalytics,
};
