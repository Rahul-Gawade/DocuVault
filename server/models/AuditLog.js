const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  documentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  recipientRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipient',
  },
  action: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
