import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register as registerAPI, createNGO } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FOCUS_AREAS = [
  'Education', 'Health', 'Environment', 'Women Empowerment',
  'Child Welfare', 'Rural Development', 'Livelihood',
  'Disaster Relief', 'Animal Welfare', 'Other',
];

const ROLES = [
  { value: 'donor', label: 'Donor', icon: '💰', desc: 'Support NGOs financially' },
  { value: 'volunteer', label: 'Volunteer', icon: '🙋', desc: 'Contribute time & skills' },
  { value: 'ngo', label: 'NGO', icon: '🏛️', desc: 'Register your organization' },
];

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: '',
    // NGO-specific
    ngoName: '', registrationNumber: '', focusAreas: [],
    serviceRegion: '', address: '', contactEmail: '',
    contactPhone: '', website: '', description: '',
    logo: null,
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleArea = (area) => {
    set('focusAreas',
      form.focusAreas.includes(area)
        ? form.focusAreas.filter((a) => a !== area)
        : [...form.focusAreas, area]
    );
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await registerAPI({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role,
      });
      login(res.data.data);

      // If NGO, also create the NGO profile
      if (form.role === 'ngo') {
        const fd = new FormData();
        fd.append('ngoName', form.ngoName);
        fd.append('registrationNumber', form.registrationNumber);
        fd.append('focusAreas', JSON.stringify(form.focusAreas));
        fd.append('serviceRegion', form.serviceRegion);
        fd.append('address', form.address);
        fd.append('contactEmail', form.contactEmail || form.email);
        fd.append('contactPhone', form.contactPhone || form.phone);
        fd.append('website', form.website);
        fd.append('description', form.description);
        if (form.logo) fd.append('logo', form.logo);
        await createNGO(fd);
      }

      toast.success('Account created successfully!');
      if (form.role === 'ngo') navigate('/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.role) return toast.error('Please select your role');
      if (!form.name || !form.email || !form.password) return toast.error('Please fill all required fields');
      if (form.role !== 'ngo') { handleRegister(); return; }
      setStep(2);
    } else {
      if (!form.ngoName || !form.registrationNumber || form.focusAreas.length === 0 || !form.serviceRegion) {
        return toast.error('Please fill all required NGO fields');
      }
      handleRegister();
    }
  };

  return (
    <div className="min-h-screen bg-surface py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="card p-8 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">NGO Directory Platform</p>
            {form.role === 'ngo' && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {[1, 2].map((s) => (
                  <div key={s} className={`h-2 w-16 rounded-full transition-all ${s <= step ? 'bg-primary-600' : 'bg-gray-200'}`} />
                ))}
                <span className="text-xs text-gray-500 ml-2">Step {step} of 2</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} id="register-form" className="space-y-5">
            {step === 1 && (
              <>
                {/* Role selector */}
                <div>
                  <label className="label">I am a…</label>
                  <div className="grid grid-cols-3 gap-3">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        id={`role-${r.value}`}
                        onClick={() => set('role', r.value)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          form.role === r.value
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className="text-2xl mb-1">{r.icon}</div>
                        <div className="font-semibold text-sm text-gray-900">{r.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-tight">{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="reg-name">Full Name *</label>
                    <input id="reg-name" type="text" required placeholder="Your name"
                      value={form.name} onChange={(e) => set('name', e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label" htmlFor="reg-phone">Phone Number</label>
                    <input id="reg-phone" type="tel" placeholder="+91 XXXXX XXXXX"
                      value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input" />
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="reg-email">Email Address *</label>
                  <input id="reg-email" type="email" required placeholder="you@example.com"
                    value={form.email} onChange={(e) => set('email', e.target.value)} className="input" />
                </div>

                <div>
                  <label className="label" htmlFor="reg-password">Password *</label>
                  <input id="reg-password" type="password" required placeholder="Min. 6 characters" minLength={6}
                    value={form.password} onChange={(e) => set('password', e.target.value)} className="input" />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                  <strong>NGO Profile Details</strong> — This information will be reviewed by the district admin before your NGO is publicly listed.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="ngo-name">NGO Name *</label>
                    <input id="ngo-name" type="text" required placeholder="Full legal name"
                      value={form.ngoName} onChange={(e) => set('ngoName', e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label" htmlFor="reg-no">Registration Number *</label>
                    <input id="reg-no" type="text" required placeholder="e.g. MH/2020/001"
                      value={form.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value)} className="input" />
                  </div>
                </div>

                <div>
                  <label className="label">Focus Areas * (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {FOCUS_AREAS.map((area) => (
                      <button key={area} type="button"
                        onClick={() => toggleArea(area)}
                        className={`badge text-sm px-3 py-1.5 transition-all ${
                          form.focusAreas.includes(area)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}>
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="service-region">Service Region / Villages * (comma-separated)</label>
                  <input id="service-region" type="text" required
                    placeholder="e.g. Nashik, Igatpuri, Trimbakeshwar"
                    value={form.serviceRegion} onChange={(e) => set('serviceRegion', e.target.value)} className="input" />
                </div>

                <div>
                  <label className="label" htmlFor="ngo-address">Address</label>
                  <input id="ngo-address" type="text"
                    placeholder="Office address"
                    value={form.address} onChange={(e) => set('address', e.target.value)} className="input" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="contact-email">Contact Email</label>
                    <input id="contact-email" type="email" placeholder="ngo@example.com"
                      value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="label" htmlFor="ngo-website">Website</label>
                    <input id="ngo-website" type="url" placeholder="https://yourngo.org"
                      value={form.website} onChange={(e) => set('website', e.target.value)} className="input" />
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="ngo-desc">Description</label>
                  <textarea id="ngo-desc" rows={3}
                    placeholder="Brief description of your NGO's mission and work..."
                    value={form.description} onChange={(e) => set('description', e.target.value)}
                    className="input resize-none" />
                </div>

                <div>
                  <label className="label" htmlFor="ngo-logo">Logo / Photo (max 2MB)</label>
                  <input id="ngo-logo" type="file" accept="image/*"
                    onChange={(e) => set('logo', e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer" />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">
                  Back
                </button>
              )}
              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 justify-center text-base py-3">
                {loading ? 'Creating account…' : step === 1 && form.role === 'ngo' ? 'Next →' : 'Create Account'}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
