const mongoose = require('mongoose');

const supportingDocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    documentType: {
      type: String,
      enum: ['medical_report', 'hospital_estimate', 'prescription', 'identity_proof', 'other'],
      default: 'medical_report',
    },
    fileName: String,
    filePath: String,
    originalName: String,
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reporterName: String,
    reporterEmail: String,
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'reviewed', 'dismissed'],
      default: 'open',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const medicalAssistanceSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Application creator user reference is required'],
      index: true,
    },
    representative: {
      name: { type: String, trim: true },
      relationship: {
        type: String,
        trim: true,
        default: 'Self',
      }, // e.g., Self, Parent, Spouse, Child, Sibling, Legal Guardian, Authorized Volunteer
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
      emergencyContact: { type: String, trim: true },
    },
    patientDisplayName: {
      type: String,
      required: [true, 'Patient display name is required'],
      trim: true,
    },
    // Sensitive/private fields strictly kept separate from public API responses
    privatePatientDetails: {
      fullName: { type: String, trim: true },
      age: { type: Number },
      contactPhone: { type: String, trim: true },
      contactEmail: { type: String, trim: true },
      address: { type: String, trim: true },
      district: { type: String, trim: true },
      village: { type: String, trim: true },
      emergencyContact: { type: String, trim: true },
      photoUrl: { type: String },
      amountAlreadyReceived: { type: Number, default: 0 },
    },
    conditionCategory: {
      type: String,
      required: [true, 'Condition category is required'],
      enum: [
        'Critical Care',
        'Cancer Treatment',
        'Surgery',
        'Accident & Trauma',
        'Pediatric Care',
        'Organ Transplant',
        'Chronic Illness',
        'Emergency Medical',
        'Other',
      ],
      index: true,
    },
    medicalSummary: {
      type: String,
      required: [true, 'Medical summary and situation description are required'],
      trim: true,
    },
    treatmentDetails: {
      type: String,
      trim: true,
    },
    hospitalDetails: {
      hospitalName: { type: String, trim: true },
      hospitalLocation: { type: String, trim: true },
      doctorName: { type: String, trim: true },
      estimatedCost: { type: Number },
      admissionDate: { type: Date },
      showHospitalPublicly: { type: Boolean, default: true },
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      index: true,
    },
    serviceLocation: {
      type: String,
      trim: true,
    },
    fundingTarget: {
      type: Number,
      required: [true, 'Funding target amount is required'],
      min: [100, 'Minimum funding target is ₹100'],
    },
    fundingCurrency: {
      type: String,
      default: 'INR',
    },
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'critical', 'life_threatening'],
      default: 'urgent',
      index: true,
    },
    treatmentDeadline: {
      type: Date,
      index: true,
    },
    patientPhoto: {
      type: String,
    },
    // Supporting medical files stored securely
    supportingDocuments: [supportingDocumentSchema],
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    campaignStatus: {
      type: String,
      enum: ['Active', 'Paused', 'Goal Reached', 'Completed', 'Closed'],
      default: 'Active',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    documentsRequested: {
      type: String,
      trim: true,
    },
    pauseReason: {
      type: String,
      trim: true,
    },
    publicConsent: {
      type: Boolean,
      required: [true, 'Public consent confirmation is required'],
      default: true,
    },
    reports: [reportSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for fast filtering
medicalAssistanceSchema.index({ verificationStatus: 1, campaignStatus: 1 });
medicalAssistanceSchema.index({ district: 1, urgency: 1 });

module.exports = mongoose.model('MedicalAssistance', medicalAssistanceSchema);
