import { Link } from 'react-router-dom';

const CATEGORY_COLORS = {
  'Education':         'bg-blue-50 text-blue-700 border-blue-100',
  'Health':            'bg-red-50 text-red-700 border-red-100',
  'Environment':       'bg-green-50 text-green-700 border-green-100',
  'Women Empowerment': 'bg-pink-50 text-pink-700 border-pink-100',
  'Child Welfare':     'bg-purple-50 text-purple-700 border-purple-100',
  'Rural Development': 'bg-yellow-50 text-yellow-700 border-yellow-100',
  'Livelihood':        'bg-orange-50 text-orange-700 border-orange-100',
  'Disaster Relief':   'bg-rose-50 text-rose-700 border-rose-100',
  'Animal Welfare':    'bg-teal-50 text-teal-700 border-teal-100',
  'Other':             'bg-gray-50 text-gray-700 border-gray-100',
};

const NGOCard = ({ ngo, viewMode = 'grid' }) => {
  const {
    _id,
    ngoName,
    registrationNumber,
    focusAreas = [],
    serviceRegion = [],
    description,
    logoUrl,
    status,
  } = ngo;

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
  const logoSrc = logoUrl
    ? logoUrl.startsWith('http') ? logoUrl : `${API_BASE}${logoUrl}`
    : null;

  if (viewMode === 'list') {
    return (
      <div className="card card-hover p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-slide-up">
        <div className="flex items-start gap-4 flex-1">
          {/* Logo */}
          <div className="w-14 h-14 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoSrc ? (
              <img src={logoSrc} alt={ngoName} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-7 h-7 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 text-base leading-tight">{ngoName}</h3>
              {status === 'approved' && (
                <span className="badge-approved text-[11px] inline-flex">
                  ✓ Verified
                </span>
              )}
            </div>

            {registrationNumber && (
              <div className="text-[11px] text-gray-400 font-mono mb-1.5">
                Reg: {registrationNumber}
              </div>
            )}

            {description && (
              <p className="text-gray-500 text-xs line-clamp-1 mb-2 leading-relaxed">{description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-1">
                {focusAreas.map((area) => (
                  <span key={area} className={`badge text-[11px] border ${CATEGORY_COLORS[area] || CATEGORY_COLORS['Other']}`}>
                    {area}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{serviceRegion.slice(0, 3).join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 w-full md:w-auto">
          <Link to={`/ngos/${_id}`} className="btn-primary btn-sm w-full md:w-auto justify-center px-4 py-2 text-xs">
            View Full Profile →
          </Link>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="card card-hover flex flex-col h-full animate-slide-up border border-gray-100 overflow-hidden">
      {/* Top banner strip */}
      <div className="h-1.5 bg-gradient-to-r from-primary-600 to-primary-400" />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoSrc ? (
              <img src={logoSrc} alt={ngoName} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">{ngoName}</h3>
            {status === 'approved' && (
              <span className="badge-approved text-[11px] mt-1 inline-flex">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified NGO
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-500 text-xs line-clamp-2 mb-3.5 leading-relaxed">{description}</p>
        )}

        {/* Focus areas */}
        <div className="flex flex-wrap gap-1 mb-3">
          {focusAreas.slice(0, 3).map((area) => (
            <span key={area} className={`badge text-[11px] border ${CATEGORY_COLORS[area] || CATEGORY_COLORS['Other']}`}>
              {area}
            </span>
          ))}
          {focusAreas.length > 3 && (
            <span className="badge bg-gray-100 text-gray-500 text-[11px]">+{focusAreas.length - 3}</span>
          )}
        </div>

        {/* Region */}
        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="line-clamp-1">{serviceRegion.slice(0, 2).join(', ')}{serviceRegion.length > 2 ? '…' : ''}</span>
        </div>

        {/* CTA */}
        <div className="mt-auto pt-2 border-t border-gray-50">
          <Link to={`/ngos/${_id}`}
            className="btn-primary w-full justify-center text-xs py-2 font-semibold">
            View Profile & Impact →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NGOCard;
