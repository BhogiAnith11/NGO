const mongoose = require('mongoose');

const paymentWebhookEventSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      default: 'razorpay',
      required: true,
      index: true,
    },
    eventId: {
      type: String,
      required: [true, 'Event ID is required'],
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      index: true,
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed', 'ignored'],
      default: 'pending',
      index: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
    },
    error: {
      type: String,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PaymentWebhookEvent', paymentWebhookEventSchema);
