import React from 'react';
import { Link } from 'react-router-dom';
import CampaignProgress from './CampaignProgress';
import VerificationBadge from './VerificationBadge';

const MedicalAssistanceCard = ({ campaign, onDonateClick }) => {
  if (!campaign) return null;

  const {
    _id,
    patientDisplayName,
    patientPhoto,
    conditionCategory,
    district,
    serviceLocation,
    medicalSummary,
    hospitalDetails,
    fundingTarget,
    amountRaised = 0,
    remainingAmount,
    progressPercentage,
    successfulDonationCount = 0,
    urgency,
    verificationStatus = 'Approved',
  } = campaign;

  const target = Number(fundingTarget) || 0;
  const remaining = remainingAmount !== undefined ? remainingAmount : Math.max(0, target - amountRaised);

  // Category Icon Mapping
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Pediatric Care':
        return '👶';
      case 'Cancer Treatment':
        return '🎗️';
      case 'Surgery':
        return '🩺';
      case 'Accident & Trauma':
        return '🚨';
      case 'Organ Transplant':
        return '🫀';
      case 'Critical Care':
        return '🏥';
      case 'Chronic Illness':
        return '💊';
      default:
        return '❤️';
    }
  };

  return (
    <div className="card border border-gray-200/80 hover:border-primary-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group bg-white">
      {/* Top Banner & Urgency Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {patientPhoto ? (
              <img
                src={patientPhoto}
                alt={patientDisplayName}
                className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center text-2xl font-bold border border-primary-100">
                {getCategoryIcon(conditionCategory)}
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-primary-700 transition-colors">
                {patientDisplayName}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                <span className="font-medium text-primary-800">{conditionCategory}</span>
                <span>•</span>
                <span>📍 {district}</span>
              </div>
            </div>
          </div>
          <VerificationBadge status={verificationStatus} urgency={urgency} showUrgency={true} size="sm" />
        </div>

        {/* Short situation description */}
        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 min-h-[2.5rem] mb-3">
          {medicalSummary}
        </p>

        {/* Hospital information (where consented) */}
        {hospitalDetails?.hospitalName && hospitalDetails?.showHospitalPublicly && (
          <div className="bg-gray-50/80 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-600 flex items-center gap-1.5 mb-3 border border-gray-100">
            <span className="text-primary-600">🏥</span>
            <span className="truncate font-medium">{hospitalDetails.hospitalName}</span>
          </div>
        )}

        {/* Funding Progress */}
        <div className="pt-1">
          <CampaignProgress
            fundingTarget={target}
            amountRaised={amountRaised}
            remainingAmount={remaining}
            progressPercentage={progressPercentage}
            successfulDonationCount={successfulDonationCount}
            compact={false}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3.5 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between gap-2.5 mt-2">
        <Link
          to={`/medical-assistance/${_id}`}
          className="btn-secondary btn-sm text-xs flex-1 text-center justify-center">
          View Details
        </Link>
        <button
          type="button"
          onClick={() => (onDonateClick ? onDonateClick(campaign) : null)}
          className="btn-primary btn-sm text-xs flex-1 text-center justify-center shadow-xs">
          Donate Now 💳
        </button>
      </div>
    </div>
  );
};

export default MedicalAssistanceCard;
