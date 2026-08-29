const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: [
        'Food Drive',
        'Health & Medical Camp',
        'Education & Literacy',
        'Afforestation & Environment',
        'Women Skill Workshop',
        'Disaster Relief',
        'Animal Welfare',
        'Other',
      ],
      default: 'Other',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    organizer: {
      type: String,
      default: 'District Social Welfare Dept & Verified NGOs',
    },
    organizerNgoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      default: null,
    },
    image: {
      type: String,
      default: '/asset/img1.png',
    },
    volunteersNeeded: {
      type: Number,
      default: 20,
    },
    volunteersRegistered: {
      type: Number,
      default: 0,
    },
    contactPhone: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
