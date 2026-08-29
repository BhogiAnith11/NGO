import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import NGOCard from '../components/NGOCard';
import SearchFilters from '../components/SearchFilters';
import { getNGOs, getStats } from '../services/api';

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
    q: 'How are NGOs verified on this platform?',
    a: 'Every registered NGO submits its official Societies / Trust Registration Number, PAN, operational service region, and organizational mandate. The District Social Welfare Nodal Officer reviews all documentation before issuing a public Verified status.',
  },
  {
    q: 'How can donors and CSR funds connect with verified NGOs?',
    a: 'Corporate CSR teams and individual donors can sign up for a free Donor account, browse verified NGOs by category or taluka, and send direct collaboration proposals via the Connect feature.',
  },
  {
    q: 'Can volunteers join NGO activities through this directory?',
    a: 'Yes! Volunteers can create an account, browse field activities and impact stories, and reach out directly to NGOs operating in their local area.',
  },
  {
    q: 'Is there any fee for NGOs to register on the platform?',
    a: 'No. This platform is a digital public goods initiative funded and managed by the District Administration. NGO registration, verification, and collaboration tools are 100% free.',
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
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [openFaq, setOpenFaq] = useState(null);
  const [filters, setFilters] = useState({
    search: '', category: '', region: '', verified: false, sortBy: 'newest',
  });
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch live platform stats
  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
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

      // Client-side sorting
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
      <section className="bg-gradient-to-br from-navy-dark via-navy to-primary-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald rounded-full blur-3xl" />
        </div>

        <div className="container-main relative">
          <div className="max-w-3xl">
            {/* Government seal badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-6 border border-white/20 shadow-xs">
              <span className="text-yellow-400 text-sm">🏛️</span>
              <span className="text-xs md:text-sm text-blue-100 font-semibold tracking-wide">
                District Administration · Social Welfare Digital Initiative
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
              District NGO Directory &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-emerald-light">
                Social Impact Network
              </span>
            </h1>
            <p className="text-blue-100/90 text-base md:text-lg leading-relaxed mb-8 max-w-2xl font-light">
              A unified government repository connecting citizens, CSR donors, volunteers, and district authorities with verified Non-Governmental Organizations across all welfare sectors.
            </p>

            <div className="flex flex-wrap items-center gap-3.5">
              <a href="#directory" className="btn-primary text-sm md:text-base px-6 py-3 shadow-md">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search NGO Directory
              </a>
              <Link to="/register" className="btn-secondary text-sm md:text-base px-6 py-3">
                Register Your NGO
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs text-blue-200/80">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald"></span> 100% District Verified Profiles
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-400"></span> Live Impact Tracking
              </span>
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
                icon: '🎯',
                label: 'Core Focus Areas',
                value: statsLoading ? null : formatNumber(stats?.focusAreaCount),
                subtext: 'Welfare domains',
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

      {/* 3. Core Focus Pillars Grid */}
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
                      : 'hover:border-primary-200 hover:shadow-md'
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

      {/* 4. Public Directory Section */}
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
                <div key={i} className="card p-5 animate-pulse border border-gray-100">
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
            <div className="card p-14 text-center border border-dashed border-gray-200">
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

      {/* 5. How the Platform Works Workflow */}
      <section className="py-16 bg-white border-t border-b border-gray-100">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="badge bg-emerald/10 text-emerald-dark text-xs px-3 py-1 mb-2">
              Government Transparency
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">How the Initiative Operates</h2>
            <p className="text-gray-500 text-sm mt-2">
              A 3-step structured verification and collaboration process for all stakeholders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6 border border-gray-100 text-center relative">
              <div className="w-12 h-12 bg-primary-50 text-primary-700 rounded-2xl flex items-center justify-center font-bold text-lg mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">NGO Registration & Audit</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Non-profits register their societies / trust certificates, target tehsils, and core domains. Registrations enter a secure pending state until official review.
              </p>
            </div>

            <div className="card p-6 border border-gray-100 text-center relative">
              <div className="w-12 h-12 bg-emerald/10 text-emerald-dark rounded-2xl flex items-center justify-center font-bold text-lg mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">District Nodal Verification</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                The District Social Welfare Officer authenticates registration papers, monitors service region coverage, and grants official Verified status.
              </p>
            </div>

            <div className="card p-6 border border-gray-100 text-center relative">
              <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center font-bold text-lg mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2">Direct CSR & Impact Network</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Citizens, corporate CSR donors, and volunteer networks collaborate directly, send proposals, and track field project outcomes transparently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. District Administration Notice & Helpline Seal */}
      <section className="py-12 bg-gradient-to-r from-navy via-navy to-primary-950 text-white">
        <div className="container-main">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs text-blue-200 mb-3">
                🏛️ Official Department Notice
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                District Social Welfare & Planning Department
              </h3>
              <p className="text-blue-200 text-sm leading-relaxed max-w-xl">
                This digital repository prevents duplicate welfare resource allocation across overlapping villages and ensures genuine non-profits receive structured institutional support.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/15">
              <div className="text-xs text-blue-200 mb-1 font-semibold uppercase tracking-wider">
                Nodal Verification Desk
              </div>
              <div className="text-lg font-bold text-white mb-2">District Collectorate Office</div>
              <div className="text-xs text-blue-100 space-y-1.5">
                <div>📞 Helpline: +91 (0253) 2578900 / 901</div>
                <div>✉️ Email: welfare.district@gov.in</div>
                <div>📍 Timings: Mon–Fri, 10:00 AM – 5:30 PM</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions (FAQ) */}
      <section className="py-14 bg-surface">
        <div className="container-main max-w-4xl">
          <div className="text-center mb-10">
            <span className="badge bg-primary-50 text-primary-700 text-xs px-3 py-1 mb-2">
              Help & Guidelines
            </span>
            <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-sm mt-1">
              Key information for NGOs, donors, volunteers, and citizen partners.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="card border border-gray-100 overflow-hidden">
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

      {/* 8. Bottom CTA Banner */}
      <section className="py-12 bg-primary-600 text-white">
        <div className="container-main text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Are You an Active NGO in the District?
          </h2>
          <p className="text-blue-100 text-sm mb-6 leading-relaxed">
            Register your organization today to gain official verification, reach CSR corporate donors, and coordinate with district welfare programs.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/register" className="btn-secondary text-sm px-6 py-2.5">
              Submit NGO Profile →
            </Link>
            <Link to="/login" className="px-5 py-2.5 rounded-xl border border-white/30 text-white hover:bg-white/10 text-sm font-semibold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
