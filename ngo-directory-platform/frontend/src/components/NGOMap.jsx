import { useState } from 'react';

const NGOMap = ({ ngo }) => {
  const [mapType, setMapType] = useState('embed');
  const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!ngo) return null;

  const { ngoName, serviceRegion = [], address, latitude, longitude } = ngo;
  const regionQuery = serviceRegion.join(', ') + ' Maharashtra India';
  const displayAddress = address || serviceRegion.join(', ') || 'District Center';

  // Construct embed URL
  let embedUrl = '';
  if (latitude && longitude) {
    embedUrl = `https://www.google.com/maps/embed/v1/place?key=${googleKey}&q=${latitude},${longitude}&zoom=13`;
  } else {
    embedUrl = `https://www.google.com/maps/embed/v1/place?key=${googleKey}&q=${encodeURIComponent(displayAddress + ' India')}&zoom=11`;
  }

  // Fallback to OpenStreetMap if no Google key is provided/fails
  const osmUrl = latitude && longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.05}%2C${latitude - 0.05}%2C${longitude + 0.05}%2C${latitude + 0.05}&layer=mapnik&marker=${latitude}%2C${longitude}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=73.5%2C19.7%2C74.2%2C20.4&layer=mapnik`;

  return (
    <div className="card overflow-hidden">
      <div className="p-4 bg-navy text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="font-semibold text-sm">Service Coverage & Location Map</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMapType('embed')}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
              mapType === 'embed' ? 'bg-primary-600 text-white font-medium' : 'text-blue-200 hover:text-white'
            }`}>
            Satellite / Roads
          </button>
          <button
            type="button"
            onClick={() => setMapType('osm')}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
              mapType === 'osm' ? 'bg-primary-600 text-white font-medium' : 'text-blue-200 hover:text-white'
            }`}>
            Territory View
          </button>
        </div>
      </div>

      <div className="relative w-full h-80 bg-gray-100">
        {mapType === 'embed' && googleKey ? (
          <iframe
            title={`${ngoName} Location Map`}
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <iframe
            title={`${ngoName} OpenStreetMap`}
            src={osmUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
          />
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-800">Operational Talukas / Villages:</span>
          <span className="text-primary-700 font-medium">{serviceRegion.join(', ')}</span>
        </div>
        {latitude && longitude && (
          <div className="text-gray-400 font-mono text-[11px]">
            Coords: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
          </div>
        )}
      </div>
    </div>
  );
};

export default NGOMap;
