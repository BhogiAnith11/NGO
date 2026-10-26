import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyDonations } from '../services/donationService';
import DonationHistoryTable from '../components/donations/DonationHistoryTable';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    try {
      const res = await getMyDonations();
      setDonations(res.data.data || []);
    } catch {
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const successfulDonations = donations.filter((d) => d.transactionStatus === 'successful');
  const totalAmount = successfulDonations.reduce((acc, d) => acc + (d.amount || 0), 0);
  const campaignsCount = new Set(
    donations
      .map((d) => d.targetCampaign?._id || d.targetNGO?._id || d.targetNgoId)
      .filter(Boolean)
  ).size;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-10">
      <div className="container-main space-y-8">
        {/* Header Banner */}
        <div className="card p-6 md:p-8 bg-gradient-to-r from-navy via-navy-dark to-primary-950 text-white rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs text-blue-200 mb-2">
              <span>🤝</span> Donor Impact & Transparency Center
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Welcome back, {user?.name || 'Supporter'}</h1>
            <p className="text-blue-200 text-xs mt-1">
              Track your confirmed contributions to emergency medical patients and verified district NGOs.
            </p>
          </div>

          <Link to="/medical-assistance" className="btn-primary text-xs px-5 py-2.5 shadow-md self-start md:self-auto">
            Browse Patients in Need 🩺
          </Link>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 bg-white border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl font-bold">
              ₹
            </div>
            <div>
              <div className="text-2xl font-extrabold text-primary-700">
                ₹{totalAmount.toLocaleString('en-IN')}
              </div>
              <div className="text-xs font-semibold text-gray-700">Total Confirmed Impact</div>
              <div className="text-[11px] text-gray-400">Verified server-side</div>
            </div>
          </div>

          <div className="card p-5 bg-white border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl">
              🎯
            </div>
            <div>
              <div className="text-2xl font-extrabold text-gray-900">{campaignsCount}</div>
              <div className="text-xs font-semibold text-gray-700">Causes Supported</div>
              <div className="text-[11px] text-gray-400">Medical patients & NGOs</div>
            </div>
          </div>

          <div className="card p-5 bg-white border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl">
              🧾
            </div>
            <div>
              <div className="text-2xl font-extrabold text-gray-900">{donations.length}</div>
              <div className="text-xs font-semibold text-gray-700">Donation Receipts</div>
              <div className="text-[11px] text-gray-400">Digital records available</div>
            </div>
          </div>
        </div>

        {/* Donation History Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Your Donation History & Verified Receipts</h2>
            <Link to="/donate" className="text-xs text-primary-700 font-semibold hover:underline">
              Make another contribution →
            </Link>
          </div>

          <DonationHistoryTable
            donations={donations}
            emptyMsg="You haven't made any donations yet."
          />
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
