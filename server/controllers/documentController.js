const Document = require('../models/Document');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const title = req.body.title || req.file.originalname;
    const result = await uploadToCloudinary(req.file.buffer);

    const doc = await Document.create({
      ownerRef: req.userId,
      title,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });
    res.status(201).json(doc);
  } catch (e) { next(e); }
};

exports.listDocuments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { ownerRef: req.userId };
    if (status) filter.status = status;

    const docs = await Document.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Document.countDocuments(filter);
    res.json({ docs, total, page: Number(page) });
  } catch (e) { next(e); }
};

exports.getDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, ownerRef: req.userId });
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (e) { next(e); }
};
