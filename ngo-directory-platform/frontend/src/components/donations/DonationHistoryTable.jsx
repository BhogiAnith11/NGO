import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DonationReceipt from './DonationReceipt';

const DonationHistoryTable = ({ donations = [], emptyMsg = 'No donations logged yet.' }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  if (donations.length === 0) {
    return (
      <div className="card p-12 text-center text-gray-400 border border-gray-100">
        <div className="text-3xl mb-2">🤝</div>
        <p className="font-medium text-xs md:text-sm text-gray-600">{emptyMsg}</p>
        <p className="text-[11px] text-gray-400 mt-1">
          When you support medical assistance campaigns, your confirmed transactions and receipts appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden border border-gray-200/80 shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
                <th className="text-left px-5 py-3">Beneficiary / Campaign</th>
                <th className="text-left px-5 py-3">Contribution</th>
                <th className="text-left px-5 py-3">Type / Mode</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-right px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {donations.map((d) => {
                const campaignTitle =
                  d.targetCampaign?.patientDisplayName ||
                  d.targetNGO?.ngoName ||
                  d.targetNgoName ||
                  'District Welfare Initiative';

                const campaignUrl = d.targetCampaign?._id
                  ? `/medical-assistance/${d.targetCampaign._id}`
                  : d.targetNGO?._id
                  ? `/ngos/${d.targetNGO._id}`
                  : null;

                return (
                  <tr key={d._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      {campaignUrl ? (
                        <Link
                          to={campaignUrl}
                          className="font-bold text-gray-900 hover:text-primary-700 block">
                          {campaignTitle}
                        </Link>
                      ) : (
                        <div className="font-bold text-gray-900">{campaignTitle}</div>
                      )}
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        Ref: {d.receiptReference || d._id.slice(-8)}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-extrabold text-primary-700 text-sm">
                        ₹{Number(d.amount).toLocaleString('en-IN')}
                      </span>
                      {d.isAnonymous && (
                        <span className="badge bg-gray-100 text-gray-500 text-[10px] ml-1.5">
                          Anonymous
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="badge bg-blue-50 text-blue-700 text-[10px] capitalize">
                        {d.targetType === 'medical_campaign' ? 'Medical Aid' : 'General / NGO'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`badge text-[10px] font-semibold ${
                          d.transactionStatus === 'successful' || d.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : d.transactionStatus === 'pending'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-red-50 text-red-800'
                        }`}>
                        {d.transactionStatus || d.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {new Date(d.createdAt || d.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(d)}
                        className="px-2.5 py-1 text-xs font-semibold text-primary-700 hover:text-primary-900 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                        View Receipt 🧾
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-glass w-full max-w-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Donation Receipt Details</h3>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <DonationReceipt donation={selectedReceipt} campaign={selectedReceipt.targetCampaign} />

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="btn-secondary btn-sm text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationHistoryTable;
