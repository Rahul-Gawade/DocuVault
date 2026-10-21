const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema(
  {
    documentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    accessToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tokenHash: {
      type: String,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days expiration
    },
    status: {
      type: String,
      enum: ['invited', 'viewed', 'signed'],
      default: 'invited',
    },
    signatureImageUrl: {
      type: String,
    },
    signatureChecksum: {
      type: String,
    },
    signedAt: {
      type: Date,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Recipient', recipientSchema);
