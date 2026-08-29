const mongoose = require('mongoose');

const connectRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toNgoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NGO',
      required: true,
    },
    senderName: { type: String },
    senderEmail: { type: String },
    senderRole: { type: String },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['sent', 'read', 'responded'],
      default: 'sent',
    },
    response: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ConnectRequest', connectRequestSchema);
