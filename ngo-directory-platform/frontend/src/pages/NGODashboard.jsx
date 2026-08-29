import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getMyNGO, updateNGO, createActivity, getActivities, getInbox, updateConnectStatus } from '../services/api';
import ActivityFeed from '../components/ActivityFeed';

const FOCUS_AREAS = [
  'Education', 'Health', 'Environment', 'Women Empowerment',
  'Child Welfare', 'Rural Development', 'Livelihood',
  'Disaster Relief', 'Animal Welfare', 'Other',
];

const STATUS_STYLES = {
  approved: 'badge-approved',
  pending: 'badge-pending',
  rejected: 'badge-rejected',
};

const NGODashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');
  const [ngo, setNgo] = useState(null);
  const [activities, setActivities] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({});
  const [profileSaving, setProfileSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  // Post activity state
  const [actForm, setActForm] = useState({
    title: '', description: '', date: '', beneficiaryCount: '', category: '',
  });
  const [actImages, setActImages] = useState([]);
  const [actSaving, setActSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const ngoRes = await getMyNGO();
        setNgo(ngoRes.data.data);
        setProfileForm({
          ngoName: ngoRes.data.data.ngoName || '',
          description: ngoRes.data.data.description || '',
          address: ngoRes.data.data.address || '',
          contactEmail: ngoRes.data.data.contactEmail || '',
          contactPhone: ngoRes.data.data.contactPhone || '',
          website: ngoRes.data.data.website || '',
          focusAreas: ngoRes.data.data.focusAreas || [],
          serviceRegion: (ngoRes.data.data.serviceRegion || []).join(', '),
        });
        const [actRes, inboxRes] = await Promise.all([
          getActivities(ngoRes.data.data._id),
          getInbox(),
        ]);
        setActivities(actRes.data.data || []);
        setInbox(inboxRes.data.data || []);
      } catch {
        /* no NGO profile yet */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleArea = (area) => {
    setProfileForm((f) => ({
      ...f,
      focusAreas: f.focusAreas.includes(area)
        ? f.focusAreas.filter((a) => a !== area)
        : [...f.focusAreas, area],
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const fd = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => {
        if (k === 'focusAreas') fd.append('focusAreas', JSON.stringify(v));
        else fd.append(k, v);
      });
      if (logoFile) fd.append('logo', logoFile);
      const res = await updateNGO(ngo._id, fd);
      setNgo(res.data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePostActivity = async (e) => {
    e.preventDefault();
    setActSaving(true);
    try {
      const fd = new FormData();
      Object.entries(actForm).forEach(([k, v]) => fd.append(k, v));
      actImages.forEach((img) => fd.append('images', img));
      const res = await createActivity(ngo._id, fd);
      setActivities((prev) => [res.data.data, ...prev]);
      setActForm({ title: '', description: '', date: '', beneficiaryCount: '', category: '' });
      setActImages([]);
      toast.success('Activity posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post activity');
    } finally {
      setActSaving(false);
    }
  };

  const markRead = async (reqId) => {
    try {
      await updateConnectStatus(reqId, { status: 'read' });
      setInbox((prev) => prev.map((r) => r._id === reqId ? { ...r, status: 'read' } : r));
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  const tabs = [
    { key: 'profile', label: '📝 Profile', count: null },
    { key: 'activities', label: '📋 Activities', count: activities.length },
    { key: 'post', label: '➕ Post Update', count: null },
    { key: 'inbox', label: '📬 Inbox', count: inbox.filter((r) => r.status === 'sent').length || null },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-navy text-white py-8">
        <div className="container-main">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">{ngo?.ngoName || 'My NGO Dashboard'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-blue-200 text-sm">Welcome, {user?.name}</span>
                {ngo && (
                  <span className={`badge ${STATUS_STYLES[ngo.status] || 'badge-pending'} capitalize`}>
                    {ngo.status}
                  </span>
                )}
              </div>
            </div>
            {ngo?.status === 'pending' && (
              <div className="bg-amber/20 border border-amber/40 rounded-xl px-4 py-2 text-amber-light text-sm">
                ⏳ Pending admin approval — your NGO will be publicly listed once approved.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 rounded-xl p-1 flex-wrap">
          {tabs.map((t) => (
            <button key={t.key}
              id={`tab-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                tab === t.key ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
              {t.count > 0 && (
                <span className="bg-primary-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="card p-6 max-w-3xl animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Edit NGO Profile</h2>
            <form onSubmit={handleSaveProfile} className="space-y-5" id="edit-profile-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">NGO Name *</label>
                  <input type="text" required value={profileForm.ngoName}
                    onChange={(e) => setProfileForm((f) => ({ ...f, ngoName: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="label">Service Region (comma-separated)</label>
                  <input type="text" value={profileForm.serviceRegion}
                    onChange={(e) => setProfileForm((f) => ({ ...f, serviceRegion: e.target.value }))} className="input" />
                </div>
              </div>

              <div>
                <label className="label">Focus Areas</label>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_AREAS.map((area) => (
                    <button key={area} type="button" onClick={() => toggleArea(area)}
                      className={`badge text-sm px-3 py-1.5 transition-all ${
                        profileForm.focusAreas?.includes(area)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea rows={4} value={profileForm.description}
                  onChange={(e) => setProfileForm((f) => ({ ...f, description: e.target.value }))}
                  className="input resize-none" placeholder="Describe your NGO's mission..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Contact Email</label>
                  <input type="email" value={profileForm.contactEmail}
                    onChange={(e) => setProfileForm((f) => ({ ...f, contactEmail: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="label">Contact Phone</label>
                  <input type="tel" value={profileForm.contactPhone}
                    onChange={(e) => setProfileForm((f) => ({ ...f, contactPhone: e.target.value }))} className="input" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Website</label>
                  <input type="url" value={profileForm.website}
                    onChange={(e) => setProfileForm((f) => ({ ...f, website: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="label">Address</label>
                  <input type="text" value={profileForm.address}
                    onChange={(e) => setProfileForm((f) => ({ ...f, address: e.target.value }))} className="input" />
                </div>
              </div>

              <div>
                <label className="label">Update Logo (max 2MB)</label>
                <input type="file" accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer" />
              </div>

              <button type="submit" disabled={profileSaving} className="btn-primary">
                {profileSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Activities tab */}
        {tab === 'activities' && (
          <div className="max-w-3xl animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Activity & Impact Feed</h2>
            <ActivityFeed activities={activities} />
          </div>
        )}

        {/* Post activity tab */}
        {tab === 'post' && (
          <div className="card p-6 max-w-3xl animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Post Activity / Impact Update</h2>
            <form onSubmit={handlePostActivity} id="post-activity-form" className="space-y-5">
              <div>
                <label className="label">Activity Title *</label>
                <input type="text" required placeholder="e.g. Free Health Camp in Nashik"
                  value={actForm.title}
                  onChange={(e) => setActForm((f) => ({ ...f, title: e.target.value }))} className="input" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Date *</label>
                  <input type="date" required value={actForm.date}
                    onChange={(e) => setActForm((f) => ({ ...f, date: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="label">Beneficiaries Reached</label>
                  <input type="number" min={0} placeholder="e.g. 500"
                    value={actForm.beneficiaryCount}
                    onChange={(e) => setActForm((f) => ({ ...f, beneficiaryCount: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select value={actForm.category}
                    onChange={(e) => setActForm((f) => ({ ...f, category: e.target.value }))} className="select">
                    <option value="">Select…</option>
                    {FOCUS_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Description *</label>
                <textarea rows={4} required placeholder="Describe the activity and its impact..."
                  value={actForm.description}
                  onChange={(e) => setActForm((f) => ({ ...f, description: e.target.value }))}
                  className="input resize-none" />
              </div>

              <div>
                <label className="label">Photos (max 5, 2MB each)</label>
                <input type="file" accept="image/*" multiple
                  onChange={(e) => setActImages(Array.from(e.target.files).slice(0, 5))}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer" />
              </div>

              <button type="submit" disabled={actSaving} className="btn-primary" id="post-activity-btn">
                {actSaving ? 'Posting…' : 'Post Activity'}
              </button>
            </form>
          </div>
        )}

        {/* Inbox tab */}
        {tab === 'inbox' && (
          <div className="max-w-3xl animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Connect Requests Inbox
              {inbox.filter((r) => r.status === 'sent').length > 0 && (
                <span className="ml-2 badge bg-primary-600 text-white">{inbox.filter((r) => r.status === 'sent').length} new</span>
              )}
            </h2>
            {inbox.length === 0 ? (
              <div className="card p-12 text-center text-gray-400">
                <div className="text-4xl mb-3">📬</div>
                <p className="font-medium">No connect requests yet.</p>
                <p className="text-sm mt-1">When donors or volunteers reach out, they'll appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inbox.map((req) => (
                  <div key={req._id}
                    className={`card p-5 transition-all ${req.status === 'sent' ? 'border-l-4 border-l-primary-500' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{req.senderName || req.fromUserId?.name}</span>
                          <span className={`badge capitalize ${req.senderRole === 'donor' ? 'badge-approved' : 'badge-category'}`}>
                            {req.senderRole || req.fromUserId?.role}
                          </span>
                          {req.status === 'sent' && (
                            <span className="badge bg-primary-100 text-primary-700">New</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{req.senderEmail || req.fromUserId?.email}</p>
                        <p className="text-gray-700 text-sm leading-relaxed">{req.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      {req.status === 'sent' && (
                        <button onClick={() => markRead(req._id)}
                          className="btn-secondary btn-sm whitespace-nowrap text-xs">
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NGODashboard;
