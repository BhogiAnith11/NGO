const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

const ActivityFeed = ({ activities, showDelete = false, onDelete = null }) => {
  if (!activities?.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="font-medium">No activities posted yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {activities.map((act) => (
        <div key={act._id} className="card p-5 animate-fade-in">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="font-semibold text-gray-900">{act.title}</h4>
            <div className="flex items-center gap-2">
              {showDelete && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(act._id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              )}
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {new Date(act.date).toLocaleDateString('en-IN', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {act.category && (
            <span className="badge badge-category mb-2">{act.category}</span>
          )}

          <p className="text-gray-600 text-sm leading-relaxed mb-3">{act.description}</p>

          {act.beneficiaryCount > 0 && (
            <div className="flex items-center gap-2 mb-3 text-emerald-dark font-semibold text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {act.beneficiaryCount.toLocaleString('en-IN')} beneficiaries reached
            </div>
          )}

          {act.images?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {act.images.map((img, i) => {
                const src = img.startsWith('http') ? img : `${API_BASE}${img}`;
                return (
                  <img
                    key={i}
                    src={src}
                    alt={`Activity image ${i + 1}`}
                    className="w-24 h-24 object-cover rounded-xl border border-gray-100"
                  />
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
