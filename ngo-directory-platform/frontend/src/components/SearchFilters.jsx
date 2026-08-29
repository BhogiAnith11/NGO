const FOCUS_AREAS = [
  'All',
  'Education', 'Health', 'Environment', 'Women Empowerment',
  'Child Welfare', 'Rural Development', 'Livelihood',
  'Disaster Relief', 'Animal Welfare',
];

const SearchFilters = ({ filters, onChange, viewMode, onViewModeChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onChange({ search: '', category: '', region: '', verified: false, sortBy: 'newest' });
  };

  const hasFilters = filters.search || filters.category || filters.region || filters.verified;

  return (
    <div className="card p-5 mb-6 space-y-4 shadow-sm border border-gray-100">
      {/* Primary search row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="md:col-span-5 relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="search-input"
            type="text"
            placeholder="Search by NGO name, keywords, or focus area..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Category dropdown */}
        <div className="md:col-span-3">
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="select text-sm"
          >
            <option value="">All Focus Areas</option>
            {FOCUS_AREAS.filter((f) => f !== 'All').map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Region / Taluka input */}
        <div className="md:col-span-2">
          <input
            id="region-filter"
            type="text"
            placeholder="Taluka / Village..."
            value={filters.region}
            onChange={(e) => handleChange('region', e.target.value)}
            className="input text-sm"
          />
        </div>

        {/* Sort selector */}
        <div className="md:col-span-2">
          <select
            id="sort-filter"
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="select text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Quick Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px] mr-1 flex-shrink-0">
          Filter:
        </span>
        {FOCUS_AREAS.map((f) => {
          const isSelected = f === 'All' ? !filters.category : filters.category === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => handleChange('category', f === 'All' ? '' : f)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {f}
            </button>
          );
        })}
      </div>

      {/* Bottom controls: Verified checkbox, View Mode, Clear */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id="verified-toggle"
              type="checkbox"
              checked={filters.verified}
              onChange={(e) => handleChange('verified', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-gray-700">Verified District NGOs only</span>
          </label>

          {hasFilters && (
            <button
              onClick={handleReset}
              className="text-xs text-primary-600 hover:text-primary-800 font-semibold flex items-center gap-1 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reset Filters
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        {onViewModeChange && (
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white text-primary-700 shadow-xs' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              title="List View"
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'list' ? 'bg-white text-primary-700 shadow-xs' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
