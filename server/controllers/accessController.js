const crypto = require('crypto');
const Recipient = require('../models/Recipient');
const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');
const storage = require('../utils/storage');

exports.getAccessDocument = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Valid access token required' });
    }

    // Token format validation (64-char hex string)
    if (!/^[a-f0-9]{64}$/i.test(token.trim())) {
      return res.status(400).json({ message: 'Malformed or invalid access token format' });
    }

    const recipient = await Recipient.findOne({ accessToken: token });
    if (!recipient) {
      return res.status(404).json({ message: 'Invalid or expired signing link' });
    }

    // Check token expiration
    if (recipient.expiresAt && new Date() > new Date(recipient.expiresAt)) {
      return res.status(403).json({
        message: 'This signing link has expired. Please contact the document owner to request a new invitation.',
      });
    }

    const document = await Document.findById(recipient.documentRef)
      .populate('ownerRef', 'name email')
      .lean();

    if (!document) {
      return res.status(404).json({ message: 'Referenced document not found' });
    }

    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // If recipient is opening for the first time, mark as 'viewed' and log audit
    if (recipient.status === 'invited') {
      recipient.status = 'viewed';
      recipient.ipAddress = clientIp;
      recipient.userAgent = userAgent;
      await recipient.save();

      await AuditLog.create({
        documentRef: document._id,
        recipientRef: recipient._id,
        action: 'viewed',
        details: `Document opened and viewed by ${recipient.name} (${recipient.email})`,
        ipAddress: clientIp,
        userAgent,
      });
    }

    // Get all other signers' status (without leaking private tokens)
    const allRecipients = await Recipient.find({ documentRef: document._id })
      .select('name email status signedAt signatureImageUrl')
      .lean();

    res.json({
      recipient: {
        id: recipient._id,
        name: recipient.name,
        email: recipient.email,
        status: recipient.status,
        signatureImageUrl: recipient.signatureImageUrl,
        signedAt: recipient.signedAt,
        expiresAt: recipient.expiresAt,
      },
      document: {
        id: document._id,
        title: document.title,
        fileUrl: document.fileUrl,
        fileType: document.fileType,
        fileSize: document.fileSize,
        fileChecksum: document.fileChecksum,
        status: document.status,
        createdAt: document.createdAt,
        owner: document.ownerRef ? { name: document.ownerRef.name, email: document.ownerRef.email } : null,
      },
      signers: allRecipients,
    });
  } catch (e) {
    next(e);
  }
};

exports.signDocument = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { signatureData } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Valid access token required' });
    }

    // 1. Validate token format
    if (!/^[a-f0-9]{64}$/i.test(token.trim())) {
      return res.status(400).json({ message: 'Malformed or invalid access token format' });
    }

    // 2. Validate signature payload structure & size
    if (!signatureData || typeof signatureData !== 'string') {
      return res.status(400).json({ message: 'Signature data is required' });
    }

    // Must be valid base64 image data URL
    const base64Regex = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(signatureData)) {
      return res.status(400).json({ message: 'Invalid signature image payload format' });
    }

    // Prevent oversized payload attacks (max 600 KB)
    if (signatureData.length > 600 * 1024) {
      return res.status(400).json({ message: 'Signature payload exceeds maximum allowable size (600 KB)' });
    }

    const recipient = await Recipient.findOne({ accessToken: token });
    if (!recipient) {
      return res.status(404).json({ message: 'Invalid or expired signing link' });
    }

    // 3. Verify link expiration
    if (recipient.expiresAt && new Date() > new Date(recipient.expiresAt)) {
      return res.status(403).json({
        message: 'This signing link has expired. Signatures cannot be submitted.',
      });
    }

    // 4. Prevent replay / double-signing
    if (recipient.status === 'signed') {
      return res.status(400).json({
        message: 'This document has already been signed by this recipient',
        signedAt: recipient.signedAt,
      });
    }

    // 5. Compute cryptographic SHA-256 hash of signature for non-repudiation
    const signatureChecksum = crypto.createHash('sha256').update(signatureData).digest('hex');

    // Save signature image (local file or Cloudinary)
    const signatureImageUrl = await storage.saveSignature(signatureData);

    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    recipient.status = 'signed';
    recipient.signatureImageUrl = signatureImageUrl;
    recipient.signatureChecksum = signatureChecksum;
    recipient.signedAt = new Date();
    recipient.ipAddress = clientIp;
    recipient.userAgent = userAgent;
    await recipient.save();

    // 6. Record immutable event in AuditLog
    await AuditLog.create({
      documentRef: recipient.documentRef,
      recipientRef: recipient._id,
      action: 'signed',
      details: `Digitally signed by ${recipient.name} (${recipient.email}) [SigHash: ${signatureChecksum.substring(0, 16)}...]`,
      checksum: signatureChecksum,
      ipAddress: clientIp,
      userAgent,
    });

    // 7. Recompute parent document status
    const allRecipients = await Recipient.find({ documentRef: recipient.documentRef });
    const signedCount = allRecipients.filter((r) => r.status === 'signed').length;
    const totalRecipients = allRecipients.length;

    let newStatus = 'pending';
    if (totalRecipients > 0 && signedCount === totalRecipients) {
      newStatus = 'completed';
    } else if (signedCount > 0) {
      newStatus = 'partially_signed';
    }

    const document = await Document.findByIdAndUpdate(
      recipient.documentRef,
      { status: newStatus },
      { returnDocument: 'after' }
    );

    res.json({
      success: true,
      message: 'Document signed successfully',
      recipient: {
        name: recipient.name,
        email: recipient.email,
        status: recipient.status,
        signedAt: recipient.signedAt,
        signatureImageUrl: recipient.signatureImageUrl,
      },
      documentStatus: document ? document.status : newStatus,
    });
  } catch (e) {
    next(e);
  }
};
