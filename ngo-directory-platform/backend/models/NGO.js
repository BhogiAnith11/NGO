const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    ngoName: {
      type: String,
      required: [true, 'NGO name is required'],
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      trim: true,
    },
    focusAreas: {
      type: [String],
      required: [true, 'At least one focus area is required'],
      enum: [
        'Education',
        'Health',
        'Environment',
        'Women Empowerment',
        'Child Welfare',
        'Rural Development',
        'Livelihood',
        'Disaster Relief',
        'Animal Welfare',
        'Other',
      ],
    },
    serviceRegion: {
      type: [String],
      required: [true, 'Service region is required'],
    },
    address: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    website: { type: String, trim: true },
    socialLinks: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
    },
    description: { type: String, trim: true },
    logoUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

// Full-text search index
ngoSchema.index({ ngoName: 'text', description: 'text' });

module.exports = mongoose.model('NGO', ngoSchema);
