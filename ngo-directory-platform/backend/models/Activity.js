const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    date: {
      type: Date,
      required: [true, 'Activity date is required'],
    },
    images: { type: [String], default: [] },
    beneficiaryCount: { type: Number, default: 0 },
    category: {
      type: String,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
