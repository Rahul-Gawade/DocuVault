module.exports = (err, req, res, next) => {
  console.error(err);
  if (err.name === 'MulterError' || err.message?.startsWith('Only PDF'))
    return res.status(400).json({ message: err.message });
  if (err.name === 'CastError')
    return res.status(400).json({ message: 'Invalid ID' });
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
};
