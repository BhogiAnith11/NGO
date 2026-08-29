import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { sendConnectRequest } from '../services/api';

const ConnectButton = ({ ngoId, ngoName }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    if (!user) {
      toast.error('Please sign in to connect with this NGO');
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      toast.error('Admins cannot send connect requests');
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return toast.error('Please enter a message');

    setLoading(true);
    try {
      await sendConnectRequest(ngoId, { message });
      toast.success('Connect request sent successfully!');
      setOpen(false);
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button id="connect-btn" onClick={handleOpen} className="btn-primary w-full justify-center">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Connect / Collaborate
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-glass w-full max-w-md p-6 animate-slide-up">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Connect with {ngoName}</h3>
            <p className="text-sm text-gray-500 mb-4">
              Send a message to express your interest in collaborating, volunteering, or donating.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Your Message</label>
                <textarea
                  id="connect-message"
                  rows={4}
                  placeholder="Introduce yourself and explain how you'd like to connect..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input resize-none"
                  required
                />
              </div>
              <button
                id="send-connect-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center">
                {loading ? 'Sending…' : 'Send Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectButton;
