import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  adminGetNGOs, updateNGOStatus, getAnalytics, exportCSV,
  getDonations, getContacts, updateContactStatus,
  adminGetActivities, updateActivityStatus,
  adminGetEvents, updateEventStatus,
} from '../services/api';
import {
  adminGetMedicalCampaigns,
  adminApproveCampaign,
  adminRejectCampaign,
  adminRequestDocuments,
  adminPauseCampaign,
  adminResumeCampaign,
  adminGetMedicalAnalytics,
  getPrivateDocumentUrl,
} from '../services/medicalAssistanceService';
import VerificationBadge from '../components/medical/VerificationBadge';
import CampaignProgress from '../components/medical/CampaignProgress';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6b7280'];

const StatCard = ({ icon, label, value, color, subtext }) => (
  <div className="card p-5 flex items-center gap-4 bg-white border border-gray-100 shadow-xs">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
      <div className="text-xs font-semibold text-gray-700">{label}</div>
      {subtext && <div className="text-[11px] text-gray-400 mt-0.5">{subtext}</div>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [tab, setTab] = useState('medical');
  const [ngos, setNgos] = useState([]);
  const [activities, setActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [donations, setDonations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Medical Assistance Admin State
  const [medicalCampaigns, setMedicalCampaigns] = useState([]);
  const [medicalAnalytics, setMedicalAnalytics] = useState(null);
  const [medicalFilter, setMedicalFilter] = useState('Pending');
  const [medicalSearch, setMedicalSearch] = useState('');
  const [inspectModal, setInspectModal] = useState(null);
  const [medRejectModal, setMedRejectModal] = useState(null);
  const [medRejectReason, setMedRejectReason] = useState('');
  const [requestDocsModal, setRequestDocsModal] = useState(null);
  const [requestDocsText, setRequestDocsText] = useState('');
  const [pauseModal, setPauseModal] = useState(null);
  const [pauseReasonText, setPauseReasonText] = useState('');
  const [reportsModal, setReportsModal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModal, setRejectModal] = useState(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  const loadNGOs = async (status = statusFilter) => {
    try {
      const res = await adminGetNGOs({ status });
      setNgos(res.data.data || []);
    } catch {
      setNgos([]);
    }
  };

  const loadActivities = async () => {
    try {
      const res = await adminGetActivities({ status: 'pending' });
      setActivities(res.data.data || []);
    } catch {
      setActivities([]);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await adminGetEvents({ status: 'pending' });
      setEvents(res.data.data || []);
    } catch {
      setEvents([]);
    }
  };

  const loadDonations = async () => {
    try {
      const res = await getDonations();
      setDonations(res.data.data || []);
    } catch {
      setDonations([]);
    }
  };

  const loadContacts = async () => {
    try {
      const res = await getContacts();
      setContacts(res.data.data || []);
    } catch {
      setContacts([]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await getAnalytics();
      setAnalytics(res.data.data);
    } catch { /* ignore */ }
  };

  const loadMedicalData = async () => {
    try {
      const [campaignsRes, statsRes] = await Promise.all([
        adminGetMedicalCampaigns(),
        adminGetMedicalAnalytics(),
      ]);
      setMedicalCampaigns(campaignsRes.data.data || []);
      setMedicalAnalytics(statsRes.data.data || null);
    } catch {
      setMedicalCampaigns([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([
        loadNGOs(),
        loadAnalytics(),
        loadActivities(),
        loadEvents(),
        loadDonations(),
        loadContacts(),
        loadMedicalData(),
      ]);
      setLoading(false);
    };
    init();
  }, []);

  // ─── NGO Handlers ──────────────────────────────────────────────────────────
  const handleStatusChange = async (ngoId, status, reason = '') => {
    setActionLoading((prev) => ({ ...prev, [ngoId]: true }));
    try {
      await updateNGOStatus(ngoId, { status, ...(reason && { rejectionReason: reason }) });
      toast.success(`NGO ${status === 'approved' ? 'Approved & Verified' : 'Rejected'} successfully`);
      await Promise.all([loadNGOs(), loadAnalytics()]);
      setRejectModal(null);
      setViewDetailsModal(null);
      setRejectReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading((prev) => ({ ...prev, [ngoId]: false }));
    }
  };

  const handleActivityStatus = async (activityId, status) => {
    try {
      await updateActivityStatus(activityId, { status });
      toast.success(`Activity ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      await Promise.all([loadActivities(), loadAnalytics()]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update activity');
    }
  };

  const handleEventStatus = async (eventId, status) => {
    try {
      await updateEventStatus(eventId, { status });
      toast.success(`Event ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      await Promise.all([loadEvents(), loadAnalytics()]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update event');
    }
  };

  const handleContactStatus = async (contactId, status) => {
    try {
      await updateContactStatus(contactId, { status });
      toast.success(`Inquiry marked as ${status}`);
      loadContacts();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleExport = async () => {
    try {
      const res = await exportCSV();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `district_ngo_export_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Official NGO CSV data exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  // ─── Medical Assistance Admin Handlers ─────────────────────────────────────
  const handleApproveMedical = async (campaignId) => {
    setActionLoading((p) => ({ ...p, [campaignId]: true }));
    try {
      await adminApproveCampaign(campaignId);
      toast.success('Medical Assistance campaign officially Approved & Verified! Now public.');
      await loadMedicalData();
      setInspectModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading((p) => ({ ...p, [campaignId]: false }));
    }
  };

  const handleRejectMedical = async (e) => {
    e.preventDefault();
    if (!medRejectReason.trim()) {
      toast.error('Please specify the official rejection reason');
      return;
    }
    try {
      await adminRejectCampaign(medRejectModal._id, { rejectionReason: medRejectReason.trim() });
      toast.success('Application marked as Rejected with recorded reason.');
      setMedRejectModal(null);
      setInspectModal(null);
      setMedRejectReason('');
      await loadMedicalData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    }
  };

  const handleRequestDocs = async (e) => {
    e.preventDefault();
    if (!requestDocsText.trim()) {
      toast.error('Please enter the documents requested');
      return;
    }
    try {
      await adminRequestDocuments(requestDocsModal._id, { documentsRequested: requestDocsText.trim() });
      toast.success('Additional documents requested from applicant. Status changed to Under Review.');
      setRequestDocsModal(null);
      setInspectModal(null);
      setRequestDocsText('');
      await loadMedicalData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    }
  };

  const handlePauseMedical = async (e) => {
    e.preventDefault();
    try {
      await adminPauseCampaign(pauseModal._id, { pauseReason: pauseReasonText.trim() });
      toast.success('Campaign paused and hidden from public donation directory.');
      setPauseModal(null);
      setInspectModal(null);
      setPauseReasonText('');
      await loadMedicalData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Pause failed');
    }
  };

  const handleResumeMedical = async (campaignId) => {
    try {
      await adminResumeCampaign(campaignId);
      toast.success('Campaign resumed and is now active in public directory.');
      setInspectModal(null);
      await loadMedicalData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resume failed');
    }
  };

  const switchTab = async (key) => {
    setTab(key);
    if (key === 'medical') {
      await loadMedicalData();
    } else if (key === 'ngos') {
      await loadNGOs(statusFilter);
    } else if (key === 'pending') {
      await loadNGOs('pending');
    } else if (key === 'activities') {
      await loadActivities();
    } else if (key === 'events') {
      await loadEvents();
    } else if (key === 'donations') {
      await loadDonations();
    } else if (key === 'contacts') {
      await loadContacts();
    }
  };

  const switchStatus = async (s) => {
    setStatusFilter(s);
    await loadNGOs(s);
  };

  // Filtered Medical Campaigns for Table
  const filteredMedical = medicalCampaigns.filter((m) => {
    if (medicalFilter !== 'all') {
      if (medicalFilter === 'reported') {
        if (!m.reports || m.reports.length === 0) return false;
      } else if (medicalFilter === 'Paused') {
        if (m.campaignStatus !== 'Paused') return false;
      } else if (m.verificationStatus !== medicalFilter) {
        return false;
      }
    }

    if (!medicalSearch) return true;
    const term = medicalSearch.toLowerCase();
    return (
      m.patientDisplayName?.toLowerCase().includes(term) ||
      m.privatePatientDetails?.fullName?.toLowerCase().includes(term) ||
      m.district?.toLowerCase().includes(term) ||
      m.conditionCategory?.toLowerCase().includes(term) ||
      m.hospitalDetails?.hospitalName?.toLowerCase().includes(term)
    );
  });

  const filteredNGOs = ngos.filter((n) => {
    if (!tableSearch) return true;
    const term = tableSearch.toLowerCase();
    return (
      n.ngoName?.toLowerCase().includes(term) ||
      n.registrationNumber?.toLowerCase().includes(term) ||
      n.serviceRegion?.some((r) => r.toLowerCase().includes(term)) ||
      n.focusAreas?.some((f) => f.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Header */}
      <div className="bg-navy text-white py-8">
        <div className="container-main flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs text-blue-200 mb-2">
              🏛️ District Administration Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Social Welfare Admin Panel</h1>
            <p className="text-blue-200 text-xs mt-1">
              Medical Assistance Verifications, NGO Directory Audit & Direct Donations Ledger
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="export-csv-btn"
              onClick={handleExport}
              className="btn-secondary btn-sm flex items-center gap-2 text-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Authorized Records CSV
            </button>
          </div>
        </div>
      </div>

      <div className="container-main py-8 space-y-6">
        {/* Top Operational Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon="🩺"
            label="Medical Requests"
            value={medicalAnalytics?.totalApplications || medicalCampaigns.length}
            color="bg-red-50 text-red-600"
            subtext={`${medicalAnalytics?.pendingApplications || 0} pending audit`}
          />
          <StatCard
            icon="✅"
            label="Approved Medical Aid"
            value={medicalAnalytics?.approvedCampaigns || 0}
            color="bg-emerald-50 text-emerald-700"
            subtext="Accepting donations"
          />
          <StatCard
            icon="💳"
            label="Confirmed Medical Aid"
            value={`₹${(medicalAnalytics?.totalConfirmedDonations || 0).toLocaleString('en-IN')}`}
            color="bg-purple-50 text-purple-700"
            subtext={`${medicalAnalytics?.successfulTransactionCount || 0} verified transactions`}
          />
          <StatCard
            icon="🏛️"
            label="Verified NGOs"
            value={analytics?.approvedNGOs || 0}
            color="bg-primary-50 text-primary-700"
            subtext={`${analytics?.pendingNGOs || 0} pending audits`}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 bg-gray-100 rounded-xl p-1 flex-wrap text-xs md:text-sm">
          {[
            {
              key: 'medical',
              label: '🩺 Medical Assistance Queue',
              count: (medicalAnalytics?.pendingApplications || 0) + (medicalAnalytics?.underReviewApplications || 0),
            },
            { key: 'pending', label: '⏳ Pending NGO Audits', count: analytics?.pendingNGOs },
            { key: 'activities', label: `📣 Activities (${activities.length})`, count: null },
            { key: 'events', label: `📅 Events (${events.length})`, count: null },
            { key: 'ngos', label: '📋 NGO Records', count: null },
            { key: 'donations', label: `🤝 Donations Ledger (${donations.length})`, count: null },
            { key: 'contacts', label: `✉️ Inquiries (${contacts.filter((c) => c.status === 'new').length} new)`, count: null },
            { key: 'analytics', label: '📊 Sector Analytics', count: null },
          ].map((t) => (
            <button
              key={t.key}
              id={`admin-tab-${t.key}`}
              onClick={() => switchTab(t.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 font-semibold rounded-lg transition-all ${
                tab === t.key ? 'bg-white text-primary-700 shadow-xs' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
              {t.count > 0 && (
                <span className="bg-red-500 text-white rounded-full text-[10px] px-1.5 py-0.5 font-bold">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── TAB: MEDICAL ASSISTANCE MANAGEMENT ────────────────────────── */}
        {tab === 'medical' && (
          <div className="animate-fade-in space-y-5">
            {/* Medical Metrics Cards */}
            {medicalAnalytics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
                <div className="p-3 bg-white rounded-xl border border-gray-100">
                  <div className="text-xl font-bold text-gray-900">{medicalAnalytics.totalApplications}</div>
                  <div className="text-[10px] text-gray-500">Total Cases</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="text-xl font-bold text-amber-900">{medicalAnalytics.pendingApplications}</div>
                  <div className="text-[10px] text-amber-700 font-semibold">Pending</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="text-xl font-bold text-blue-900">{medicalAnalytics.underReviewApplications}</div>
                  <div className="text-[10px] text-blue-700 font-semibold">Under Review</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-xl font-bold text-emerald-900">{medicalAnalytics.approvedCampaigns}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Approved</div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <div className="text-xl font-bold text-red-900">{medicalAnalytics.rejectedApplications}</div>
                  <div className="text-[10px] text-red-700 font-semibold">Rejected</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="text-xl font-bold text-purple-900">{medicalAnalytics.completedCampaigns}</div>
                  <div className="text-[10px] text-purple-700 font-semibold">Completed</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="text-xl font-bold text-orange-900">{medicalAnalytics.reportedCampaigns}</div>
                  <div className="text-[10px] text-orange-700 font-semibold">Reported 🚩</div>
                </div>
              </div>
            )}

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100">
              <div className="flex gap-1.5 flex-wrap text-xs">
                {['Pending', 'Under Review', 'Approved', 'Paused', 'Rejected', 'reported', 'all'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setMedicalFilter(st)}
                    className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors ${
                      medicalFilter === st
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {st === 'all' ? 'All Applications' : st}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search patient, hospital, district..."
                value={medicalSearch}
                onChange={(e) => setMedicalSearch(e.target.value)}
                className="input py-1.5 px-3 text-xs w-full sm:w-64"
              />
            </div>

            {/* Table of Medical Applications */}
            {filteredMedical.length === 0 ? (
              <div className="card p-12 text-center text-gray-400 bg-white border border-gray-100">
                <div className="text-3xl mb-2">🩺</div>
                <p className="text-xs md:text-sm font-medium">No medical assistance requests matching filter.</p>
              </div>
            ) : (
              <div className="card overflow-hidden border border-gray-100 shadow-sm bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
                        <th className="text-left px-5 py-3">Patient & Diagnosis</th>
                        <th className="text-left px-5 py-3">Category & Urgency</th>
                        <th className="text-left px-5 py-3">Hospital & Location</th>
                        <th className="text-left px-5 py-3">Funding Target & Raised</th>
                        <th className="text-left px-5 py-3">Status</th>
                        <th className="text-left px-5 py-3">Docs</th>
                        <th className="text-right px-5 py-3">Verification Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredMedical.map((m) => (
                        <tr key={m._id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-gray-900">{m.patientDisplayName}</div>
                            <div className="text-[11px] text-gray-400">
                              Legal: {m.privatePatientDetails?.fullName || '—'} (Age: {m.privatePatientDetails?.age || '—'})
                            </div>
                            {m.reports?.length > 0 && (
                              <span className="badge bg-red-100 text-red-800 text-[10px] font-bold mt-1">
                                🚩 {m.reports.length} Reports
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="badge bg-blue-50 text-blue-700 text-[10px] block mb-1">
                              {m.conditionCategory}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                              {m.urgency?.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="font-medium text-gray-800 truncate max-w-[160px]">
                              {m.hospitalDetails?.hospitalName || '—'}
                            </div>
                            <div className="text-[11px] text-gray-400">📍 {m.district}</div>
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="font-bold text-primary-700">
                              ₹{Number(m.fundingTarget).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              Raised: ₹{(m.amountRaised || 0).toLocaleString('en-IN')} ({m.progressPercentage || 0}%)
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <VerificationBadge status={m.verificationStatus} />
                            {m.campaignStatus === 'Paused' && (
                              <span className="badge bg-red-100 text-red-800 text-[10px] ml-1">Paused</span>
                            )}
                          </td>

                          <td className="px-5 py-3.5">
                            <span className="badge bg-gray-100 text-gray-700 font-mono text-[10px]">
                              {m.supportingDocuments?.length || 0} files
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setInspectModal(m)}
                                className="px-2.5 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold">
                                Inspect Audit 🔍
                              </button>
                              {m.verificationStatus !== 'Approved' && (
                                <button
                                  onClick={() => handleApproveMedical(m._id)}
                                  className="btn-success btn-sm text-[11px] py-1 px-2.5">
                                  Approve
                                </button>
                              )}
                              {m.verificationStatus !== 'Rejected' && (
                                <button
                                  onClick={() => setMedRejectModal(m)}
                                  className="btn-danger btn-sm text-[11px] py-1 px-2.5">
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: PENDING NGO APPLICATIONS ─────────────────────────────── */}
        {tab === 'pending' && (
          <div className="animate-fade-in space-y-4">
            <h2 className="text-base font-bold text-gray-900">
              Pending NGO Verification Queue ({ngos.filter((n) => n.status === 'pending').length})
            </h2>
            <NGOTable
              ngos={ngos.filter((n) => n.status === 'pending')}
              onApprove={(id) => handleStatusChange(id, 'approved')}
              onReject={(ngo) => setRejectModal(ngo)}
              onViewDetails={(ngo) => setViewDetailsModal(ngo)}
              actionLoading={actionLoading}
              emptyMsg="All submitted NGO applications have been processed! 🎉"
            />
          </div>
        )}

        {/* ─── TAB: ACTIVITIES ───────────────────────────────────────────── */}
        {tab === 'activities' && (
          <div className="animate-fade-in space-y-4">
            <h2 className="text-base font-bold text-gray-900">
              Pending Activity Queue ({activities.length})
            </h2>
            {activities.length === 0 ? (
              <div className="card p-12 text-center text-gray-400 text-xs">No activity updates pending approval.</div>
            ) : (
              <div className="space-y-3">
                {activities.map((act) => (
                  <div key={act._id} className="card p-5 border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{act.title}</span>
                        <span className="badge badge-pending text-[10px]">{act.status}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        🏛️ {act.ngoId?.ngoName || 'NGO'} • {act.ngoId?.registrationNumber || ''} • {new Date(act.date).toLocaleDateString('en-IN')}
                      </div>
                      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">
                        {act.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                      <button onClick={() => handleActivityStatus(act._id, 'approved')} className="btn-success btn-sm text-[11px] py-1">Approve</button>
                      <button onClick={() => handleActivityStatus(act._id, 'rejected')} className="btn-danger btn-sm text-[11px] py-1">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: EVENTS ───────────────────────────────────────────────── */}
        {tab === 'events' && (
          <div className="animate-fade-in space-y-4">
            <h2 className="text-base font-bold text-gray-900">
              Pending Event Queue ({events.length})
            </h2>
            {events.length === 0 ? (
              <div className="card p-12 text-center text-gray-400 text-xs">No events pending approval.</div>
            ) : (
              <div className="space-y-3">
                {events.map((ev) => (
                  <div key={ev._id} className="card p-5 border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{ev.title}</span>
                        <span className="badge badge-pending text-[10px]">{ev.status}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        🏛️ {ev.organizer} • {new Date(ev.date).toLocaleDateString('en-IN')} • {ev.location}
                      </div>
                      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">
                        {ev.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                      <button onClick={() => handleEventStatus(ev._id, 'approved')} className="btn-success btn-sm text-[11px] py-1">Approve</button>
                      <button onClick={() => handleEventStatus(ev._id, 'rejected')} className="btn-danger btn-sm text-[11px] py-1">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: ALL NGOS ─────────────────────────────────────────────── */}
        {tab === 'ngos' && (
          <div className="animate-fade-in space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex gap-1.5 flex-wrap">
                {['approved', 'pending', 'rejected'].map((s) => (
                  <button
                    key={s}
                    id={`filter-${s}`}
                    onClick={() => switchStatus(s)}
                    className={`btn-sm text-xs px-3.5 capitalize font-semibold ${
                      statusFilter === s ? 'btn-primary' : 'btn-secondary'
                    }`}>
                    {s} ({ngos.filter((n) => n.status === s).length || (statusFilter === s ? ngos.length : 0)})
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Search NGO name, reg no, tehsil..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="input py-1.5 px-3 text-xs w-full sm:w-64"
              />
            </div>

            <NGOTable
              ngos={filteredNGOs}
              onApprove={(id) => handleStatusChange(id, 'approved')}
              onReject={(ngo) => setRejectModal(ngo)}
              onViewDetails={(ngo) => setViewDetailsModal(ngo)}
              actionLoading={actionLoading}
              emptyMsg={`No ${statusFilter} NGOs matching search criteria`}
            />
          </div>
        )}

        {/* ─── TAB: DONATIONS LEDGER ─────────────────────────────────────── */}
        {tab === 'donations' && (
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">
                District Welfare & Medical Aid Donations Ledger ({donations.length})
              </h2>
            </div>
            {donations.length === 0 ? (
              <div className="card p-12 text-center text-gray-400 text-xs">No donations logged yet.</div>
            ) : (
              <div className="card overflow-hidden border border-gray-100 shadow-sm bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
                        <th className="text-left px-5 py-3">Donor Name & Contact</th>
                        <th className="text-left px-5 py-3">Channel / Cause</th>
                        <th className="text-left px-5 py-3">Amount / Details</th>
                        <th className="text-left px-5 py-3">Target Beneficiary</th>
                        <th className="text-left px-5 py-3">Order / Txn ID</th>
                        <th className="text-left px-5 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {donations.map((d) => (
                        <tr key={d._id} className="hover:bg-gray-50/70">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-gray-900">
                              {d.isAnonymous ? 'Anonymous Donor' : d.name || 'Anonymous'}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono">
                              {d.phone ? `📞 ${d.phone}` : d.email || '—'}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="badge bg-blue-50 text-blue-700 capitalize text-[10px]">
                              {d.targetType === 'medical_campaign' ? 'Direct Medical' : d.donationType}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {d.amount ? (
                              <span className="font-extrabold text-emerald-800">
                                ₹{Number(d.amount).toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-gray-700">{d.itemDescription || 'In-kind'}</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-gray-800">
                            {d.targetCampaign?.patientDisplayName || d.targetNgoName || 'District Fund'}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-[10px] text-gray-500 truncate max-w-[140px]">
                            {d.providerPaymentId || d.providerOrderId || d.receiptReference || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-gray-400">
                            {new Date(d.createdAt || d.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: CITIZEN INQUIRIES ────────────────────────────────────── */}
        {tab === 'contacts' && (
          <div className="animate-fade-in space-y-4">
            <h2 className="text-base font-bold text-gray-900">
              Citizen Helpdesk & Grievance Messages ({contacts.length})
            </h2>
            {contacts.length === 0 ? (
              <div className="card p-12 text-center text-gray-400 text-xs">No inquiries submitted yet.</div>
            ) : (
              <div className="space-y-3">
                {contacts.map((c) => (
                  <div key={c._id} className="card p-5 border border-gray-100 flex flex-col md:flex-row justify-between gap-4 bg-white">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{c.name}</span>
                        <span className={`badge text-[10px] ${
                          c.status === 'new' ? 'bg-primary-100 text-primary-800' : 'bg-emerald/10 text-emerald-dark'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        ✉️ {c.email} {c.phone && `• 📞 ${c.phone}`} • {new Date(c.createdAt).toLocaleDateString('en-IN')}
                      </div>
                      <div className="text-xs font-semibold text-gray-800 pt-1">Subject: {c.subject}</div>
                      <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">
                        {c.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
                      {c.status !== 'resolved' && (
                        <button
                          onClick={() => handleContactStatus(c._id, 'resolved')}
                          className="btn-success btn-sm text-[11px] py-1">
                          Mark Resolved ✓
                        </button>
                      )}
                      <a
                        href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject || 'District Helpdesk')}`}
                        className="btn-secondary btn-sm text-[11px] py-1">
                        Reply via Email ✉️
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: ANALYTICS ────────────────────────────────────────────── */}
        {tab === 'analytics' && analytics && (
          <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {analytics.byCategory?.length > 0 && (
                <div className="card p-6 border border-gray-100 bg-white">
                  <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">Distribution by Focus Area</h3>
                  <p className="text-xs text-gray-400 mb-5">Number of verified NGOs operating in each sector</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.byCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {analytics.byRegion?.length > 0 && (
                <div className="card p-6 border border-gray-100 bg-white">
                  <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">Regional Geographic Distribution</h3>
                  <p className="text-xs text-gray-400 mb-5">NGO density across tehsils & village clusters</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.byRegion.slice(0, 8)}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}>
                        {analytics.byRegion.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL: INSPECT MEDICAL APPLICATION & SUPPORTING DOCUMENTS ─── */}
      {inspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-glass w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 animate-slide-up space-y-5 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="badge bg-red-50 text-red-700 text-xs mb-1">
                  Official Medical Audit Desk
                </span>
                <h3 className="text-xl font-bold text-gray-900">{inspectModal.patientDisplayName}</h3>
                <div className="text-xs text-gray-500 font-mono">
                  District Ref: {inspectModal._id} • Category: {inspectModal.conditionCategory}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectModal(null)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1">
                ✕
              </button>
            </div>

            {/* Private Patient & Representative Information */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/70 space-y-3">
              <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                Confidential Patient Record
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-gray-400 text-[11px] block">Full Legal Name</span>
                  <span className="font-bold text-gray-900">
                    {inspectModal.privatePatientDetails?.fullName || inspectModal.patientDisplayName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Age</span>
                  <span className="font-medium text-gray-800">
                    {inspectModal.privatePatientDetails?.age || '—'} years
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Patient Phone</span>
                  <span className="font-mono text-gray-800">
                    {inspectModal.privatePatientDetails?.contactPhone || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Emergency Contact</span>
                  <span className="font-mono text-gray-800">
                    {inspectModal.privatePatientDetails?.emergencyContact || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Village / Tehsil</span>
                  <span className="font-medium text-gray-800">
                    {inspectModal.privatePatientDetails?.village || inspectModal.district}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Representative</span>
                  <span className="font-medium text-gray-800">
                    {inspectModal.representative?.name} ({inspectModal.representative?.relationship})
                  </span>
                </div>
              </div>
            </div>

            {/* Medical Summary & Hospital Details */}
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider block mb-1">
                  Diagnosis & Medical Situation
                </span>
                <p className="bg-gray-50 p-3 rounded-xl text-gray-700 leading-relaxed">
                  {inspectModal.medicalSummary}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                <div>
                  <span className="text-gray-400 text-[11px] block">Hospital Name</span>
                  <span className="font-bold text-primary-900">
                    {inspectModal.hospitalDetails?.hospitalName || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Hospital Location</span>
                  <span className="font-medium text-gray-800">
                    {inspectModal.hospitalDetails?.hospitalLocation || inspectModal.district}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Attending Doctor</span>
                  <span className="font-medium text-gray-800">
                    {inspectModal.hospitalDetails?.doctorName || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Total Estimated Cost</span>
                  <span className="font-bold text-gray-900">
                    ₹{Number(inspectModal.hospitalDetails?.estimatedCost || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Aid Requested (Goal)</span>
                  <span className="font-extrabold text-primary-700 text-sm">
                    ₹{Number(inspectModal.fundingTarget).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Already Received</span>
                  <span className="font-medium text-emerald-800">
                    ₹{Number(inspectModal.privatePatientDetails?.amountAlreadyReceived || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Supporting Medical Documents (Secure Download / View Links) */}
            <div className="space-y-2">
              <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider block">
                Submitted Confidential Medical Documents ({inspectModal.supportingDocuments?.length || 0})
              </span>
              {!inspectModal.supportingDocuments || inspectModal.supportingDocuments.length === 0 ? (
                <div className="p-3 bg-gray-50 text-gray-400 rounded-lg text-center text-xs">
                  No supporting documents uploaded.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {inspectModal.supportingDocuments.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg shadow-2xs">
                      <div className="truncate pr-2">
                        <div className="font-bold text-gray-800 truncate">{doc.title}</div>
                        <div className="text-[10px] text-gray-400">
                          {doc.documentType} • {(doc.size / 1024).toFixed(0)} KB
                        </div>
                      </div>
                      <a
                        href={getPrivateDocumentUrl(inspectModal._id, doc._id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-md flex-shrink-0">
                        View / Audit ↗
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons in Modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRequestDocsModal(inspectModal)}
                  className="px-3 py-1.5 border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg font-semibold">
                  Request Documents
                </button>
                {inspectModal.campaignStatus === 'Paused' ? (
                  <button
                    type="button"
                    onClick={() => handleResumeMedical(inspectModal._id)}
                    className="px-3 py-1.5 border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg font-semibold">
                    Resume Campaign
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPauseModal(inspectModal)}
                    className="px-3 py-1.5 border border-orange-200 text-orange-700 hover:bg-orange-50 rounded-lg font-semibold">
                    Pause Campaign
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {inspectModal.verificationStatus !== 'Approved' && (
                  <button
                    type="button"
                    onClick={() => handleApproveMedical(inspectModal._id)}
                    className="btn-success btn-sm text-xs px-4">
                    Approve & Verify
                  </button>
                )}
                {inspectModal.verificationStatus !== 'Rejected' && (
                  <button
                    type="button"
                    onClick={() => setMedRejectModal(inspectModal)}
                    className="btn-danger btn-sm text-xs px-4">
                    Reject Application
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: REJECT MEDICAL APPLICATION ─────────────────────────── */}
      {medRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-glass w-full max-w-md p-6 animate-slide-up space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900">Reject Medical Assistance Application</h3>
            <p className="text-gray-500">
              Specify the official rejection reason for <strong>{medRejectModal.patientDisplayName}</strong>.
            </p>
            <form onSubmit={handleRejectMedical} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="e.g. Inconclusive diagnostic bills, outside jurisdiction, duplicate claim..."
                value={medRejectReason}
                onChange={(e) => setMedRejectReason(e.target.value)}
                className="input text-xs resize-none"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMedRejectModal(null)}
                  className="btn-secondary btn-sm flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-danger btn-sm flex-1">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: REQUEST ADDITIONAL DOCUMENTS ───────────────────────── */}
      {requestDocsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-glass w-full max-w-md p-6 animate-slide-up space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900">Request Additional Documents</h3>
            <p className="text-gray-500">
              Specify missing clinical evidence or updated hospital estimates required from the applicant:
            </p>
            <form onSubmit={handleRequestDocs} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="e.g. Please provide signed hospital estimate letter on hospital letterhead with doctor's registration number..."
                value={requestDocsText}
                onChange={(e) => setRequestDocsText(e.target.value)}
                className="input text-xs resize-none"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestDocsModal(null)}
                  className="btn-secondary btn-sm flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary btn-sm flex-1">
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: PAUSE SUSPICIOUS CAMPAIGN ─────────────────────────── */}
      {pauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-glass w-full max-w-md p-6 animate-slide-up space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900">Pause Medical Campaign</h3>
            <p className="text-gray-500">
              Temporarily halts donations and hides this campaign from the public directory while suspicious
              activity or community reports are reviewed:
            </p>
            <form onSubmit={handlePauseMedical} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="State the audit observation / reason for pausing campaign..."
                value={pauseReasonText}
                onChange={(e) => setPauseReasonText(e.target.value)}
                className="input text-xs resize-none"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPauseModal(null)}
                  className="btn-secondary btn-sm flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-danger btn-sm flex-1 bg-orange-600 hover:bg-orange-700">
                  Pause Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: NGO REJECT (Preserved from original code) ─────────── */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-glass w-full max-w-md p-6 animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Reject NGO Application</h3>
            <p className="text-xs text-gray-500 mb-4">
              Specify the official audit reason for rejecting <strong>{rejectModal.ngoName}</strong>:
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Incomplete registration certificates, outside district jurisdiction..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="input resize-none mb-4 text-xs"
            />
            <div className="flex gap-2.5">
              <button onClick={() => setRejectModal(null)} className="btn-secondary btn-sm flex-1 justify-center">
                Cancel
              </button>
              <button
                id="confirm-reject-btn"
                onClick={() => handleStatusChange(rejectModal._id, 'rejected', rejectReason)}
                className="btn-danger btn-sm flex-1 justify-center">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: VIEW NGO DETAILS (Preserved from original code) ────── */}
      {viewDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setViewDetailsModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-glass w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-slide-up">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
              <div>
                <span className="badge bg-primary-100 text-primary-800 text-xs mb-1">
                  Registration Review
                </span>
                <h3 className="text-xl font-bold text-gray-900">{viewDetailsModal.ngoName}</h3>
                <div className="text-xs text-gray-500 font-mono mt-0.5">
                  Reg No: {viewDetailsModal.registrationNumber}
                </div>
              </div>
              <button onClick={() => setViewDetailsModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Organizational Mission
                </label>
                <p className="text-gray-700 text-xs md:text-sm bg-gray-50 p-3 rounded-xl leading-relaxed">
                  {viewDetailsModal.description || 'No description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Core Focus Areas
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {viewDetailsModal.focusAreas?.map((a) => (
                      <span key={a} className="badge bg-blue-50 text-blue-700 text-xs">{a}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Service Talukas / Villages
                  </label>
                  <div className="text-xs text-gray-700 font-medium">
                    {viewDetailsModal.serviceRegion?.join(', ') || '—'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-100">
              <Link
                to={`/ngos/${viewDetailsModal._id}`}
                target="_blank"
                className="text-xs text-primary-600 hover:underline font-semibold flex items-center gap-1">
                Open Public Profile ↗
              </Link>
              <div className="flex gap-2">
                {viewDetailsModal.status !== 'approved' && (
                  <button
                    onClick={() => handleStatusChange(viewDetailsModal._id, 'approved')}
                    className="btn-success btn-sm text-xs">
                    Approve & Verify
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: NGOTable (Preserved from original code)
const NGOTable = ({ ngos, onApprove, onReject, onViewDetails, actionLoading, emptyMsg }) => {
  if (!ngos?.length) {
    return (
      <div className="card p-12 text-center text-gray-400 border border-gray-100 bg-white">
        <div className="text-3xl mb-2">🏛️</div>
        <p className="font-medium text-xs md:text-sm">{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden border border-gray-100 shadow-sm bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
              <th className="text-left px-5 py-3">NGO Name & Reg No</th>
              <th className="text-left px-5 py-3">Focus Areas</th>
              <th className="text-left px-5 py-3">Talukas</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Date</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ngos.map((ngo) => (
              <tr key={ngo._id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-bold text-gray-900">{ngo.ngoName}</div>
                  <div className="text-[11px] text-gray-400 font-mono">{ngo.registrationNumber}</div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {ngo.focusAreas?.slice(0, 2).map((a) => (
                      <span key={a} className="badge bg-blue-50 text-blue-700 text-[10px]">{a}</span>
                    ))}
                    {ngo.focusAreas?.length > 2 && (
                      <span className="badge bg-gray-100 text-gray-500 text-[10px]">+{ngo.focusAreas.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-600 text-xs">
                  {ngo.serviceRegion?.slice(0, 2).join(', ')}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`badge capitalize text-[11px] ${
                    ngo.status === 'approved' ? 'badge-approved' : ngo.status === 'pending' ? 'badge-pending' : 'badge-rejected'
                  }`}>
                    {ngo.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                  {new Date(ngo.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </td>
                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onViewDetails(ngo)}
                      className="px-2.5 py-1 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold">
                      Inspect
                    </button>
                    {ngo.status !== 'approved' && (
                      <button
                        onClick={() => onApprove(ngo._id)}
                        disabled={actionLoading[ngo._id]}
                        className="btn-success btn-sm text-xs py-1">
                        Approve
                      </button>
                    )}
                    {ngo.status !== 'rejected' && (
                      <button
                        onClick={() => onReject(ngo)}
                        disabled={actionLoading[ngo._id]}
                        className="btn-danger btn-sm text-xs py-1">
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
