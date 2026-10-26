import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { createPaymentOrder } from '../../services/donationService';
import { openRazorpayCheckout } from './PaymentCheckout';
import DonationReceipt from './DonationReceipt';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

const DonationForm = ({ campaign, onClose, onDonationComplete }) => {
  const { user } = useAuth();

  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [donorMessage, setDonorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completedDonation, setCompletedDonation] = useState(null);

  const selectedAmount = customAmount ? Number(customAmount) : Number(amount);

  const handlePresetSelect = (val) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e) => {
    setCustomAmount(e.target.value);
  };

  const handleDonate = async (e) => {
    e.preventDefault();

    if (!selectedAmount || selectedAmount < 1) {
      toast.error('Please enter a valid donation amount (at least ₹1)');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create order on backend
      const res = await createPaymentOrder({
        amount: selectedAmount,
        targetCampaignId: campaign._id,
        isAnonymous,
        name: isAnonymous ? 'Anonymous' : name,
        email,
        phone,
        donorMessage,
      });

      const orderData = res.data.data;

      // 2. Open Razorpay checkout with server-side signature verification
      await openRazorpayCheckout({
        orderData,
        campaign,
        donorName: name,
        donorEmail: email,
        donorPhone: phone,
        onSuccess: (verifiedDonation) => {
          setCompletedDonation(verifiedDonation);
          if (onDonationComplete) onDonationComplete(verifiedDonation);
        },
        onFailure: () => {
          setSubmitting(false);
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Payment initiation failed');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative bg-white rounded-2xl shadow-glass w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-gray-100 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-primary-700 font-semibold bg-primary-50 px-2.5 py-0.5 rounded-full mb-1">
              <span>💳</span> Direct Medical Assistance Donation
            </div>
            <h3 className="font-bold text-gray-900 text-lg">
              Support {campaign?.patientDisplayName || 'Patient'}
            </h3>
            <p className="text-xs text-gray-500">
              {campaign?.conditionCategory} • 📍 {campaign?.district}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 font-bold text-base">
            ✕
          </button>
        </div>

        {/* If donation completed: show receipt & success screen */}
        {completedDonation ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
              <div className="text-3xl">🎉</div>
              <h4 className="font-bold text-emerald-900 text-base">Donation Verified & Confirmed!</h4>
              <p className="text-xs text-emerald-700">
                Your direct contribution of ₹{Number(completedDonation.amount).toLocaleString('en-IN')} has been
                successfully recorded and applied to the campaign.
              </p>
            </div>

            <DonationReceipt donation={completedDonation} campaign={campaign} />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-primary btn-sm text-xs px-5">
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* Main Donation Form */
          <form onSubmit={handleDonate} className="space-y-5 text-xs">
            {/* Amount Selection */}
            <div>
              <label className="label">Select Donation Amount (₹) *</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2.5">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handlePresetSelect(val)}
                    className={`py-2 px-1 text-center font-bold rounded-xl border transition-all text-xs ${
                      !customAmount && amount === val
                        ? 'border-primary-600 bg-primary-50 text-primary-700 ring-2 ring-primary-500'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50/50'
                    }`}>
                    ₹{val.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="1"
                  placeholder="Or enter custom amount in Rupees"
                  value={customAmount}
                  onChange={handleCustomChange}
                  className="input pl-8 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Donor Information */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="label mb-0">Donor Details</label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-primary-700">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600"
                  />
                  <span>Donate Anonymously</span>
                </label>
              </div>

              {!isAnonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1">Donor Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="For receipt delivery"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-gray-500 block mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] text-gray-500 block mb-1">
                  Words of Support / Encouragement (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Leave a heartfelt message for the patient and their family..."
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  className="input text-xs resize-none"
                />
              </div>
            </div>

            {/* Payment & Transparency Notice */}
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-gray-600 space-y-1">
              <div className="font-semibold text-primary-900 flex items-center gap-1">
                <span>🛡️</span>
                <span>Direct Donation & Fund Transparency Guarantee</span>
              </div>
              <p>
                Donations are processed securely via <strong>Razorpay</strong>. Funds are tracked in real-time, verified
                server-side, and held under nodal district supervision for direct medical disbursements to the authorized hospital.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary btn-sm text-xs">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || selectedAmount <= 0}
                className="btn-primary btn-sm text-xs px-6 py-2.5 font-bold shadow-md">
                {submitting
                  ? 'Verifying Checkout…'
                  : `Proceed to Pay ₹${selectedAmount.toLocaleString('en-IN')} →`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DonationForm;
