const mongoose = require('mongoose');

const medicalUpdateSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalAssistance',
      required: [true, 'Campaign reference is required'],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author user reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Update title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Update description is required'],
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

medicalUpdateSchema.index({ campaign: 1, createdAt: -1 });

module.exports = mongoose.model('MedicalUpdate', medicalUpdateSchema);
