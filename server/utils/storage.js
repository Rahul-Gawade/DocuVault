const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('./cloudinary');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const hasCloudinary = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Upload buffer (file)
exports.saveFile = async (buffer, originalName, mimeType) => {
  if (hasCloudinary()) {
    try {
      const res = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'docuvault', resource_type: 'auto' },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(buffer);
      });
      return {
        url: res.secure_url,
        publicId: res.public_id,
      };
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local disk storage:', err.message);
    }
  }

  // Local storage fallback
  const ext = path.extname(originalName) || (mimeType === 'application/pdf' ? '.pdf' : '.png');
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  const filePath = path.join(uploadsDir, filename);

  await fs.promises.writeFile(filePath, buffer);

  return {
    url: `/uploads/${filename}`,
    publicId: filename,
  };
};

// Save base64 signature image
exports.saveSignature = async (base64Data) => {
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');

  if (hasCloudinary()) {
    try {
      const res = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'docuvault/signatures', resource_type: 'image' },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(buffer);
      });
      return res.secure_url;
    } catch (err) {
      console.warn('Cloudinary signature upload failed, falling back to local disk storage:', err.message);
    }
  }

  const filename = `sig-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.png`;
  const filePath = path.join(uploadsDir, filename);
  await fs.promises.writeFile(filePath, buffer);
  return `/uploads/${filename}`;
};
