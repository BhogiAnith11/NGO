const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    // Donor reference (if registered user)
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    // Direct target designation
    targetType: {
      type: String,
      enum: ['medical_campaign', 'ngo', 'general'],
      default: 'medical_campaign',
      index: true,
    },
    targetNGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      index: true,
    },
    targetCampaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalAssistance',
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Donation amount is required'],
      min: [1, 'Donation amount must be at least ₹1'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    paymentProvider: {
      type: String,
      default: 'razorpay',
    },
    providerOrderId: {
      type: String,
      index: true,
      sparse: true,
    },
    providerPaymentId: {
      type: String,
      index: true,
      sparse: true,
    },
    providerSignatureStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed', 'not_applicable'],
      default: 'pending',
    },
    transactionStatus: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    donorMessage: {
      type: String,
      trim: true,
    },
    receiptReference: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
      trim: true,
    },
    refundedAt: {
      type: Date,
    },

    // ─── Compatibility fields for existing NGO in-kind & offline donations ───
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
      trim: true,
    },
    donationType: {
      type: String,
      enum: ['money', 'food', 'clothing', 'education', 'medical', 'other'],
      default: 'money',
    },
    targetNgoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      index: true,
    },
    targetNgoName: {
      type: String,
      trim: true,
    },
    itemDescription: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['received', 'in_transit', 'delivered', 'acknowledged', 'pending', 'successful'],
      default: 'received',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
donationSchema.index({ targetCampaign: 1, transactionStatus: 1 });
donationSchema.index({ donor: 1, transactionStatus: 1 });
donationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Donation', donationSchema);
