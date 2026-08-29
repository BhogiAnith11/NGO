const { Parser } = require('json2csv');

/**
 * Converts an array of NGO documents to a CSV string.
 * @param {Array} ngos - Array of NGO mongoose documents or plain objects
 * @returns {string} CSV string
 */
const exportNGOsToCSV = (ngos) => {
  const fields = [
    { label: 'NGO Name', value: 'ngoName' },
    { label: 'Registration Number', value: 'registrationNumber' },
    { label: 'Focus Areas', value: (row) => row.focusAreas?.join('; ') || '' },
    { label: 'Service Region', value: (row) => row.serviceRegion?.join('; ') || '' },
    { label: 'Status', value: 'status' },
    { label: 'Contact Email', value: 'contactEmail' },
    { label: 'Contact Phone', value: 'contactPhone' },
    { label: 'Website', value: 'website' },
    { label: 'Address', value: 'address' },
    { label: 'Registered On', value: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN') : '' },
  ];

  const parser = new Parser({ fields });
  return parser.parse(ngos);
};

module.exports = { exportNGOsToCSV };
