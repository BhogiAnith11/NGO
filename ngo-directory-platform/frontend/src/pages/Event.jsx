import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getEvents, volunteerForEvent } from '../services/api';

const EVENT_CATEGORIES = [
  'All',
  'Food Drive',
  'Health & Medical Camp',
  'Education & Literacy',
  'Afforestation & Environment',
  'Women Skill Workshop',
  'Animal Welfare',
];

const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('All');
  const [rsvpLoading, setRsvpLoading] = useState({});

  const loadEvents = async () => {
    setLoading(true);
    try {
      const params = selectedCat !== 'All' ? { category: selectedCat } : {};
      const res = await getEvents(params);
      setEvents(res.data.data || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [selectedCat]);

  const handleVolunteer = async (eventId, eventTitle, eventType) => {
    if (eventType === 'activity') {
      toast.success(`"${eventTitle}" is now live in the community update feed.`);
      return;
    }

    setRsvpLoading((prev) => ({ ...prev, [eventId]: true }));
    try {
      await volunteerForEvent(eventId);
      toast.success(`You registered for "${eventTitle}"! The organizers will contact you. 🙌`);
      loadEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRsvpLoading((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="container-main">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald/10 text-emerald-dark px-3 py-1 rounded-full text-xs font-semibold mb-3">
            📅 Community Drives & Welfare Camps
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            District Charity Events & Drives
          </h1>
          <p className="text-gray-600 text-sm mt-2 leading-relaxed">
            Discover upcoming medical camps, food distribution campaigns, literacy workshops, and environmental drives across the district.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8">
          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Event Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="card p-14 text-center border border-dashed border-gray-200 max-w-lg mx-auto">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No events in this category yet</h3>
            <p className="text-xs text-gray-500 mb-4">
              Verified NGOs and district teams regularly schedule new welfare drives.
            </p>
            <button onClick={() => setSelectedCat('All')} className="btn-secondary btn-sm">
              Show All Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div key={ev._id} className="card card-hover flex flex-col overflow-hidden border border-gray-100 animate-slide-up">
                {/* Event Image */}
                <div className="h-48 w-full relative bg-gray-100 overflow-hidden">
                  <img
                    src={ev.image || '/asset/img1.png'}
                    alt={ev.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/asset/img1.png';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-navy/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                    {ev.type === 'activity' ? 'Community Update' : ev.category}
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs text-primary-700 font-semibold mb-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(ev.date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg mb-2 leading-snug">
                    {ev.title}
                  </h3>

                  <p className="text-gray-600 text-xs line-clamp-3 mb-4 leading-relaxed flex-1">
                    {ev.description}
                  </p>

                  <div className="space-y-2 text-xs text-gray-500 mb-5 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">📍</span>
                      <span className="font-medium text-gray-800">{ev.location || 'Community Initiative'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">🏛️</span>
                      <span>Organizer: <strong className="text-gray-700">{ev.organizer}</strong></span>
                    </div>
                    {ev.type !== 'activity' && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">🙋</span>
                        <span>Volunteers: <strong className="text-emerald-dark">{ev.volunteersRegistered || 0} registered</strong> ({ev.volunteersNeeded || 20} needed)</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {ev.type === 'activity' ? (
                      <button
                        onClick={() => toast.success(`"${ev.title}" is now live in the community update feed.`)}
                        className="btn-primary flex-1 justify-center text-xs py-2">
                        View Update
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVolunteer(ev._id, ev.title, ev.type)}
                        disabled={rsvpLoading[ev._id]}
                        className="btn-primary flex-1 justify-center text-xs py-2">
                        {rsvpLoading[ev._id] ? 'Registering…' : 'Volunteer Now 🤝'}
                      </button>
                    )}
                    <Link
                      to="/donate"
                      className="btn-secondary btn-sm px-3 justify-center text-xs"
                      title="Donate Supplies">
                      Donate
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Event;
