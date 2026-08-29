const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    donationType: {
      type: String,
      required: [true, 'Donation type is required'],
      enum: ['food', 'clothing', 'money', 'education', 'medical', 'other'],
    },
    amount: {
      type: Number,
      validate: {
        validator: function (value) {
          if (this.donationType === 'money') {
            return value > 0;
          }
          return true;
        },
        message: 'Amount must be a positive number when donationType is money',
      },
    },
    targetNgoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      default: null,
    },
    targetNgoName: {
      type: String,
      default: 'District General Welfare Fund',
    },
    itemDescription: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['received', 'in_transit', 'delivered', 'acknowledged'],
      default: 'received',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', donationSchema);
