const router = require('express').Router();
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  register,
  login,
  me,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

// Authentication routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', auth, me);

// Email Verification routes
router.post('/verify-email', verifyEmail);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);

// Password Reset routes
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

module.exports = router;