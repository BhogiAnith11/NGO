import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('ngo_user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch {
    // ignore
  }
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// ─── Public Stats ─────────────────────────────────────────────────────────────
export const getStats = () => api.get('/stats');

// ─── NGOs ────────────────────────────────────────────────────────────────────
export const getNGOs = (params) => api.get('/ngos', { params });
export const getNGOById = (id) => api.get(`/ngos/${id}`);
export const getMyNGO = () => api.get('/ngos/mine');
export const createNGO = (formData) =>
  api.post('/ngos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateNGO = (id, formData) =>
  api.put(`/ngos/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// ─── Activities ──────────────────────────────────────────────────────────────
export const getActivities = (ngoId, params = {}) => api.get(`/ngos/${ngoId}/activities`, { params });
export const createActivity = (ngoId, formData) =>
  api.post(`/ngos/${ngoId}/activities`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteActivity = (ngoId, activityId) => api.delete(`/ngos/${ngoId}/activities/${activityId}`);

// ─── Connect ─────────────────────────────────────────────────────────────────
export const sendConnectRequest = (ngoId, data) => api.post(`/connect/${ngoId}`, data);
export const getInbox = () => api.get('/connect/inbox');
export const updateConnectStatus = (requestId, data) =>
  api.patch(`/connect/${requestId}`, data);

// ─── Donations (from NGO-master) ─────────────────────────────────────────────
export const createDonation = (data) => api.post('/donations', data);
export const getDonations = (params) => api.get('/donations', { params });
export const getNgoDonations = (ngoId) => api.get(`/donations/ngo/${ngoId}`);

// ─── Contacts & Grievances (from NGO-master) ─────────────────────────────────
export const createContact = (data) => api.post('/contacts', data);
export const getContacts = (params) => api.get('/contacts', { params });
export const updateContactStatus = (id, data) => api.patch(`/contacts/${id}/status`, data);

// ─── Events & Drives (from NGO-master) ───────────────────────────────────────
export const getEvents = (params) => api.get('/events', { params });
export const createEvent = (data) => api.post('/events', data);
export const volunteerForEvent = (id) => api.post(`/events/${id}/volunteer`);

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminGetNGOs = (params) => api.get('/admin/ngos', { params });
export const updateNGOStatus = (id, data) => api.patch(`/admin/ngos/${id}/status`, data);
export const adminGetActivities = (params) => api.get('/admin/activities', { params });
export const updateActivityStatus = (id, data) => api.patch(`/admin/activities/${id}/status`, data);
export const adminGetEvents = (params) => api.get('/admin/events', { params });
export const updateEventStatus = (id, data) => api.patch(`/admin/events/${id}/status`, data);
export const getAnalytics = () => api.get('/admin/analytics');
export const exportCSV = () =>
  api.get('/admin/export', { responseType: 'blob' });

export default api;
