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
} from '../services/api';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6b7280'];

const StatCard = ({ icon, label, value, color, subtext }) => (
  <div className="card p-5 flex items-center gap-4">
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
  const [tab, setTab] = useState('pending');
  const [ngos, setNgos] = useState([]);
  const [donations, setDonations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
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

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadNGOs(), loadAnalytics(), loadDonations(), loadContacts()]);
      setLoading(false);
    };
    init();
  }, []);

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

  const switchTab = async (key) => {
    setTab(key);
    if (key === 'ngos') {
      await loadNGOs(statusFilter);
    } else if (key === 'pending') {
      await loadNGOs('pending');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-navy text-white py-8">
        <div className="container-main flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs text-blue-200 mb-2">
              🏛️ District Administration Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Social Welfare Admin Panel</h1>
            <p className="text-blue-200 text-xs mt-1">Verification Workflow, Donations Ledger & Sector Analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="export-csv-btn"
              onClick={handleExport}
              className="btn-secondary btn-sm flex items-center gap-2 text-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV Dataset
            </button>
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Stats Grid */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon="🏛️" label="Total Registered" value={analytics.totalNGOs} color="bg-primary-50 text-primary-700" subtext="All applications" />
            <StatCard icon="✅" label="Approved & Verified" value={analytics.approvedNGOs} color="bg-emerald/10 text-emerald-dark" subtext="Publicly searchable" />
            <StatCard icon="⏳" label="Pending Audits" value={analytics.pendingNGOs} color="bg-amber/10 text-amber-dark" subtext="Requires nodal action" />
            <StatCard icon="🤝" label="Total Donations" value={donations.length} color="bg-purple-50 text-purple-700" subtext="Contributions logged" />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 mb-6 bg-gray-100 rounded-xl p-1 flex-wrap">
          {[
            { key: 'pending', label: '⏳ Pending Applications', count: analytics?.pendingNGOs },
            { key: 'ngos', label: '📋 All NGO Records', count: null },
            { key: 'donations', label: `🤝 Donations Ledger (${donations.length})`, count: null },
            { key: 'contacts', label: `✉️ Inquiries (${contacts.filter((c) => c.status === 'new').length} new)`, count: null },
            { key: 'analytics', label: '📊 Sector Analytics', count: null },
          ].map((t) => (
            <button
              key={t.key}
              id={`admin-tab-${t.key}`}
              onClick={() => switchTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                tab === t.key ? 'bg-white text-primary-700 shadow-xs' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
              {t.count > 0 && (
                <span className="bg-amber text-white rounded-full text-[10px] px-1.5 py-0.5 font-bold">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Pending Approvals */}
        {tab === 'pending' && (
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">
                Pending Verification Queue ({ngos.filter((n) => n.status === 'pending').length})
              </h2>
            </div>
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

        {/* Tab 2: All NGOs */}
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

        {/* Tab 3: Donations Ledger (from NGO-master) */}
        {tab === 'donations' && (
          <div className="animate-fade-in space-y-4">
            <h2 className="text-base font-bold text-gray-900">
              Public & CSR Community Donations ({donations.length})
            </h2>
            {donations.length === 0 ? (
              <div className="card p-12 text-center text-gray-400 text-xs">No donations logged yet.</div>
            ) : (
              <div className="card overflow-hidden border border-gray-100 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
                        <th className="text-left px-5 py-3">Donor Name & Contact</th>
                        <th className="text-left px-5 py-3">Type</th>
                        <th className="text-left px-5 py-3">Amount / Details</th>
                        <th className="text-left px-5 py-3">Beneficiary Fund / NGO</th>
                        <th className="text-left px-5 py-3">Location</th>
                        <th className="text-left px-5 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {donations.map((d) => (
                        <tr key={d._id} className="hover:bg-gray-50/70">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-gray-900">{d.name}</div>
                            <div className="text-[11px] text-gray-400 font-mono">📞 {d.phone}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="badge bg-blue-50 text-blue-700 capitalize text-[10px]">
                              {d.donationType}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {d.amount ? (
                              <span className="font-bold text-emerald-dark">₹{d.amount.toLocaleString('en-IN')}</span>
                            ) : (
                              <span className="text-gray-700">{d.itemDescription || 'In-kind supply'}</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-gray-800">
                            {d.targetNgoName || 'District Welfare Fund'}
                          </td>
                          <td className="px-5 py-3.5 text-gray-600">{d.location}</td>
                          <td className="px-5 py-3.5 text-gray-400">
                            {new Date(d.createdAt || d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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

        {/* Tab 4: Citizen Inquiries (from NGO-master) */}
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
                  <div key={c._id} className="card p-5 border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
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

        {/* Tab 5: Analytics */}
        {tab === 'analytics' && analytics && (
          <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Chart */}
              {analytics.byCategory?.length > 0 ? (
                <div className="card p-6 border border-gray-100">
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
              ) : (
                <div className="card p-8 text-center text-gray-400 text-xs">No category data yet.</div>
              )}

              {/* Region Pie Chart */}
              {analytics.byRegion?.length > 0 ? (
                <div className="card p-6 border border-gray-100">
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
                        labelLine={false}
                      >
                        {analytics.byRegion.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="card p-8 text-center text-gray-400 text-xs">No region data yet.</div>
              )}
            </div>

            {/* Status Breakdown Grid */}
            <div className="card p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Application Status Breakdown</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-emerald/10 rounded-xl border border-emerald/20">
                  <div className="text-2xl md:text-3xl font-extrabold text-emerald-dark">{analytics.approvedNGOs}</div>
                  <div className="text-xs font-semibold text-gray-700 mt-1">Verified NGOs</div>
                </div>
                <div className="p-4 bg-amber/10 rounded-xl border border-amber/20">
                  <div className="text-2xl md:text-3xl font-extrabold text-amber-dark">{analytics.pendingNGOs}</div>
                  <div className="text-xs font-semibold text-gray-700 mt-1">Pending Review</div>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="text-2xl md:text-3xl font-extrabold text-red-600">{analytics.rejectedNGOs}</div>
                  <div className="text-xs font-semibold text-gray-700 mt-1">Rejected / Inactive</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View NGO Details Modal */}
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
              <button
                onClick={() => setViewDetailsModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-400">Official Contact Email</div>
                  <div className="font-medium text-gray-800 text-xs break-all">{viewDetailsModal.contactEmail || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Phone Number</div>
                  <div className="font-medium text-gray-800 text-xs">{viewDetailsModal.contactPhone || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Website</div>
                  <div className="font-medium text-primary-700 text-xs break-all">
                    {viewDetailsModal.website ? (
                      <a href={viewDetailsModal.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {viewDetailsModal.website}
                      </a>
                    ) : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Registered Office Address</div>
                  <div className="font-medium text-gray-800 text-xs">{viewDetailsModal.address || '—'}</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
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
                {viewDetailsModal.status !== 'rejected' && (
                  <button
                    onClick={() => {
                      const tgt = viewDetailsModal;
                      setViewDetailsModal(null);
                      setRejectModal(tgt);
                    }}
                    className="btn-danger btn-sm text-xs">
                    Reject Application
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setRejectModal(null)} />
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
    </div>
  );
};

// Sub-component: NGOTable
const NGOTable = ({ ngos, onApprove, onReject, onViewDetails, actionLoading, emptyMsg }) => {
  if (!ngos?.length) {
    return (
      <div className="card p-12 text-center text-gray-400 border border-gray-100">
        <div className="text-3xl mb-2">🏛️</div>
        <p className="font-medium text-xs md:text-sm">{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden border border-gray-100 shadow-sm">
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
                        id={`approve-${ngo._id}`}
                        onClick={() => onApprove(ngo._id)}
                        disabled={actionLoading[ngo._id]}
                        className="btn-success btn-sm text-[11px] py-1 px-2.5">
                        Approve
                      </button>
                    )}
                    {ngo.status !== 'rejected' && (
                      <button
                        id={`reject-${ngo._id}`}
                        onClick={() => onReject(ngo)}
                        disabled={actionLoading[ngo._id]}
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
  );
};

export default AdminDashboard;
