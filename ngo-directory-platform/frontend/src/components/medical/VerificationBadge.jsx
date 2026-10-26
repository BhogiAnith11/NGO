import React from 'react';

const VerificationBadge = ({ status = 'Approved', urgency, showUrgency = false, size = 'sm' }) => {
  const isApproved = status === 'Approved';
  const isPending = status === 'Pending';
  const isUnderReview = status === 'Under Review';
  const isRejected = status === 'Rejected';

  const badgeSizeClass = size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]';

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      {isApproved && (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs ${badgeSizeClass}`}
          title="Verified by District Social Welfare & Health Nodal Authority">
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Verified Medical Assistance</span>
        </span>
      )}

      {isPending && (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${badgeSizeClass}`}
          title="Submitted and pending district nodal review">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Pending Audit</span>
        </span>
      )}

      {isUnderReview && (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-blue-50 text-blue-800 border border-blue-200 ${badgeSizeClass}`}
          title="Under review by health officers">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Under Nodal Review</span>
        </span>
      )}

      {isRejected && (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full bg-red-50 text-red-800 border border-red-200 ${badgeSizeClass}`}>
          <span>Rejected / Closed</span>
        </span>
      )}

      {showUrgency && urgency && (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-full uppercase tracking-wider text-[10px] px-2 py-0.5 ${
            urgency === 'life_threatening'
              ? 'bg-red-100 text-red-900 border border-red-300 animate-pulse'
              : urgency === 'critical'
              ? 'bg-orange-100 text-orange-800 border border-orange-200'
              : urgency === 'urgent'
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-gray-100 text-gray-700'
          }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {urgency.replace('_', ' ')}
        </span>
      )}
    </div>
  );
};

export default VerificationBadge;
