import React, { useState } from 'react';

const DocumentUpload = ({ files, onChange, maxFiles = 6, label = 'Upload Supporting Documents' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = (newFiles) => {
    setError('');
    const valid = [];
    const allowedExts = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];

    Array.from(newFiles).forEach((f) => {
      const ext = f.name.split('.').pop().toLowerCase();
      if (!allowedExts.includes(ext)) {
        setError(`"${f.name}" is not supported. Please upload PDF, JPG, PNG, or WEBP.`);
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setError(`"${f.name}" exceeds the 5MB file size limit.`);
        return;
      }
      valid.push(f);
    });

    if (files.length + valid.length > maxFiles) {
      setError(`You can upload a maximum of ${maxFiles} documents.`);
      return;
    }

    onChange([...files, ...valid]);
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700 block">{label}</label>
        <span className="text-[11px] text-gray-400">PDF, JPG, PNG (Max 5MB each)</span>
      </div>

      {/* Drag & drop box */}
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
          dragActive
            ? 'border-primary-500 bg-primary-50/50'
            : 'border-gray-300 hover:border-primary-400 bg-gray-50/50'
        }`}>
        <div className="text-2xl mb-1 text-primary-600">📄</div>
        <p className="text-xs text-gray-700 font-medium">
          Drag & drop medical reports, hospital estimates, prescriptions
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">or</p>
        <label className="inline-block mt-2 cursor-pointer btn-secondary btn-sm text-xs px-3 py-1">
          Browse Files
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
            className="hidden"
          />
        </label>
      </div>

      {error && <div className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded-lg">{error}</div>}

      {/* Selected file pills */}
      {files.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs">
              <div className="flex items-center gap-2 overflow-hidden pr-2">
                <span className="text-primary-600 flex-shrink-0">📎</span>
                <span className="font-medium text-gray-800 truncate">{file.name}</span>
                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="text-gray-400 hover:text-red-500 font-bold px-1.5">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
        <span>🔒</span>
        <span>
          Medical documents are kept private and accessible strictly to authorized district administrators and the patient.
        </span>
      </div>
    </div>
  );
};

export default DocumentUpload;
