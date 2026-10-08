const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema(
  {
    documentRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'signed'],
      default: 'pending',
    },
    signatureImageUrl: {
      type: String,
    },
    signedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Recipient', recipientSchema);
