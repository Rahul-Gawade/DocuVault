const multer = require('multer');

const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

// Basic magic byte check for uploaded buffer
const verifyFileMagicBytes = (buffer) => {
  if (!buffer || buffer.length < 4) return false;

  // PDF: %PDF (0x25, 0x50, 0x44, 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return 'application/pdf';
  }

  // PNG: 0x89, 0x50, 0x4E, 0x47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png';
  }

  // JPEG: 0xFF, 0xD8, 0xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  return false;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB strict limit
    files: 1, // Only 1 file per upload
  },
  fileFilter: (req, file, cb) => {
    // Sanitize original file name to prevent path traversal or null byte injection
    file.originalname = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only valid PDF, PNG, or JPG files are permitted.'));
    }
  },
});

module.exports = {
  upload,
  verifyFileMagicBytes,
};