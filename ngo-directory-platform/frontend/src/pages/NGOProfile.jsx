import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getNGOById } from '../services/api';
import ActivityFeed from '../components/ActivityFeed';
import ConnectButton from '../components/ConnectButton';
import NGOMap from '../components/NGOMap';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

const CATEGORY_COLORS = {
  'Education': 'bg-blue-50 text-blue-700 border-blue-200',
  'Health': 'bg-red-50 text-red-700 border-red-200',
  'Environment': 'bg-green-50 text-green-700 border-green-200',
  'Women Empowerment': 'bg-pink-50 text-pink-700 border-pink-200',
  'Child Welfare': 'bg-purple-50 text-purple-700 border-purple-200',
  'Rural Development': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Livelihood': 'bg-orange-50 text-orange-700 border-orange-200',
  'Disaster Relief': 'bg-rose-50 text-rose-700 border-rose-200',
  'Animal Welfare': 'bg-teal-50 text-teal-700 border-teal-200',
  'Other': 'bg-gray-50 text-gray-700 border-gray-200',
};

const NGOProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ngo, setNgo] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getNGOById(id);
        setNgo(res.data.data);
        setActivities(res.data.data.activities || []);
      } catch {
        setNgo(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('NGO Profile link copied to clipboard! 📋');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  if (!ngo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🏛️</div>
        <h2 className="text-xl font-bold text-gray-700">NGO profile not found</h2>
        <p className="text-gray-500 text-sm">This organization may be pending verification or deactivated.</p>
        <Link to="/" className="btn-primary">Back to Directory</Link>
      </div>
    );
  }

  const logoSrc = ngo.logoUrl
    ? ngo.logoUrl.startsWith('http') ? ngo.logoUrl : `${API_BASE}${ngo.logoUrl}`
    : null;

  const isOwner = user?.role === 'ngo' && user?.ngoId === ngo._id;
  const totalBeneficiaries = activities.reduce((sum, a) => sum + (Number(a.beneficiaryCount) || 0), 0);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-navy-dark via-navy to-primary-900 text-white">
        <div className="container-main py-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to District Directory
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-blue-100 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Profile
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Logo */}
            <div className="w-24 h-24 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-glass">
              {logoSrc ? (
                <img src={logoSrc} alt={ngo.ngoName} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{ngo.ngoName}</h1>
                {ngo.status === 'approved' ? (
                  <span className="badge bg-emerald/20 text-emerald-light border border-emerald/30 text-xs px-2.5 py-1">
                    ✓ Verified District NGO
                  </span>
                ) : (
                  <span className="badge bg-amber/20 text-amber-light border border-amber/30 text-xs px-2.5 py-1">
                    ⏳ Pending Verification
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-blue-200 text-sm">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {ngo.serviceRegion?.join(', ')}
                </span>
                <span className="text-blue-300/60">•</span>
                <span className="text-blue-100 font-mono text-xs">
                  Reg: {ngo.registrationNumber}
                </span>
              </div>
            </div>

            {isOwner && (
              <Link to="/dashboard" className="btn-secondary btn-sm">
                ⚙️ Manage Dashboard
              </Link>
            )}
          </div>

          {/* Focus area chips */}
          <div className="flex flex-wrap gap-2 mt-6">
            {ngo.focusAreas?.map((area) => (
              <span key={area} className={`badge border ${CATEGORY_COLORS[area] || CATEGORY_COLORS['Other']}`}>
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Impact Quick Metrics Bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container-main py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-x divide-gray-100">
            <div>
              <div className="text-xl font-bold text-primary-700">{activities.length}</div>
              <div className="text-xs text-gray-500">Documented Projects</div>
            </div>
            <div>
              <div className="text-xl font-bold text-emerald-dark">{totalBeneficiaries.toLocaleString('en-IN')}</div>
              <div className="text-xs text-gray-500">Beneficiaries Reached</div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">{ngo.serviceRegion?.length || 0}</div>
              <div className="text-xs text-gray-500">Covered Regions / Villages</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-700">{ngo.focusAreas?.length || 0}</div>
              <div className="text-xs text-gray-500">Core Impact Domains</div>
            </div>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="container-main py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* Connect CTA */}
            {ngo.status === 'approved' && user?.role !== 'ngo' && user?.role !== 'admin' && (
              <div className="card p-5 border-t-4 border-t-primary-600">
                <h3 className="font-bold text-gray-900 mb-1">Collaborate / Support</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Send a direct proposal, CSR collaboration request, or volunteer application to this NGO.
                </p>
                <ConnectButton ngoId={ngo._id} ngoName={ngo.ngoName} />
              </div>
            )}

            {/* Quick Contact Info */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                <span>Contact & Office Details</span>
                <span className="text-xs text-gray-400 font-normal">Official</span>
              </h3>
              <div className="space-y-3.5 text-sm">
                {ngo.registrationNumber && (
                  <div className="flex items-start gap-2.5">
                    <span className="text-gray-400 mt-0.5">📋</span>
                    <div>
                      <div className="text-xs text-gray-400">Govt. Registration No.</div>
                      <div className="font-semibold text-gray-800 font-mono text-xs">{ngo.registrationNumber}</div>
                    </div>
                  </div>
                )}
                {ngo.contactEmail && (
                  <div className="flex items-start gap-2.5">
                    <span className="text-gray-400 mt-0.5">✉️</span>
                    <div>
                      <div className="text-xs text-gray-400">Official Email</div>
                      <a href={`mailto:${ngo.contactEmail}`} className="font-medium text-primary-700 hover:underline break-all">
                        {ngo.contactEmail}
                      </a>
                    </div>
                  </div>
                )}
                {ngo.contactPhone && (
                  <div className="flex items-start gap-2.5">
                    <span className="text-gray-400 mt-0.5">📞</span>
                    <div>
                      <div className="text-xs text-gray-400">Phone / Helpline</div>
                      <a href={`tel:${ngo.contactPhone}`} className="font-medium text-primary-700 hover:underline">
                        {ngo.contactPhone}
                      </a>
                    </div>
                  </div>
                )}
                {ngo.website && (
                  <div className="flex items-start gap-2.5">
                    <span className="text-gray-400 mt-0.5">🌐</span>
                    <div>
                      <div className="text-xs text-gray-400">Official Website</div>
                      <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-700 hover:underline break-all flex items-center gap-1">
                        {ngo.website.replace(/^https?:\/\//, '')}
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
                {ngo.address && (
                  <div className="flex items-start gap-2.5">
                    <span className="text-gray-400 mt-0.5">📍</span>
                    <div>
                      <div className="text-xs text-gray-400">Registered Office Address</div>
                      <div className="font-medium text-gray-800 leading-snug">{ngo.address}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Channels */}
            {(ngo.socialLinks?.facebook || ngo.socialLinks?.instagram || ngo.socialLinks?.twitter) && (
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Verified Social Media Handles</h3>
                <div className="space-y-2 text-sm">
                  {ngo.socialLinks?.facebook && (
                    <a href={ngo.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 text-blue-700 transition-colors">
                      <span className="text-base">📘</span> Facebook Page
                    </a>
                  )}
                  {ngo.socialLinks?.instagram && (
                    <a href={ngo.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-pink-50 text-pink-600 transition-colors">
                      <span className="text-base">📸</span> Instagram Profile
                    </a>
                  )}
                  {ngo.socialLinks?.twitter && (
                    <a href={ngo.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-sky-50 text-sky-600 transition-colors">
                      <span className="text-base">🐦</span> Twitter/X Updates
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Verification Trust Seal */}
            <div className="card p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">District Verified Record</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    This organization’s legal registration and operational mandate have been authenticated by the District Social Welfare Nodal Office.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Navigation Tabs */}
            <div className="flex gap-1.5 mb-6 bg-gray-100 rounded-xl p-1 flex-wrap">
              {[
                { key: 'about', label: '📖 Mission & Overview' },
                { key: 'activities', label: `📋 Impact Projects (${activities.length})` },
                { key: 'map', label: '🗺️ Map & Coverage' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 px-3 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: About */}
            {activeTab === 'about' && (
              <div className="space-y-6 animate-fade-in">
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">About {ngo.ngoName}</h2>
                  {ngo.description ? (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                      {ngo.description}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic text-sm">No detailed description has been published yet.</p>
                  )}
                </div>

                {/* Focus Areas Detail Grid */}
                <div className="card p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Core Operational Domains</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ngo.focusAreas?.map((area) => (
                      <div key={area} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/70 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                          🎯
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{area}</div>
                          <div className="text-xs text-gray-500">Active district programs</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Service Regions Detail */}
                <div className="card p-6">
                  <h3 className="font-bold text-gray-900 mb-3">Target Beneficiary Geographies</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    The following tehsils, villages, and rural pockets are directly served by this NGO:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ngo.serviceRegion?.map((region) => (
                      <span key={region} className="badge bg-primary-50 text-primary-800 border border-primary-100 text-xs px-3 py-1">
                        📍 {region}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Activities */}
            {activeTab === 'activities' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Project Updates & Field Activities</h2>
                  <span className="text-xs text-gray-500 font-medium">Chronological record</span>
                </div>
                <ActivityFeed activities={activities} />
              </div>
            )}

            {/* Tab 3: Map & Coverage */}
            {activeTab === 'map' && (
              <div className="space-y-6 animate-fade-in">
                <NGOMap ngo={ngo} />

                <div className="card p-6">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">District Welfare Coordination Guidelines</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    To avoid duplication of welfare resources, all CSR donors and partner agencies planning field activities in <strong className="text-gray-800">{ngo.serviceRegion?.join(', ')}</strong> are encouraged to coordinate with {ngo.ngoName} or the District Social Welfare Department.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGOProfile;
