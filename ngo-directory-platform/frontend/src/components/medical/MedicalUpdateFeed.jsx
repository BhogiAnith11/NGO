import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { createTreatmentUpdate } from '../../services/medicalAssistanceService';

const MedicalUpdateFeed = ({ campaignId, updates = [], isAuthorized = false, onUpdateAdded }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please enter update title and description');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('visibility', 'public');
      images.forEach((img) => formData.append('images', img));

      await createTreatmentUpdate(campaignId, formData);
      toast.success('Treatment update published successfully!');
      setTitle('');
      setDescription('');
      setImages([]);
      setShowModal(false);
      if (onUpdateAdded) onUpdateAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post treatment update');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-gray-900 text-base md:text-lg flex items-center gap-2">
            <span>🩺 Treatment Progress Updates</span>
            <span className="badge bg-primary-50 text-primary-700 text-xs font-semibold">
              {updates.length}
            </span>
          </h3>
          <p className="text-gray-500 text-xs">
            Direct medical updates from the patient, authorized representative, and hospital
          </p>
        </div>

        {isAuthorized && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-primary btn-sm text-xs">
            + Post Treatment Update
          </button>
        )}
      </div>

      {updates.length === 0 ? (
        <div className="card p-8 text-center text-gray-400 border border-dashed border-gray-200">
          <div className="text-3xl mb-1">📋</div>
          <p className="text-xs font-medium text-gray-600">No medical updates posted yet.</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            The patient or family will share recovery milestones and treatment progression here.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary-100">
          {updates.map((up) => (
            <div key={up._id} className="relative">
              {/* Timeline marker */}
              <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary-600 ring-4 ring-primary-100" />
              <div className="card p-4 border border-gray-100 shadow-xs bg-white">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                  <span className="font-semibold text-primary-700">{up.author?.name || 'Care Team'}</span>
                  <span>{new Date(up.publishedAt || up.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{up.title}</h4>
                <p className="text-gray-600 text-xs leading-relaxed whitespace-pre-line">
                  {up.description}
                </p>
                {up.images?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {up.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Treatment milestone"
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200 hover:scale-105 transition-transform"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Update Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-glass w-full max-w-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-gray-900 text-base">Post Treatment Progress Update</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="label">Update Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Surgery Completed Successfully / ICU Discharge"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="label">Medical Details & Situation Update *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe recent doctor evaluations, recovery status, medicine requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input text-xs resize-none"
                />
              </div>

              <div>
                <label className="label">Optional Medical Photos / Reports</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) setImages(Array.from(e.target.files));
                  }}
                  className="input text-xs py-1"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary btn-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary btn-sm">
                  {submitting ? 'Publishing…' : 'Publish Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalUpdateFeed;
