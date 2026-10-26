import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getCampaignById, reportCampaign } from '../services/medicalAssistanceService';
import CampaignProgress from '../components/medical/CampaignProgress';
import VerificationBadge from '../components/medical/VerificationBadge';
import MedicalUpdateFeed from '../components/medical/MedicalUpdateFeed';
import DonationForm from '../components/donations/DonationForm';

const MedicalAssistanceProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await getCampaignById(id);
      setCampaign(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load medical campaign profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Emergency Medical Assistance for ${campaign?.patientDisplayName}`,
          text: `Support ${campaign?.patientDisplayName} in fighting ${campaign?.conditionCategory}. Verified campaign on District Welfare Platform.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Campaign link copied to clipboard!');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) {
      toast.error('Please specify the reason for reporting');
      return;
    }

    setSubmittingReport(true);
    try {
      await reportCampaign(id, {
        reason: reportReason.trim(),
        details: reportDetails.trim(),
      });
      toast.success('Report submitted to district administrators for urgent review.');
      setShowReportModal(false);
      setReportReason('');
      setReportDetails('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 py-20 bg-surface">
        <div className="text-5xl">🩺</div>
        <h1 className="text-xl font-bold text-gray-800">Campaign Profile Not Found</h1>
        <p className="text-xs text-gray-500">
          This medical assistance campaign may be unapproved, closed, or removed.
        </p>
        <Link to="/medical-assistance" className="btn-primary btn-sm text-xs">
          Browse Active Campaigns
        </Link>
      </div>
    );
  }

  const isCreatorOrAdmin =
    user &&
    (user.role === 'admin' ||
      (campaign.createdBy &&
        (campaign.createdBy === user._id || campaign.createdBy._id === user._id)));

  return (
    <div className="min-h-screen bg-surface py-10">
      <div className="container-main space-y-8 max-w-5xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-primary-700">Home</Link>
          <span>/</span>
          <Link to="/medical-assistance" className="hover:text-primary-700">Emergency Assistance</Link>
          <span>/</span>
          <span className="font-semibold text-gray-800 truncate">{campaign.patientDisplayName}</span>
        </div>

        {/* Top Header Card */}
        <div className="card p-6 md:p-8 border border-gray-200/80 bg-white shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              {campaign.patientPhoto ? (
                <img
                  src={campaign.patientPhoto}
                  alt={campaign.patientDisplayName}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border border-gray-100 shadow-xs flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center text-4xl font-bold border border-primary-100 flex-shrink-0">
                  🩺
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <VerificationBadge
                    status={campaign.verificationStatus}
                    urgency={campaign.urgency}
                    showUrgency={true}
                    size="lg"
                  />
                  <span className="badge bg-blue-50 text-blue-800 text-xs font-semibold">
                    {campaign.conditionCategory}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                  {campaign.patientDisplayName}
                </h1>

                <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                  <span>📍 District: <strong>{campaign.district}</strong></span>
                  {campaign.serviceLocation && <span>• {campaign.serviceLocation}</span>}
                  {campaign.representative?.relationship && (
                    <span>• Represented by: {campaign.representative.relationship}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons Header */}
            <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
              <button
                type="button"
                onClick={handleShare}
                className="btn-secondary btn-sm text-xs flex items-center gap-1.5 px-3 py-2">
                <span>🔗</span> Share Campaign
              </button>
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="text-gray-400 hover:text-red-500 text-xs px-2 py-1.5 border border-transparent hover:border-red-200 rounded-lg transition-colors">
                🚩 Report
              </button>
            </div>
          </div>

          {/* Financial Progress Banner */}
          <div className="p-5 bg-gradient-to-r from-blue-50/70 to-emerald-50/50 rounded-2xl border border-blue-100/80">
            <CampaignProgress
              fundingTarget={campaign.fundingTarget}
              amountRaised={campaign.amountRaised}
              remainingAmount={campaign.remainingAmount}
              progressPercentage={campaign.progressPercentage}
              successfulDonationCount={campaign.successfulDonationCount}
              showStats={true}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-5 pt-4 border-t border-blue-200/40">
              <div className="text-xs text-gray-600">
                {campaign.treatmentDeadline && (
                  <div>
                    ⏳ Target Deadline:{' '}
                    <strong>
                      {new Date(campaign.treatmentDeadline).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>
                )}
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Direct verified contributions via Razorpay test gateway
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDonateModal(true)}
                className="btn-primary text-sm px-8 py-3 shadow-md font-bold text-center">
                Donate Directly Now 💳
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Approved Clinical Summary */}
            <div className="card p-6 border border-gray-200/80 bg-white space-y-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <span>📋</span> Approved Medical Summary
              </h3>
              <p className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {campaign.medicalSummary}
              </p>

              {campaign.treatmentDetails && (
                <div className="pt-3 border-t border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Treatment & Procedure Protocol
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed">{campaign.treatmentDetails}</p>
                </div>
              )}
            </div>

            {/* Hospital Information (Where consented) */}
            {campaign.hospitalDetails && (
              <div className="card p-6 border border-gray-200/80 bg-white space-y-4">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <span>🏥</span> Hospital & Clinical Care Center
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 text-[11px] block">Hospital Name</span>
                    <span className="font-bold text-gray-900">
                      {campaign.hospitalDetails.showHospitalPublicly
                        ? campaign.hospitalDetails.hospitalName || 'Verified District Hospital'
                        : 'Confidential Hospital (Verified by Officer)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px] block">City / Location</span>
                    <span className="font-medium text-gray-800">
                      {campaign.hospitalDetails.hospitalLocation || campaign.district}
                    </span>
                  </div>
                  {campaign.hospitalDetails.doctorName && (
                    <div>
                      <span className="text-gray-400 text-[11px] block">Attending Consultant</span>
                      <span className="font-medium text-gray-800">{campaign.hospitalDetails.doctorName}</span>
                    </div>
                  )}
                  {campaign.hospitalDetails.estimatedCost && (
                    <div>
                      <span className="text-gray-400 text-[11px] block">Total Estimated Bill</span>
                      <span className="font-bold text-emerald-800">
                        ₹{Number(campaign.hospitalDetails.estimatedCost).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Treatment Progress Updates Feed */}
            <div className="card p-6 border border-gray-200/80 bg-white">
              <MedicalUpdateFeed
                campaignId={campaign._id}
                updates={campaign.updates || []}
                isAuthorized={isCreatorOrAdmin}
                onUpdateAdded={fetchProfile}
              />
            </div>
          </div>

          {/* Right Sidebar: Recent Donations & Verified Proof (1 col) */}
          <div className="space-y-6">
            {/* Quick Donate Card */}
            <div className="card p-6 border border-primary-200 bg-white shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">Contribute to this Patient</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                100% of your contribution directly supports {campaign.patientDisplayName}’s hospital care expenses.
              </p>
              <button
                type="button"
                onClick={() => setShowDonateModal(true)}
                className="w-full btn-primary text-xs py-2.5 font-bold shadow-xs justify-center">
                Donate Now 💳
              </button>
            </div>

            {/* Recent Verified Donations Summary */}
            <div className="card p-6 border border-gray-200/80 bg-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <span>🤝</span> Recent Contributors
                </h3>
                <span className="text-[11px] text-gray-400">
                  {campaign.recentDonations?.length || 0} recent
                </span>
              </div>

              {!campaign.recentDonations || campaign.recentDonations.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  Be the first generous donor to support this campaign!
                </div>
              ) : (
                <div className="space-y-3">
                  {campaign.recentDonations.map((d) => (
                    <div key={d._id} className="text-xs space-y-1 pb-2 border-b border-gray-50 last:border-none">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{d.donorName}</span>
                        <span className="font-extrabold text-primary-700">
                          ₹{Number(d.amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {d.donorMessage && (
                        <p className="text-[11px] text-gray-500 italic bg-gray-50 p-1.5 rounded">
                          "{d.donorMessage}"
                        </p>
                      )}
                      <div className="text-[10px] text-gray-400">
                        {new Date(d.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nodal Verification Notice */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/70 text-xs space-y-2 text-gray-600">
              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                <span>🏛️</span> District Verification Guarantee
              </div>
              <p className="text-[11px] leading-relaxed">
                All supporting hospital certificates and estimate letters have been officially vetted by the
                District Social Welfare & Health Nodal Office.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showDonateModal && (
        <DonationForm
          campaign={campaign}
          onClose={() => setShowDonateModal(false)}
          onDonationComplete={() => {
            fetchProfile();
          }}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-glass w-full max-w-md p-6 animate-slide-up">
            <h3 className="text-base font-bold text-gray-900 mb-1">Report Suspicious Campaign</h3>
            <p className="text-xs text-gray-500 mb-4">
              Help district authorities maintain absolute platform integrity. If you suspect false medical
              claims, report them immediately:
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="label">Reason for Reporting *</label>
                <select
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="input text-xs font-semibold">
                  <option value="">Select a reason</option>
                  <option value="Inaccurate Medical Details">Inaccurate / Inflated Medical Details</option>
                  <option value="Duplicate Campaign">Duplicate Campaign</option>
                  <option value="Unregistered Hospital / Doctor">Unregistered Hospital / Doctor</option>
                  <option value="Suspected Identity Fraud">Suspected Identity Fraud</option>
                  <option value="Other">Other Violation</option>
                </select>
              </div>

              <div>
                <label className="label">Additional Details / Evidence</label>
                <textarea
                  rows={3}
                  placeholder="Provide any verifiable observations or references..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="input text-xs resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="btn-secondary btn-sm flex-1 justify-center">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="btn-danger btn-sm flex-1 justify-center">
                  {submittingReport ? 'Submitting…' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalAssistanceProfile;
