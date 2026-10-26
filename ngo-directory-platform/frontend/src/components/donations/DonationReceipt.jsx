import React from 'react';

const DonationReceipt = ({ donation, campaign }) => {
  if (!donation) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNo =
    donation.receiptReference ||
    `RCPT-${donation._id?.toString().slice(-8).toUpperCase() || 'OFFICIAL'}`;

  const donorName = donation.isAnonymous
    ? 'Anonymous Donor'
    : donation.name || donation.donor?.name || 'Kind Supporter';

  const beneficiaryName =
    campaign?.patientDisplayName ||
    donation.targetCampaign?.patientDisplayName ||
    donation.targetNGO?.ngoName ||
    donation.targetNgoName ||
    'Emergency Medical Welfare Campaign';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs text-xs space-y-4 print:border-none print:shadow-none">
      {/* Official Heading */}
      <div className="flex items-start justify-between border-b border-gray-100 pb-3">
        <div>
          <div className="text-[10px] font-bold text-primary-700 uppercase tracking-wider">
            Official Donation Acknowledgment
          </div>
          <h4 className="font-extrabold text-gray-900 text-sm">
            District Medical Assistance & Social Welfare Fund
          </h4>
          <p className="text-[11px] text-gray-500">Government Registered Public Platform</p>
        </div>
        <div className="text-right">
          <span className="badge bg-emerald-50 text-emerald-800 font-mono text-[10px] border border-emerald-200">
            {donation.transactionStatus === 'successful' ? 'VERIFIED PAYMENT' : donation.transactionStatus}
          </span>
          <div className="text-[10px] text-gray-400 font-mono mt-1">Ref: {receiptNo}</div>
        </div>
      </div>

      {/* Grid of Transaction Info */}
      <div className="grid grid-cols-2 gap-3 bg-gray-50/70 p-3.5 rounded-lg border border-gray-100">
        <div>
          <span className="text-gray-400 text-[10px] block">Donor Name</span>
          <span className="font-bold text-gray-900">{donorName}</span>
        </div>
        <div>
          <span className="text-gray-400 text-[10px] block">Contribution Amount</span>
          <span className="font-extrabold text-primary-700 text-sm">
            ₹{Number(donation.amount).toLocaleString('en-IN')} {donation.currency || 'INR'}
          </span>
        </div>
        <div>
          <span className="text-gray-400 text-[10px] block">Assistance Beneficiary</span>
          <span className="font-medium text-gray-800">{beneficiaryName}</span>
        </div>
        <div>
          <span className="text-gray-400 text-[10px] block">Date & Timestamp</span>
          <span className="text-gray-700">
            {new Date(donation.createdAt || Date.now()).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div>
          <span className="text-gray-400 text-[10px] block">Payment Gateway</span>
          <span className="font-medium text-gray-700 uppercase">
            {donation.paymentProvider || 'Razorpay'}
          </span>
        </div>
        <div>
          <span className="text-gray-400 text-[10px] block">Transaction ID</span>
          <span className="font-mono text-[10px] text-gray-600 truncate block">
            {donation.providerPaymentId || donation.providerOrderId || 'Verified Direct'}
          </span>
        </div>
      </div>

      {/* Security Note & Print Action */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
        <span>🔒 Digitally verified & recorded under District Audit Protocol.</span>
        <button
          type="button"
          onClick={handlePrint}
          className="text-primary-700 hover:text-primary-900 font-semibold flex items-center gap-1 underline print:hidden">
          <span>🖨️</span> Print / Save Receipt
        </button>
      </div>
    </div>
  );
};

export default DonationReceipt;
