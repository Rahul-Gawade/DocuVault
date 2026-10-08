const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    ownerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    publicId: String,
    fileType: String,
    fileSize: Number,
    status: {
      type: String,
      enum: ['pending', 'partially_signed', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
