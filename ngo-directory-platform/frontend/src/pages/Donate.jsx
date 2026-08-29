import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createDonation, getNGOs } from '../services/api';

const DONATION_TYPES = [
  { id: 'money', label: 'Financial Contribution', icon: '💳', desc: 'Support welfare missions with direct funding' },
  { id: 'food', label: 'Food & Nutrition', icon: '🍲', desc: 'Ration kits, cooked meals, grocery supplies' },
  { id: 'clothing', label: 'Clothing & Warmth', icon: '👕', desc: 'Clean clothes, blankets, winter essentials' },
  { id: 'education', label: 'Educational Supplies', icon: '📚', desc: 'School bags, stationery, textbooks, tablets' },
  { id: 'medical', label: 'Medical & First Aid', icon: '💊', desc: 'Medicines, hygiene kits, first aid boxes' },
  { id: 'other', label: 'Other In-Kind Relief', icon: '📦', desc: 'Shelter kits, disaster aid, equipment' },
];

const PRESET_AMOUNTS = [250, 500, 1000, 2500, 5000, 10000];

const Donate = () => {
  const [searchParams] = useSearchParams();
  const preselectedNgoId = searchParams.get('ngoId');

  const [ngos, setNgos] = useState([]);
  const [selectedType, setSelectedType] = useState('money');
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [targetNgoId, setTargetNgoId] = useState(preselectedNgoId || '');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    itemDescription: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    getNGOs({ status: 'approved' })
      .then((res) => setNgos(res.data.data || []))
      .catch(() => setNgos([]));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAmountSelect = (val) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    setCustomAmount(e.target.value);
    setAmount(Number(e.target.value) || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error('Please enter your full name');
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.replace(/[\s\-\+]/g, '').slice(-10))) {
      return toast.error('Please enter a valid 10-digit phone number');
    }
    if (!form.location.trim()) return toast.error('Please enter your city/location');
    if (selectedType === 'money' && (!amount || amount <= 0)) {
      return toast.error('Please enter a valid donation amount');
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        date: form.date,
        location: form.location,
        donationType: selectedType,
        amount: selectedType === 'money' ? Number(amount) : undefined,
        targetNgoId: targetNgoId || undefined,
        itemDescription: form.itemDescription,
      };

      const res = await createDonation(payload);
      toast.success('Thank you! Your donation was registered successfully. 🙏');
      setReceiptData(res.data.data);
      setForm({
        name: '',
        phone: '',
        email: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        itemDescription: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Donation submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="container-main max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            🤝 District Social Impact & Giving
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Contribute to Community Welfare
          </h1>
          <p className="text-gray-600 text-sm mt-2 leading-relaxed">
            Support verified district NGOs with financial contributions or in-kind donations (food, clothes, books, and medical supplies).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Donation Form */}
          <div className="lg:col-span-8">
            <div className="card p-6 md:p-8 border border-gray-100 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Donation Type Selector */}
                <div>
                  <label className="label">Select Donation Category *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {DONATION_TYPES.map((t) => {
                      const isSelected = selectedType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedType(t.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-primary-600 bg-primary-50/70 ring-2 ring-primary-500 shadow-xs'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}>
                          <div className="text-2xl mb-1">{t.icon}</div>
                          <div className="font-bold text-xs text-gray-900 leading-tight">{t.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Amount Selection (if Money) */}
                {selectedType === 'money' && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 animate-fade-in">
                    <label className="label">Contribution Amount (INR) *</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {PRESET_AMOUNTS.map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleAmountSelect(val)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            amount === val && !customAmount
                              ? 'bg-primary-600 text-white shadow-xs'
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300'
                          }`}>
                          ₹{val.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>

                    <div>
                      <input
                        type="number"
                        min="10"
                        placeholder="Or enter custom amount (₹)..."
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        className="input text-sm py-2"
                      />
                    </div>
                  </div>
                )}

                {/* 3. In-kind Description (if not Money) */}
                {selectedType !== 'money' && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-fade-in">
                    <label className="label">Item Details & Quantity *</label>
                    <textarea
                      name="itemDescription"
                      rows={2}
                      placeholder="e.g. 50 Notebooks & School bags, 10 Ration kits, 20 Winter blankets..."
                      value={form.itemDescription}
                      onChange={handleChange}
                      className="input text-sm resize-none"
                      required
                    />
                  </div>
                )}

                {/* 4. Target NGO Picker */}
                <div>
                  <label className="label">Allocate Contribution To</label>
                  <select
                    value={targetNgoId}
                    onChange={(e) => setTargetNgoId(e.target.value)}
                    className="select text-sm">
                    <option value="">🏛️ District General Welfare Fund (Distributed as needed)</option>
                    {ngos.map((ngo) => (
                      <option key={ngo._id} value={ngo._id}>
                        {ngo.ngoName} ({ngo.focusAreas?.slice(0, 2).join(', ')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Donor Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Donor / Organization Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Your full name or company"
                      value={form.name}
                      onChange={handleChange}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="label">Mobile Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="10-digit mobile number"
                      value={form.phone}
                      onChange={handleChange}
                      className="input text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email Address (Optional)</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="For receipt & acknowledgment"
                      value={form.email}
                      onChange={handleChange}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="label">City / Location *</label>
                    <input
                      type="text"
                      name="location"
                      required
                      placeholder="e.g. Nashik, Sinnar, Malegaon"
                      value={form.location}
                      onChange={handleChange}
                      className="input text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-center text-base py-3 shadow-md">
                  {isSubmitting ? 'Processing Contribution…' : `Confirm ${selectedType === 'money' ? `Donation of ₹${amount.toLocaleString('en-IN')}` : 'Donation Pledge'} →`}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Guidelines */}
          <div className="lg:col-span-4 space-y-5">
            <div className="card p-6 border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/30">
              <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                <span>🛡️ Transparency Pledge</span>
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                All donations logged through this government digital portal are audited and routed directly to verified local NGOs or coordinated district welfare distribution centers.
              </p>
            </div>

            <div className="card p-6 border border-gray-100 space-y-3 text-xs text-gray-600">
              <h4 className="font-bold text-gray-900 text-sm">How In-Kind Pickups Work</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary-600">1.</span>
                  <span>Submit the form with your pickup city and item quantities.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary-600">2.</span>
                  <span>The selected NGO or volunteer logistics team contacts you within 24 hours.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-primary-600">3.</span>
                  <span>Items are collected and distributed with photographic proof posted in the Activity Feed.</span>
                </div>
              </div>
            </div>

            <div className="card p-6 border border-gray-100 text-center">
              <div className="text-2xl mb-1">🏢</div>
              <h4 className="font-bold text-gray-900 text-sm">Corporate CSR Partnerships</h4>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Looking for formalized MoU agreements or large-scale district welfare sponsorship?
              </p>
              <Link to="/contact" className="btn-secondary btn-sm w-full justify-center text-xs">
                Contact District CSR Desk
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Success Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setReceiptData(null)} />
          <div className="relative bg-white rounded-2xl shadow-glass w-full max-w-md p-6 text-center animate-slide-up">
            <div className="w-16 h-16 bg-emerald/10 text-emerald-dark rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✓
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Thank You for Your Support!</h3>
            <p className="text-xs text-gray-500 mb-5">
              Your contribution acknowledgment has been registered in the district social welfare records.
            </p>

            <div className="bg-gray-50 p-4 rounded-xl text-left space-y-2 text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-gray-500">Donor:</span>
                <span className="font-bold text-gray-800">{receiptData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="font-semibold text-primary-700 capitalize">{receiptData.donationType}</span>
              </div>
              {receiptData.amount && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-bold text-emerald-dark">₹{receiptData.amount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Beneficiary Fund:</span>
                <span className="font-medium text-gray-800">{receiptData.targetNgoName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location:</span>
                <span className="text-gray-800">{receiptData.location}</span>
              </div>
            </div>

            <button
              onClick={() => setReceiptData(null)}
              className="btn-primary w-full justify-center text-sm py-2.5">
              Done & Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donate;
