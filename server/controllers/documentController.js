const crypto = require('crypto');
const Document = require('../models/Document');
const User = require('../models/User');
const Recipient = require('../models/Recipient');
const AuditLog = require('../models/AuditLog');
const storage = require('../utils/storage');
const emailService = require('../utils/emailService');
const { verifyFileMagicBytes } = require('../middleware/upload');

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File is required' });

    // 1. Verify actual binary magic bytes to prevent MIME-type spoofing
    const detectedType = verifyFileMagicBytes(req.file.buffer);
    if (!detectedType) {
      return res.status(400).json({
        message: 'Invalid file content: The uploaded file does not match genuine PDF, PNG, or JPG formats.',
      });
    }

    // 2. Compute cryptographic SHA-256 checksum of document for non-repudiation
    const fileChecksum = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

    const title = req.body.title?.trim() || req.file.originalname;
    const fileResult = await storage.saveFile(req.file.buffer, req.file.originalname, detectedType);

    const doc = await Document.create({
      ownerRef: req.userId,
      title,
      fileUrl: fileResult.url,
      publicId: fileResult.publicId,
      fileType: detectedType,
      fileSize: req.file.size,
      fileChecksum,
      status: 'pending',
    });

    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await AuditLog.create({
      documentRef: doc._id,
      action: 'created',
      details: `Document "${title}" uploaded (SHA-256: ${fileChecksum.substring(0, 16)}...)`,
      checksum: fileChecksum,
      ipAddress: clientIp,
      userAgent,
    });

    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
};

exports.listDocuments = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const filter = { ownerRef: req.userId };
    if (status && status !== 'all') filter.status = status;

    if (search && typeof search === 'string') {
      // Escape special regex characters to prevent ReDoS / unintended regex injection
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: safeSearch, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [docs, total, statsAggregation] = await Promise.all([
      Document.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Document.countDocuments(filter),
      Document.aggregate([
        { $match: { ownerRef: req.userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    // Attach recipient summary for each document
    const docIds = docs.map((d) => d._id);
    const recipients = await Recipient.find({ documentRef: { $in: docIds } }).lean();

    const recipientMap = {};
    recipients.forEach((r) => {
      if (!recipientMap[r.documentRef]) {
        recipientMap[r.documentRef] = [];
      }
      recipientMap[r.documentRef].push(r);
    });

    const enrichedDocs = docs.map((d) => ({
      ...d,
      recipients: recipientMap[d._id] || [],
      recipientCount: (recipientMap[d._id] || []).length,
      signedCount: (recipientMap[d._id] || []).filter((r) => r.status === 'signed').length,
    }));

    const stats = {
      total: 0,
      pending: 0,
      partially_signed: 0,
      completed: 0,
    };
    statsAggregation.forEach((s) => {
      stats.total += s.count;
      if (stats[s._id] !== undefined) stats[s._id] = s.count;
    });

    res.json({
      docs: enrichedDocs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      stats,
    });
  } catch (e) {
    next(e);
  }
};

exports.getDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, ownerRef: req.userId }).lean();
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const [recipients, auditLogs] = await Promise.all([
      Recipient.find({ documentRef: doc._id }).sort({ createdAt: 1 }).lean(),
      AuditLog.find({ documentRef: doc._id }).sort({ timestamp: -1 }).populate('recipientRef', 'name email').lean(),
    ]);

    res.json({
      document: doc,
      recipients,
      auditLogs,
    });
  } catch (e) {
    next(e);
  }
};

exports.inviteRecipient = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name || !email || typeof name !== 'string' || typeof email !== 'string') {
      return res.status(400).json({ message: 'Recipient name and email are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const doc = await Document.findOne({ _id: req.params.id, ownerRef: req.userId });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    // Generate high-entropy 256-bit unguessable access token
    const accessToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');

    const recipient = await Recipient.create({
      documentRef: doc._id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      accessToken,
      tokenHash,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day validity
      status: 'invited',
    });

    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await AuditLog.create({
      documentRef: doc._id,
      recipientRef: recipient._id,
      action: 'invited',
      details: `Signer invited: ${recipient.name} (${recipient.email})`,
      ipAddress: clientIp,
      userAgent,
    });

    // Send invitation email notification to signer
    User.findById(req.userId)
      .select('name')
      .then((owner) => {
        emailService.sendSignerInvitationEmail(
          recipient.email,
          recipient.name,
          owner?.name || 'A DocuVault user',
          doc.title,
          recipient.accessToken
        ).catch((err) => console.warn('Failed to send signer invitation email:', err.message));
      })
      .catch(() => {});

    res.status(201).json(recipient);
  } catch (e) {
    next(e);
  }
};

exports.removeRecipient = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, ownerRef: req.userId });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const recipient = await Recipient.findOne({ _id: req.params.recipientId, documentRef: doc._id });
    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

    await Recipient.deleteOne({ _id: recipient._id });

    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await AuditLog.create({
      documentRef: doc._id,
      action: 'removed',
      details: `Signer invitation removed: ${recipient.name} (${recipient.email})`,
      ipAddress: clientIp,
      userAgent,
    });

    // Recompute document status
    const remaining = await Recipient.find({ documentRef: doc._id });
    if (remaining.length === 0) {
      doc.status = 'pending';
    } else {
      const signedCount = remaining.filter((r) => r.status === 'signed').length;
      if (signedCount === remaining.length) doc.status = 'completed';
      else if (signedCount > 0) doc.status = 'partially_signed';
      else doc.status = 'pending';
    }
    await doc.save();

    res.json({ message: 'Recipient removed', documentStatus: doc.status });
  } catch (e) {
    next(e);
  }
};

exports.getDocumentAudit = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, ownerRef: req.userId });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const logs = await AuditLog.find({ documentRef: doc._id })
      .sort({ timestamp: -1 })
      .populate('recipientRef', 'name email status')
      .lean();

    res.json(logs);
  } catch (e) {
    next(e);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, ownerRef: req.userId });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    await Promise.all([
      Recipient.deleteMany({ documentRef: doc._id }),
      AuditLog.deleteMany({ documentRef: doc._id }),
    ]);

    res.json({ message: 'Document deleted successfully' });
  } catch (e) {
    next(e);
  }
};
