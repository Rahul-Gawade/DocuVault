const multer = require('multer');
const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) =>
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only PDF, PNG or JPG files are allowed')),
});