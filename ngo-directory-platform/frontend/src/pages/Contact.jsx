import { useState } from 'react';
import toast from 'react-hot-toast';
import { createContact } from '../services/api';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Please enter your name');
    if (!form.email.trim() || !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.email)) {
      return toast.error('Please enter a valid email address');
    }
    if (!form.message.trim()) return toast.error('Please enter your message');

    setIsSubmitting(true);
    try {
      await createContact(form);
      toast.success('Your message has been received by the District Nodal Office! ✉️');
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface py-12">
      <div className="container-main max-w-5xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            🏛️ District Administration Helpdesk
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Contact & Citizen Grievance Portal
          </h1>
          <p className="text-gray-600 text-sm mt-2 leading-relaxed">
            Have questions regarding NGO verification, CSR partnerships, welfare drives, or grievance redressal? Reach out to the District Nodal Office.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="card p-6 md:p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Send an Official Message</h2>
              <p className="text-xs text-gray-500 mb-6">
                All inquiries are logged and assigned a tracking ticket for review by the Social Welfare Officer.
              </p>

              {submitted ? (
                <div className="p-8 text-center bg-emerald/10 border border-emerald/20 rounded-2xl animate-fade-in">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="text-lg font-bold text-emerald-dark mb-1">Message Submitted Successfully</h3>
                  <p className="text-xs text-gray-600 mb-5">
                    Thank you for contacting the District Social Welfare Department. Our officers will respond to your registered email shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-primary btn-sm text-xs">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Anand Deshmukh"
                      value={form.name}
                      onChange={handleChange}
                      className="input text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Official Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="you@domain.com"
                        value={form.email}
                        onChange={handleChange}
                        className="input text-sm"
                      />
                    </div>
                    <div>
                      <label className="label">Phone / WhatsApp Number</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+91 XXXXX XXXXX"
                        value={form.phone}
                        onChange={handleChange}
                        className="input text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Subject / Topic</label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="e.g. NGO Registration query, CSR grant collaboration, Volunteer request"
                      value={form.subject}
                      onChange={handleChange}
                      className="input text-sm"
                    />
                  </div>

                  <div>
                    <label className="label">Message / Details *</label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      placeholder="Please describe your inquiry or feedback clearly..."
                      value={form.message}
                      onChange={handleChange}
                      className="input text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full justify-center text-sm py-3 shadow-md">
                    {isSubmitting ? 'Transmitting to Helpdesk…' : 'Submit Official Message →'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Department Contact Directory */}
          <div className="lg:col-span-5 space-y-5">
            {/* Contact Details Card */}
            <div className="card p-6 border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-3">
                District Nodal Directorate
              </h3>

              <div className="space-y-3.5 text-xs text-gray-600">
                <div className="flex items-start gap-3">
                  <span className="text-base text-primary-600">🏛️</span>
                  <div>
                    <div className="font-bold text-gray-800">Office Location</div>
                    <div>District Collectorate Complex, Old Agra Road, Nashik, Maharashtra - 422002</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-base text-primary-600">📞</span>
                  <div>
                    <div className="font-bold text-gray-800">Direct Helplines</div>
                    <div>General Helpdesk: +91 (0253) 2578900</div>
                    <div>NGO Verification: +91 (0253) 2578901</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-base text-primary-600">✉️</span>
                  <div>
                    <div className="font-bold text-gray-800">Official Correspondence</div>
                    <div>welfare.district@gov.in</div>
                    <div>csr.partnership@district.gov.in</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-base text-primary-600">⏰</span>
                  <div>
                    <div className="font-bold text-gray-800">Working Hours</div>
                    <div>Monday to Friday: 10:00 AM – 5:30 PM</div>
                    <div>Closed on 2nd & 4th Saturdays, Sundays & Public Holidays</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="card p-6 border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/40">
              <h4 className="font-bold text-gray-900 text-sm mb-2">Need Immediate Help?</h4>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Check our official directory to find verified NGOs working near your location.
              </p>
              <div className="space-y-2">
                <a href="/#directory" className="btn-secondary btn-sm w-full justify-center text-xs">
                  Search Directory by Taluka
                </a>
                <a href="/donate" className="btn-primary btn-sm w-full justify-center text-xs">
                  Contribute Supplies / Funds
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
