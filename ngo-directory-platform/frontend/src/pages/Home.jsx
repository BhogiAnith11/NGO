import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import NGOCard from '../components/NGOCard';
import SearchFilters from '../components/SearchFilters';
import MedicalAssistanceCard from '../components/medical/MedicalAssistanceCard';
import DonationForm from '../components/donations/DonationForm';
import { getNGOs, getStats } from '../services/api';
import { getPublicCampaigns } from '../services/medicalAssistanceService';

const FOCUS_PILLARS = [
  {
    name: 'Education',
    icon: '📚',
    color: 'from-blue-500/10 to-blue-600/5 text-blue-700 border-blue-200',
    desc: 'Digital classrooms, literacy programs, STEM kits, and scholarships for underprivileged youth.',
  },
  {
    name: 'Health',
    icon: '🏥',
    color: 'from-red-500/10 to-red-600/5 text-red-700 border-red-200',
    desc: 'Mobile medical camps, maternal nutrition, eye-screenings, and tribal hamlet clinics.',
  },
  {
    name: 'Environment',
    icon: '🌱',
    color: 'from-green-500/10 to-green-600/5 text-green-700 border-green-200',
    desc: 'Afforestation, watershed restoration, rainwater harvesting, and waste management.',
  },
  {
    name: 'Women Empowerment',
    icon: '👩‍💼',
    color: 'from-pink-500/10 to-pink-600/5 text-pink-700 border-pink-200',
    desc: 'Vocational skill centers, SHG micro-enterprise development, and financial literacy.',
  },
  {
    name: 'Child Welfare',
    icon: '🧸',
    color: 'from-purple-500/10 to-purple-600/5 text-purple-700 border-purple-200',
    desc: 'Orphan care, child protection helplines, nutritional support, and sports initiatives.',
  },
  {
    name: 'Rural Development',
    icon: '🌾',
    color: 'from-yellow-500/10 to-yellow-600/5 text-yellow-800 border-yellow-200',
    desc: 'Farmer producer groups, rural drinking water schemes, and cottage industry revival.',
  },
  {
    name: 'Livelihood',
    icon: '💼',
    color: 'from-orange-500/10 to-orange-600/5 text-orange-700 border-orange-200',
    desc: 'Youth employment skill training, artisan market linkages, and digital trade workshops.',
  },
  {
    name: 'Animal Welfare',
    icon: '🐾',
    color: 'from-teal-500/10 to-teal-600/5 text-teal-700 border-teal-200',
    desc: '24/7 wildlife rescue, stray dog vaccination campaigns, and veterinary shelter care.',
  },
];

const FAQS = [
  {
    q: 'How are medical assistance requests verified on this platform?',
    a: 'Every patient submission requires hospital diagnostic reports, treating doctor details, and hospital cost estimates. District Nodal Social Welfare and Health Officers verify the authenticity before granting public Verified Medical Assistance status.',
  },
  {
    q: 'How does the direct donation system work?',
    a: 'Donors contribute directly to verified medical campaigns via Razorpay. Transactions are authenticated server-side with HMAC cryptographic signatures and recorded directly into the patient fundraising ledger with official receipts.',
  },
  {
    q: 'How are NGOs verified in the directory?',
    a: 'Every registered NGO submits its official Societies / Trust Registration Number, PAN, operational service region, and organizational mandate. The District Social Welfare Nodal Officer reviews all documentation before issuing a public Verified status.',
  },
  {
    q: 'Are patient medical documents publicly accessible?',
    a: 'No. Patient diagnostic scans, private address, and sensitive medical documents are stored in a secured directory and are strictly accessible only to authorized district verification officers and the patient or their representative.',
  },
];

const formatNumber = (n) => {
  if (n === null || n === undefined) return '—';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M+';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K+';
  return n.toLocaleString('en-IN');
};

const Home = () => {
  const [ngos, setNgos] = useState([]);
  const [medicalCampaigns, setMedicalCampaigns] = useState([]);
  const [selectedDonationCampaign, setSelectedDonationCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [medicalLoading, setMedicalLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [openFaq, setOpenFaq] = useState(null);
  const [filters, setFilters] = useState({
    search: '', category: '', region: '', verified: false, sortBy: 'newest',
  });
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch live platform stats & medical spotlight
  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));

    getPublicCampaigns({ status: 'Active', sortBy: 'most_urgent' })
      .then((res) => setMedicalCampaigns((res.data.data || []).slice(0, 3)))
      .catch(() => setMedicalCampaigns([]))
      .finally(() => setMedicalLoading(false));
  }, []);

  const fetchNGOs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.region && { region: filters.region }),
      };
      const res = await getNGOs(params);
      let list = res.data.data || [];

      if (filters.sortBy === 'name_asc') {
        list.sort((a, b) => a.ngoName.localeCompare(b.ngoName));
      } else if (filters.sortBy === 'name_desc') {
        list.sort((a, b) => b.ngoName.localeCompare(a.ngoName));
      }

      setNgos(list);
      setTotal(res.data.count || 0);
    } catch {
      setNgos([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchNGOs, 300);
    return () => clearTimeout(timer);
  }, [fetchNGOs]);

  const displayed = filters.verified ? ngos.filter((n) => n.status === 'approved') : ngos;

  const handlePillarClick = (categoryName) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === categoryName ? '' : categoryName,
    }));
    document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Hero Section */}
      <section className="bg-gradient-to-br from-navy-dark via-navy to-primary-900 text-white py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald rounded-full blur-3xl" />
        </div>

        <div className="container-main relative">
          <div className="max-w-3xl">
            {/* Government seal badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-5 border border-white/20 shadow-xs">
              <span className="text-yellow-400 text-sm">🏛️</span>
              <span className="text-xs md:text-sm text-blue-100 font-semibold tracking-wide">
                District Administration · Social Welfare & Medical Emergency Portal
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
              District NGO Directory &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-blue-200 to-emerald-light">
                Emergency Medical Assistance
              </span>
            </h1>
            <p className="text-blue-100/90 text-sm md:text-base leading-relaxed mb-8 max-w-2xl font-light">
              A verified government digital ecosystem connecting citizens with authenticated Non-Governmental
              Organizations and providing direct emergency donations for critically injured patients and urgent medical surgeries.
            </p>

            {/* 4 PROMINENT ACTION POINTS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <a
                href="#directory"
                className="card p-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-center backdrop-blur-md transition-all group">
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🔍</div>
                <div className="text-xs font-bold text-white">Find an NGO</div>
                <div className="text-[10px] text-blue-200">Search directory</div>
              </a>

              <Link
                to="/medical-assistance/new"
                className="card p-3.5 bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 rounded-xl text-center backdrop-blur-md transition-all group">
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🩺</div>
                <div className="text-xs font-bold text-red-100">Get Medical Aid</div>
                <div className="text-[10px] text-red-200">Submit patient case</div>
              </Link>

              <Link
                to="/medical-assistance"
                className="card p-3.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 rounded-xl text-center backdrop-blur-md transition-all group">
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">❤️</div>
                <div className="text-xs font-bold text-emerald-100">Support a Patient</div>
                <div className="text-[10px] text-emerald-200">Direct Razorpay aid</div>
              </Link>

              <Link
                to="/register"
                className="card p-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-center backdrop-blur-md transition-all group">
                <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">🏛️</div>
                <div className="text-xs font-bold text-white">Register an NGO</div>
                <div className="text-[10px] text-blue-200">District audit onboarding</div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Dynamic Live Stats Bar */}
      <section className="bg-white border-b border-gray-100 shadow-sm relative z-10">
        <div className="container-main py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: '🏛️',
                label: 'Registered NGOs',
                value: statsLoading ? null : formatNumber(stats?.totalNGOs),
                subtext: 'District non-profits',
              },
              {
                icon: '🩺',
                label: 'Verified Medical Cases',
                value: statsLoading ? null : formatNumber(stats?.approvedMedicalCampaigns || stats?.totalMedicalCampaigns),
                subtext: 'Emergency patient aid',
              },
              {
                icon: '📍',
                label: 'Villages & Talukas',
                value: statsLoading ? null : formatNumber(stats?.villageCount),
                subtext: 'Service territories',
              },
              {
                icon: '🤝',
                label: 'Beneficiaries Reached',
                value: statsLoading ? null : formatNumber(stats?.beneficiariesReached),
                subtext: 'Documented social impact',
              },
            ].map((s) => (
              <div key={s.label} className="text-center p-2">
                <div className="text-2xl mb-1">{s.icon}</div>
                {s.value === null ? (
                  <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse mx-auto mb-1" />
                ) : (
                  <div className="text-2xl md:text-3xl font-extrabold text-primary-700">{s.value}</div>
                )}
                <div className="text-xs font-semibold text-gray-800 mt-0.5">{s.label}</div>
                <div className="text-[11px] text-gray-400">{s.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PROMINENT EMERGENCY MEDICAL ASSISTANCE SPOTLIGHT */}
      <section className="py-14 bg-gradient-to-b from-red-50/40 via-surface to-surface border-b border-gray-200/60">
        <div className="container-main space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold mb-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Urgent Emergency Cases</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                Support Patients Needing Immediate Treatment
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1 max-w-xl">
                Every listed campaign is audited against hospital billing certificates. Contribute directly via
                Razorpay test mode with verified online receipts.
              </p>
            </div>

            <Link
              to="/medical-assistance"
              className="btn-primary btn-sm text-xs px-4 py-2 self-start sm:self-auto font-semibold">
              View All Medical Cases ({medicalCampaigns.length}+) →
            </Link>
          </div>

          {medicalLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-5 animate-pulse bg-white border border-gray-100 space-y-3">
                  <div className="h-12 bg-gray-100 rounded-xl" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-10 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : medicalCampaigns.length === 0 ? (
            <div className="card p-8 text-center bg-white border border-dashed border-gray-200 text-xs text-gray-500">
              No active urgent medical cases at this moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {medicalCampaigns.map((c) => (
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

      {/* 4. Core Focus Pillars Grid */}
      <section className="py-14 bg-gray-50/70 border-b border-gray-100">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="badge bg-primary-50 text-primary-700 text-xs px-3 py-1 mb-2">
              Strategic Domains
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Explore by Welfare Category</h2>
            <p className="text-gray-500 text-sm mt-2">
              Select a domain to filter verified organizations actively working in our district.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FOCUS_PILLARS.map((pillar) => {
              const isSelected = filters.category === pillar.name;
              return (
                <button
                  key={pillar.name}
                  type="button"
                  onClick={() => handlePillarClick(pillar.name)}
                  className={`card p-5 text-left transition-all duration-200 border ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50/50 ring-2 ring-primary-500'
                      : 'hover:border-primary-200 hover:shadow-md bg-white'
                  }`}>
                  <div className="text-3xl mb-3">{pillar.icon}</div>
                  <h3 className="font-bold text-gray-900 text-base mb-1.5 flex items-center justify-between">
                    <span>{pillar.name}</span>
                    {isSelected && <span className="text-primary-600 text-xs font-semibold">Active ✓</span>}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{pillar.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Public NGO Directory Section */}
      <section id="directory" className="flex-1 bg-surface py-12 scroll-mt-6">
        <div className="container-main">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>Search NGO Directory</span>
                {filters.category && (
                  <span className="badge bg-primary-100 text-primary-800 text-xs">
                    {filters.category}
                  </span>
                )}
              </h2>
              <p className="text-gray-500 text-xs mt-1">
                {loading ? 'Searching verified records…' : `${displayed.length} verified ${displayed.length === 1 ? 'organization' : 'organizations'} listed`}
              </p>
            </div>
          </div>

          <SearchFilters
            filters={filters}
            onChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-5 animate-pulse border border-gray-100 bg-white">
                  <div className="flex gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded" />
                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="card p-14 text-center border border-dashed border-gray-200 bg-white">
              <div className="w-16 h-16 bg-blue-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🔍
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">No matching NGOs found</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-5">
                Try loosening your search filters, clearing the region input, or switching focus categories.
              </p>
              <button
                type="button"
                onClick={() => setFilters({ search: '', category: '', region: '', verified: false, sortBy: 'newest' })}
                className="btn-secondary btn-sm">
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-4">
              {displayed.map((ngo) => (
                <NGOCard key={ngo._id} ngo={ngo} viewMode="list" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayed.map((ngo) => (
                <NGOCard key={ngo._id} ngo={ngo} viewMode="grid" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Frequently Asked Questions (FAQ) */}
      <section className="py-14 bg-surface border-t border-gray-100">
        <div className="container-main max-w-4xl">
          <div className="text-center mb-10">
            <span className="badge bg-primary-50 text-primary-700 text-xs px-3 py-1 mb-2">
              Help & Guidelines
            </span>
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-sm mt-1">
              Key information on NGO verification, emergency assistance applications, and direct donations.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="card border border-gray-200/80 overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-gray-800 text-sm hover:bg-gray-50/50 transition-colors">
                    <span>{faq.q}</span>
                    <span className="text-primary-600 text-lg font-bold flex-shrink-0">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs md:text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3 bg-gray-50/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Donation Modal on Home */}
      {selectedDonationCampaign && (
        <DonationForm
          campaign={selectedDonationCampaign}
          onClose={() => setSelectedDonationCampaign(null)}
          onDonationComplete={() => {
            getPublicCampaigns({ status: 'Active', sortBy: 'most_urgent' })
              .then((res) => setMedicalCampaigns((res.data.data || []).slice(0, 3)))
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
};

export default Home;
