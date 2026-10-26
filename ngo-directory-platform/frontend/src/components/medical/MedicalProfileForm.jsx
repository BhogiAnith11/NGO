import React, { useState } from 'react';
import DocumentUpload from './DocumentUpload';

const CATEGORIES = [
  'Critical Care',
  'Cancer Treatment',
  'Surgery',
  'Accident & Trauma',
  'Pediatric Care',
  'Organ Transplant',
  'Chronic Illness',
  'Emergency Medical',
  'Other',
];

const RELATIONSHIPS = [
  'Self',
  'Parent',
  'Spouse',
  'Child',
  'Sibling',
  'Legal Guardian',
  'Authorized Relative',
  'Authorized Volunteer / NGO Representative',
];

const MedicalProfileForm = ({ initialData = {}, onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    patientDisplayName: initialData.patientDisplayName || '',
    fullName: initialData.privatePatientDetails?.fullName || '',
    age: initialData.privatePatientDetails?.age || '',
    contactPhone: initialData.privatePatientDetails?.contactPhone || '',
    contactEmail: initialData.privatePatientDetails?.contactEmail || '',
    address: initialData.privatePatientDetails?.address || '',
    district: initialData.district || 'Nashik',
    village: initialData.privatePatientDetails?.village || '',
    emergencyContact: initialData.privatePatientDetails?.emergencyContact || '',
    amountAlreadyReceived: initialData.privatePatientDetails?.amountAlreadyReceived || '',

    representativeName: initialData.representative?.name || '',
    representativeRelationship: initialData.representative?.relationship || 'Self',
    representativePhone: initialData.representative?.phone || '',
    representativeEmail: initialData.representative?.email || '',

    conditionCategory: initialData.conditionCategory || 'Surgery',
    medicalSummary: initialData.medicalSummary || '',
    treatmentDetails: initialData.treatmentDetails || '',
    hospitalName: initialData.hospitalDetails?.hospitalName || '',
    hospitalLocation: initialData.hospitalDetails?.hospitalLocation || '',
    doctorName: initialData.hospitalDetails?.doctorName || '',
    estimatedCost: initialData.hospitalDetails?.estimatedCost || '',
    showHospitalPublicly: initialData.hospitalDetails?.showHospitalPublicly !== false,

    fundingTarget: initialData.fundingTarget || '',
    urgency: initialData.urgency || 'urgent',
    treatmentDeadline: initialData.treatmentDeadline ? initialData.treatmentDeadline.slice(0, 10) : '',

    publicConsent: initialData.publicConsent !== false,
  });

  const [patientPhoto, setPatientPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialData.patientPhoto || null);
  const [supportingDocuments, setSupportingDocuments] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPatientPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== undefined && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    if (patientPhoto) {
      data.append('patientPhoto', patientPhoto);
    }

    supportingDocuments.forEach((doc) => {
      data.append('supportingDocuments', doc);
    });

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in text-gray-800">
      {/* 1. PATIENT IDENTITY & PRIVACY DETAILS */}
      <div className="card p-6 border border-gray-200/80 bg-white space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <span className="text-xl">👤</span>
          <div>
            <h3 className="text-base font-bold text-gray-900">1. Patient Identification & Privacy</h3>
            <p className="text-xs text-gray-500">
              Personal contact details remain strictly confidential; choose a public display name for the directory.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="label">
              Public Display Name *{' '}
              <span className="text-gray-400 font-normal">(e.g. Baby Aarav / Patient S.K.)</span>
            </label>
            <input
              type="text"
              name="patientDisplayName"
              required
              placeholder="e.g. Master Aarav (4 Years)"
              value={formData.patientDisplayName}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">
              Patient Legal Full Name * <span className="text-gray-400 font-normal">(Private / Audit only)</span>
            </label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="Full legal name as per hospital records"
              value={formData.fullName}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">Patient Age *</label>
            <input
              type="number"
              name="age"
              required
              min="0"
              max="120"
              placeholder="e.g. 4"
              value={formData.age}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">District *</label>
            <input
              type="text"
              name="district"
              required
              placeholder="e.g. Nashik"
              value={formData.district}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">Village / Locality</label>
            <input
              type="text"
              name="village"
              placeholder="e.g. Deolali / Wadivarhe"
              value={formData.village}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">Patient Contact Phone *</label>
            <input
              type="tel"
              name="contactPhone"
              required
              placeholder="10-digit mobile number"
              value={formData.contactPhone}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">Emergency Contact Phone *</label>
            <input
              type="tel"
              name="emergencyContact"
              required
              placeholder="Alternate emergency phone"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">Patient Email Address (Optional)</label>
            <input
              type="email"
              name="contactEmail"
              placeholder="patient@example.com"
              value={formData.contactEmail}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Residential Address (Private)</label>
            <input
              type="text"
              name="address"
              placeholder="Complete residential address for district nodal verification"
              value={formData.address}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Patient Photograph (Optional public image with consent)</label>
            <div className="flex items-center gap-4">
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="input text-xs py-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. REPRESENTATIVE DETAILS */}
      <div className="card p-6 border border-gray-200/80 bg-white space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <span className="text-xl">🤝</span>
          <div>
            <h3 className="text-base font-bold text-gray-900">2. Submitter / Authorized Representative</h3>
            <p className="text-xs text-gray-500">
              Relationship of the person submitting the medical assistance request to the patient.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="label">Relationship to Patient *</label>
            <select
              name="representativeRelationship"
              value={formData.representativeRelationship}
              onChange={handleChange}
              className="input text-xs">
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Representative Full Name</label>
            <input
              type="text"
              name="representativeName"
              placeholder="Your full legal name"
              value={formData.representativeName}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">Representative Mobile Phone</label>
            <input
              type="tel"
              name="representativePhone"
              placeholder="Your contact number"
              value={formData.representativePhone}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">Representative Email</label>
            <input
              type="email"
              name="representativeEmail"
              placeholder="Your email address"
              value={formData.representativeEmail}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. MEDICAL & HOSPITAL DETAILS */}
      <div className="card p-6 border border-gray-200/80 bg-white space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <span className="text-xl">🏥</span>
          <div>
            <h3 className="text-base font-bold text-gray-900">3. Medical Condition & Hospital Details</h3>
            <p className="text-xs text-gray-500">
              Accurate clinical details for verification against medical reports and bills.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="label">Medical Condition Category *</label>
            <select
              name="conditionCategory"
              value={formData.conditionCategory}
              onChange={handleChange}
              className="input text-xs font-semibold">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Urgency Level *</label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="input text-xs font-semibold">
              <option value="routine">Routine Support</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical (ICU / Imminent Surgery)</option>
              <option value="life_threatening">Life Threatening (Immediate Emergency)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label">Injury or Medical Diagnosis Summary *</label>
            <textarea
              name="medicalSummary"
              required
              rows={3}
              placeholder="State the diagnosis, onset date, current health state, and why urgent aid is needed..."
              value={formData.medicalSummary}
              onChange={handleChange}
              className="input text-xs resize-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">Treatment & Procedure Details</label>
            <textarea
              name="treatmentDetails"
              rows={2}
              placeholder="e.g. Cardiac valve replacement, chemotherapy protocol, intensive care..."
              value={formData.treatmentDetails}
              onChange={handleChange}
              className="input text-xs resize-none"
            />
          </div>

          <div>
            <label className="label">Hospital Name *</label>
            <input
              type="text"
              name="hospitalName"
              required
              placeholder="e.g. Apollo Speciality Hospital"
              value={formData.hospitalName}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">Hospital City / Location</label>
            <input
              type="text"
              name="hospitalLocation"
              placeholder="e.g. Nashik Central"
              value={formData.hospitalLocation}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">Attending Doctor Name</label>
            <input
              type="text"
              name="doctorName"
              placeholder="e.g. Dr. S. K. Kulkarni"
              value={formData.doctorName}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="showHospitalPublicly"
              name="showHospitalPublicly"
              checked={formData.showHospitalPublicly}
              onChange={handleChange}
              className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="showHospitalPublicly" className="text-xs text-gray-700 font-medium">
              Display hospital name publicly on campaign card
            </label>
          </div>
        </div>
      </div>

      {/* 4. FINANCIAL AID & DEADLINE */}
      <div className="card p-6 border border-gray-200/80 bg-white space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <span className="text-xl">💰</span>
          <div>
            <h3 className="text-base font-bold text-gray-900">4. Financial Requirement & Funding Target</h3>
            <p className="text-xs text-gray-500">
              State total estimated hospital expenses and required assistance from public donors.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="label">Total Estimated Treatment Cost (₹)</label>
            <input
              type="number"
              name="estimatedCost"
              min="0"
              placeholder="e.g. 350000"
              value={formData.estimatedCost}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">Financial Assistance Required from Donors (₹) *</label>
            <input
              type="number"
              name="fundingTarget"
              required
              min="100"
              placeholder="Target amount to raise, e.g. 300000"
              value={formData.fundingTarget}
              onChange={handleChange}
              className="input text-xs font-bold text-primary-700"
            />
          </div>

          <div>
            <label className="label">Amount Already Received from Other Sources / Insurance (₹)</label>
            <input
              type="number"
              name="amountAlreadyReceived"
              min="0"
              placeholder="e.g. 50000"
              value={formData.amountAlreadyReceived}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="label">Required Funding Deadline *</label>
            <input
              type="date"
              name="treatmentDeadline"
              required
              value={formData.treatmentDeadline}
              onChange={handleChange}
              className="input text-xs"
            />
          </div>
        </div>
      </div>

      {/* 5. SUPPORTING MEDICAL DOCUMENTS */}
      <div className="card p-6 border border-gray-200/80 bg-white space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <span className="text-xl">📑</span>
          <div>
            <h3 className="text-base font-bold text-gray-900">5. Supporting Medical Documents</h3>
            <p className="text-xs text-gray-500">
              Upload doctor prescriptions, diagnostic reports, and official hospital estimates.
            </p>
          </div>
        </div>

        <DocumentUpload
          files={supportingDocuments}
          onChange={setSupportingDocuments}
          maxFiles={6}
          label="Medical Reports, Prescriptions & Hospital Estimates"
        />
      </div>

      {/* 6. CONSENT & DECLARATION */}
      <div className="card p-6 border border-blue-200 bg-blue-50/40 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <span>📜</span>
          <span>Consent, Authorization & Transparency Confirmation</span>
        </h3>

        <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              required
              name="publicConsent"
              checked={formData.publicConsent}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
            />
            <span>
              I hereby declare that all clinical diagnosis details, estimated costs, and documents submitted are authentic.
              I authorize the District Social Welfare & Health Nodal Officers to audit these records and consent to publishing
              an approved public campaign to accept donations.
            </span>
          </label>
        </div>
      </div>

      {/* SUBMISSION BUTTON */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary text-sm px-8 py-3 shadow-md flex items-center gap-2">
          {isSubmitting ? (
            <>
              <span className="spinner w-4 h-4 border-2" />
              <span>Submitting Application…</span>
            </>
          ) : (
            <>
              <span>Submit for Nodal Verification</span>
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MedicalProfileForm;
