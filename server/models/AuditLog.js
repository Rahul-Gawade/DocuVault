const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  documentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true,
  },
  recipientRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipient',
  },
  action: {
    type: String,
    required: true,
    enum: ['created', 'invited', 'viewed', 'signed', 'removed'],
  },
  details: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  checksum: {
    type: String, // Cryptographic hash for non-repudiation
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
