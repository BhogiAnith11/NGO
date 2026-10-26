import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MedicalAssistanceCard from '../components/medical/MedicalAssistanceCard';
import DonationForm from '../components/donations/DonationForm';
import { getPublicCampaigns } from '../services/medicalAssistanceService';

const CATEGORIES = [
  'All Categories',
  'Pediatric Care',
  'Cancer Treatment',
  'Surgery',
  'Accident & Trauma',
  'Organ Transplant',
  'Critical Care',
  'Chronic Illness',
];

const EmergencyAssistance = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonationCampaign, setSelectedDonationCampaign] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    category: 'All Categories',
    district: '',
    urgency: '',
    status: 'Active',
    progress: '',
    sortBy: 'newest',
  });

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...(filters.search && { search: filters.search }),
        ...(filters.category !== 'All Categories' && { category: filters.category }),
        ...(filters.district && { district: filters.district }),
        ...(filters.urgency && { urgency: filters.urgency }),
        ...(filters.status && { status: filters.status }),
        ...(filters.progress && { progress: filters.progress }),
        sortBy: filters.sortBy,
      };

      const res = await getPublicCampaigns(params);
      setCampaigns(res.data.data || []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchCampaigns, 300);
    return () => clearTimeout(timer);
  }, [fetchCampaigns]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All Categories',
      district: '',
      urgency: '',
      status: 'Active',
      progress: '',
      sortBy: 'newest',
    });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* 1. Hero Header */}
      <section className="bg-gradient-to-br from-navy-dark via-navy to-primary-900 text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-10 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-primary-400 rounded-full blur-3xl" />
        </div>

        <div className="container-main relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3.5 py-1 mb-4 border border-white/20 text-xs">
              <span className="text-red-400 font-bold">🚨 Emergency Health Desk</span>
              <span className="text-blue-200">• 100% Verified Medical Documents</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Emergency Medical Assistance & Direct Patient Aid
            </h1>
            <p className="text-blue-100/90 text-sm md:text-base leading-relaxed mb-6 font-light">
              Connect directly with injured citizens, children, and families facing life-threatening medical
              crises. Every campaign is authenticated against hospital estimates and nodal medical audits before public listing.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/medical-assistance/new" className="btn-primary text-xs md:text-sm px-5 py-2.5 shadow-md">
                Request Medical Assistance →
              </Link>
              <a href="#directory" className="btn-secondary text-xs md:text-sm px-5 py-2.5">
                Browse Verified Patients
              </a>
            </div>

            <div className="mt-6 flex items-center gap-6 text-[11px] text-blue-200/80">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Razorpay Direct Online Payments
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-300" /> Private Document Protection
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400" /> Real-time Progress Tracking
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filters & Directory Section */}
      <section id="directory" className="flex-1 py-10 scroll-mt-6">
        <div className="container-main space-y-6">
          {/* Filter Bar */}
          <div className="card p-5 border border-gray-200/80 bg-white shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Search input */}
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search patient, illness, hospital..."
                  value={filters.search}
                  onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                  className="input pl-9 text-xs"
                />
              </div>

              {/* Category dropdown */}
              <div>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
                  className="input text-xs font-medium">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* District input */}
              <div>
                <input
                  type="text"
                  placeholder="District / Tehsil (e.g. Nashik)"
                  value={filters.district}
                  onChange={(e) => setFilters((p) => ({ ...p, district: e.target.value }))}
                  className="input text-xs"
                />
              </div>

              {/* Urgency dropdown */}
              <div>
                <select
                  value={filters.urgency}
                  onChange={(e) => setFilters((p) => ({ ...p, urgency: e.target.value }))}
                  className="input text-xs">
                  <option value="">All Urgency Levels</option>
                  <option value="life_threatening">Life Threatening (Immediate)</option>
                  <option value="critical">Critical (ICU / Surgery)</option>
                  <option value="urgent">Urgent</option>
                  <option value="routine">Routine Care</option>
                </select>
              </div>
            </div>

            {/* Secondary Controls: Sorting, Status, Progress */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-400 text-[11px] font-semibold">Status:</span>
                {['Active', 'Goal Reached', 'Completed'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, status: p.status === s ? '' : s }))}
                    className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-colors ${
                      filters.status === s
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}>
                    {s}
                  </button>
                ))}

                <span className="text-gray-400 text-[11px] font-semibold ml-2">Progress:</span>
                {[
                  { key: '', label: 'All' },
                  { key: 'under_50', label: '<50%' },
                  { key: '50_plus', label: '50%+' },
                  { key: 'completed', label: '100% Funded' },
                ].map((pr) => (
                  <button
                    key={pr.key}
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, progress: pr.key }))}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      filters.progress === pr.key
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}>
                    {pr.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-[11px] font-semibold">Sort:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value }))}
                  className="input py-1 px-2 text-xs w-auto">
                  <option value="newest">Newest First</option>
                  <option value="most_urgent">Most Urgent</option>
                  <option value="closest_to_target">Closest to Target</option>
                  <option value="target_desc">Highest Funding Goal</option>
                  <option value="target_asc">Lowest Funding Goal</option>
                </select>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-gray-400 hover:text-gray-600 font-medium text-xs px-2">
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Directory Count Title */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              Showing <strong>{campaigns.length}</strong> verified medical assistance{' '}
              {campaigns.length === 1 ? 'campaign' : 'campaigns'}
            </div>
            <Link
              to="/medical-assistance/new"
              className="text-primary-700 hover:underline font-semibold flex items-center gap-1">
              <span>+ Need emergency assistance? Create request</span>
            </Link>
          </div>

          {/* Campaign Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-5 animate-pulse border border-gray-100 space-y-3">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-10 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="card p-14 text-center border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                🩺
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">No matching medical assistance campaigns</h3>
              <p className="text-gray-500 text-xs max-w-md mx-auto mb-4">
                Try clearing your search query, switching categories, or adjusting the urgency filter.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-secondary btn-sm text-xs">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((c) => (
                <MedicalAssistanceCard
                  key={c._id}
                  campaign={c}
                  onDonateClick={(campaign) => setSelectedDonationCampaign(campaign)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Donation Modal */}
      {selectedDonationCampaign && (
        <DonationForm
          campaign={selectedDonationCampaign}
          onClose={() => setSelectedDonationCampaign(null)}
          onDonationComplete={() => {
            fetchCampaigns();
          }}
        />
      )}
    </div>
  );
};

export default EmergencyAssistance;
