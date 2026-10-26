import React from 'react';

const formatINR = (n) => {
  if (n === null || n === undefined) return '0';
  return Number(n).toLocaleString('en-IN');
};

const CampaignProgress = ({
  fundingTarget = 0,
  amountRaised = 0,
  remainingAmount,
  progressPercentage,
  successfulDonationCount = 0,
  compact = false,
  showStats = true,
}) => {
  const target = Number(fundingTarget) || 0;
  const raised = Number(amountRaised) || 0;
  const remaining = remainingAmount !== undefined ? remainingAmount : Math.max(0, target - raised);
  const percentage =
    progressPercentage !== undefined
      ? progressPercentage
      : target > 0
      ? Math.min(100, Math.round((raised / target) * 100 * 10) / 10)
      : 0;

  return (
    <div className="w-full space-y-2">
      {/* Financial Numbers Bar */}
      <div className="flex items-baseline justify-between text-xs">
        <div>
          <span className="text-gray-400 text-[11px] block">Raised</span>
          <span className="font-extrabold text-primary-700 text-sm md:text-base">
            ₹{formatINR(raised)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-gray-400 text-[11px] block">Goal</span>
          <span className="font-bold text-gray-800 text-sm md:text-base">
            ₹{formatINR(target)}
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/60">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage >= 100
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
              : 'bg-gradient-to-r from-primary-600 to-emerald-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>

      {/* Secondary Information */}
      {showStats && (
        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
          <div className="flex items-center gap-1 font-semibold text-primary-700">
            <span>{percentage}% funded</span>
            {percentage >= 100 && <span className="text-emerald-600 font-bold">✓ Goal Reached</span>}
          </div>
          <div>
            {remaining > 0 ? (
              <span>₹{formatINR(remaining)} needed</span>
            ) : (
              <span className="text-emerald-700 font-medium">Fully Supported</span>
            )}
            {!compact && successfulDonationCount > 0 && (
              <span className="text-gray-400 ml-2">
                • {successfulDonationCount} {successfulDonationCount === 1 ? 'donation' : 'donations'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignProgress;
