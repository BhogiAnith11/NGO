import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyDonations } from '../services/donationService';
import DonationHistoryTable from '../components/donations/DonationHistoryTable';

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyDonations()
      .then((res) => setDonations(res.data.data || []))
      .catch(() => setDonations([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-10">
      <div className="container-main space-y-6 max-w-5xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Personal Donation History</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified records of your contributions to emergency medical patients and non-profits.
            </p>
          </div>
          <Link to="/donor-dashboard" className="btn-secondary btn-sm text-xs">
            ← Return to Donor Dashboard
          </Link>
        </div>

        <DonationHistoryTable donations={donations} />
      </div>
    </div>
  );
};

export default DonationHistory;
