const rateLimit = require('express-rate-limit');

// Protect authentication endpoints from brute-force & credential stuffing
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login/register attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
});

// Protect signing and token access endpoints from enumeration attacks
exports.signLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 signature attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests to this signing link. Please wait a few minutes before trying again.',
  },
});

// General API rate limiter
exports.generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP, please try again later.',
  },
});
