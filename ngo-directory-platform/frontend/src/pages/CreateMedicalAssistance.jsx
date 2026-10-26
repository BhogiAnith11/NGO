import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { submitApplication } from '../services/medicalAssistanceService';
import MedicalProfileForm from '../components/medical/MedicalProfileForm';

const CreateMedicalAssistance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await submitApplication(formData);
      toast.success(
        res.data.message ||
          'Application submitted successfully! Our district health verification team will review your documents.'
      );
      navigate('/patient-dashboard');
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to submit medical assistance application'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="card p-8 max-w-md w-full border border-gray-200/80 shadow-md space-y-4">
          <div className="text-4xl mb-1">🔐</div>
          <h2 className="text-xl font-bold text-gray-900">Authentication Required</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Please log in or register a free citizen account before creating an emergency medical assistance
            application. This allows you to track verification status, upload bills, and manage donations.
          </p>
          <div className="flex gap-3 pt-2">
            <Link to="/login" className="btn-secondary btn-sm flex-1 text-center justify-center">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary btn-sm flex-1 text-center justify-center">
              Register Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-10">
      <div className="container-main max-w-4xl space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-primary-700">Home</Link>
          <span>/</span>
          <Link to="/medical-assistance" className="hover:text-primary-700">Emergency Assistance</Link>
          <span>/</span>
          <span className="font-semibold text-gray-800">New Application</span>
        </div>

        {/* Main Banner */}
        <div className="card p-6 md:p-8 bg-gradient-to-r from-navy to-primary-900 text-white rounded-2xl shadow-sm space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs text-blue-200">
            <span>🏛️</span> District Social Welfare Medical Aid Protocol
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Apply for Emergency Medical Assistance
          </h1>
          <p className="text-blue-100 text-xs md:text-sm max-w-2xl font-light leading-relaxed">
            Fill in the patient's diagnostic details, hospital billing estimate, and upload supporting clinical
            reports. All new applications are placed in a secure <strong>Pending</strong> state and audited by the
            District Nodal Officer before public directory listing.
          </p>
        </div>

        {/* Medical Form */}
        <MedicalProfileForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

export default CreateMedicalAssistance;
