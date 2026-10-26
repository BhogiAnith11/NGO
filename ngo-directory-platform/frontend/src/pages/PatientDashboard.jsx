import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getMyMedicalCampaigns,
  uploadAdditionalDocuments,
  closeCampaign,
} from '../services/medicalAssistanceService';
import CampaignProgress from '../components/medical/CampaignProgress';
import VerificationBadge from '../components/medical/VerificationBadge';
import DocumentUpload from '../components/medical/DocumentUpload';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Additional documents modal state
  const [docModalCampaign, setDocModalCampaign] = useState(null);
  const [additionalFiles, setAdditionalFiles] = useState([]);
  const [uploadingDocs, setUploadingDocs] = useState(false);

  // Close campaign modal state
  const [closeModalCampaign, setCloseModalCampaign] = useState(null);
  const [closeReason, setCloseReason] = useState('Treatment Completed');
  const [closing, setClosing] = useState(false);

  const loadData = async () => {
    try {
      const res = await getMyMedicalCampaigns();
      setCampaigns(res.data.data || []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadAdditionalDocs = async (e) => {
    e.preventDefault();
    if (additionalFiles.length === 0) {
      toast.error('Please choose at least one document to upload');
      return;
    }

    setUploadingDocs(true);
    try {
      const formData = new FormData();
      additionalFiles.forEach((file) => {
        formData.append('supportingDocuments', file);
      });
      formData.append('documentType', 'medical_report');

      await uploadAdditionalDocuments(docModalCampaign._id, formData);
      toast.success('Additional documents uploaded securely! Status moved to Pending for review.');
      setDocModalCampaign(null);
      setAdditionalFiles([]);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload documents');
    } finally {
      setUploadingDocs(false);
    }
  };

  const handleCloseCampaign = async (e) => {
    e.preventDefault();
    setClosing(true);
    try {
      await closeCampaign(closeModalCampaign._id, { reason: closeReason });
      toast.success('Campaign successfully marked as Completed.');
      setCloseModalCampaign(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close campaign');
    } finally {
      setClosing(false);
    }
  };

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
        {/* Top Header */}
        <div className="card p-6 md:p-8 bg-navy text-white rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs text-blue-200 mb-2">
              <span>🩺</span> Patient & Representative Self-Service Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Patient Medical Assistance Dashboard</h1>
            <p className="text-blue-200 text-xs mt-1">
              Track verification audits, confirmed direct donations, and post clinical progress updates.
            </p>
          </div>

          <Link to="/medical-assistance/new" className="btn-primary text-xs px-5 py-2.5 shadow-md self-start md:self-auto">
            + Create New Medical Request
          </Link>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4 bg-white border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center text-xl">
              📋
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{campaigns.length}</div>
              <div className="text-[11px] text-gray-500 font-semibold">Total Requests</div>
            </div>
          </div>

          <div className="card p-4 bg-white border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl">
              ✅
            </div>
            <div>
              <div className="text-xl font-bold text-emerald-800">
                {campaigns.filter((c) => c.verificationStatus === 'Approved').length}
              </div>
              <div className="text-[11px] text-gray-500 font-semibold">Approved Campaigns</div>
            </div>
          </div>

          <div className="card p-4 bg-white border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl">
              ⏳
            </div>
            <div>
              <div className="text-xl font-bold text-amber-800">
                {campaigns.filter((c) => ['Pending', 'Under Review'].includes(c.verificationStatus)).length}
              </div>
              <div className="text-[11px] text-gray-500 font-semibold">Under Audit</div>
            </div>
          </div>

          <div className="card p-4 bg-white border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl">
              💰
            </div>
            <div>
              <div className="text-xl font-bold text-purple-900">
                ₹
                {campaigns
                  .reduce((acc, c) => acc + (c.amountRaised || 0), 0)
                  .toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-gray-500 font-semibold">Total Funds Confirmed</div>
            </div>
          </div>
        </div>

        {/* Campaign List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span>Your Registered Medical Assistance Campaigns</span>
            <span className="badge bg-gray-100 text-gray-600 text-xs">{campaigns.length}</span>
          </h2>

          {campaigns.length === 0 ? (
            <div className="card p-12 text-center border border-dashed border-gray-200 bg-white space-y-3">
              <div className="text-3xl text-gray-400">🏥</div>
              <h3 className="text-sm font-bold text-gray-800">No medical requests submitted yet</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                If you or a family member requires financial support for urgent medical treatment, create a
                request with hospital certificates to begin the official verification process.
              </p>
              <Link to="/medical-assistance/new" className="btn-primary btn-sm text-xs inline-block">
                Start Medical Request →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((c) => (
                <div key={c._id} className="card p-6 border border-gray-200/80 bg-white space-y-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <VerificationBadge status={c.verificationStatus} urgency={c.urgency} showUrgency={true} />
                        <span className="badge bg-blue-50 text-blue-800 text-xs">{c.conditionCategory}</span>
                        {c.campaignStatus === 'Paused' && (
                          <span className="badge bg-red-100 text-red-800 text-xs">Campaign Paused</span>
                        )}
                        {c.campaignStatus === 'Completed' && (
                          <span className="badge bg-emerald-100 text-emerald-800 text-xs">Goal Reached / Completed</span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900">{c.patientDisplayName}</h3>
                      <p className="text-xs text-gray-500">
                        Submitted on{' '}
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        • 📍 {c.district}
                      </p>
                    </div>

                    {/* Quick Link to public profile if approved */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {c.verificationStatus === 'Approved' ? (
                        <Link
                          to={`/medical-assistance/${c._id}`}
                          className="btn-secondary btn-sm text-xs">
                          View Live Profile ↗
                        </Link>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">
                          Visible only after official nodal approval
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Document Request Alert (if admin asked for more documents) */}
                  {c.documentsRequested && c.verificationStatus === 'Under Review' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>⚠️</span> Official Action Required: Additional Documents Requested
                      </div>
                      <p className="text-amber-800 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-amber-100">
                        {c.documentsRequested}
                      </p>
                      <button
                        type="button"
                        onClick={() => setDocModalCampaign(c)}
                        className="btn-primary btn-sm text-xs bg-amber-700 hover:bg-amber-800">
                        Upload Requested Documents Now →
                      </button>
                    </div>
                  )}

                  {/* Rejection Notice */}
                  {c.rejectionReason && c.verificationStatus === 'Rejected' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1 text-xs text-red-900">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>❌</span> Application Rejected by District Officer
                      </div>
                      <p className="text-red-700">{c.rejectionReason}</p>
                    </div>
                  )}

                  {/* Financial Progress */}
                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                    <CampaignProgress
                      fundingTarget={c.fundingTarget}
                      amountRaised={c.amountRaised}
                      remainingAmount={c.remainingAmount}
                      progressPercentage={c.progressPercentage}
                      successfulDonationCount={c.successfulDonationCount}
                    />
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                    <div className="text-gray-500 text-[11px]">
                      {c.supportingDocuments?.length || 0} supporting documents on file
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setDocModalCampaign(c)}
                        className="px-3 py-1.5 border border-gray-200 hover:border-gray-300 rounded-lg text-gray-700 font-medium">
                        + Add Medical Documents
                      </button>

                      {c.verificationStatus === 'Approved' && c.campaignStatus !== 'Completed' && (
                        <button
                          type="button"
                          onClick={() => setCloseModalCampaign(c)}
                          className="px-3 py-1.5 border border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-medium">
                          Request Campaign Closure ✓
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Additional Documents Modal */}
      {docModalCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-glass w-full max-w-md p-6 animate-slide-up space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">Upload Additional Medical Documents</h3>
              <button
                type="button"
                onClick={() => setDocModalCampaign(null)}
                className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadAdditionalDocs} className="space-y-4 text-xs">
              <p className="text-gray-500 text-[11px]">
                Uploading supporting records for <strong>{docModalCampaign.patientDisplayName}</strong>.
              </p>

              <DocumentUpload
                files={additionalFiles}
                onChange={setAdditionalFiles}
                maxFiles={4}
                label="Select Additional Files"
              />

              <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDocModalCampaign(null)}
                  className="btn-secondary btn-sm text-xs">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDocs || additionalFiles.length === 0}
                  className="btn-primary btn-sm text-xs">
                  {uploadingDocs ? 'Uploading…' : 'Submit Documents'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Campaign Modal */}
      {closeModalCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-glass w-full max-w-md p-6 animate-slide-up space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Request Campaign Closure</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              When treatment is finished or your financial target is met, closing the campaign marks it as
              Completed and halts further donations.
            </p>

            <form onSubmit={handleCloseCampaign} className="space-y-3 text-xs">
              <div>
                <label className="label">Closure Reason *</label>
                <select
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  className="input text-xs font-semibold">
                  <option value="Treatment Completed Successfully">Treatment Completed Successfully</option>
                  <option value="Funding Goal Reached">Funding Goal Reached</option>
                  <option value="Alternative Government Grant Received">Alternative Government Grant Received</option>
                  <option value="Other">Other Reason</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCloseModalCampaign(null)}
                  className="btn-secondary btn-sm text-xs">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={closing}
                  className="btn-success btn-sm text-xs">
                  {closing ? 'Processing…' : 'Confirm Closure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
