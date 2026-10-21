module.exports = (err, req, res, next) => {
  // Log error for server monitoring
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.url}:`, err.message || err);
  }

  // Multer & File upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10 MB.' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  if (err.message && err.message.includes('Only valid PDF')) {
    return res.status(400).json({ message: err.message });
  }

  // Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid resource ID format.' });
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Invalid or expired authorization token.' });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error occurred.'
    : err.message || 'Server error';

  res.status(statusCode).json({ message });
};
