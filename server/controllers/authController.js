const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../utils/emailService');

const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// 1. Register new owner with verification email
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Strict type checks to prevent NoSQL object injection
    if (
      !name ||
      !email ||
      !password ||
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({ message: 'Valid name, email, and password strings are required.' });
    }

    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({ message: 'Password must be between 6 and 128 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Generate cryptographic verification token
    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto.createHash('sha256').update(rawVerificationToken).digest('hex');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      isEmailVerified: false,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send verification email
    const emailResult = await emailService.sendVerificationEmail(cleanEmail, user.name, rawVerificationToken);

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      token: makeToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
      devVerifyUrl: emailResult?.verifyUrl,
    });
  } catch (e) {
    next(e);
  }
};

// 2. Verify Email via token
exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification link. Please request a new verification email.',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully! Your account is fully active.',
      token: makeToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: true,
      },
    });
  } catch (e) {
    next(e);
  }
};

// 3. Resend Email Verification link
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(200).json({
        message: 'If an account exists with this email, a verification link has been sent.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'This account email is already verified.' });
    }

    const rawVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto.createHash('sha256').update(rawVerificationToken).digest('hex');
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const emailResult = await emailService.sendVerificationEmail(user.email, user.name, rawVerificationToken);

    res.json({
      message: 'A fresh verification link has been sent to your email.',
      devVerifyUrl: emailResult?.verifyUrl,
    });
  } catch (e) {
    next(e);
  }
};

// 4. Forgot Password - Send Reset Link
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // Prevent user enumeration attacks - return identical message even if user doesn't exist
    if (!user) {
      return res.json({
        message: 'If an account exists with that email, a password reset link has been dispatched.',
      });
    }

    // Generate high-entropy 256-bit reset token
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity
    await user.save();

    const emailResult = await emailService.sendPasswordResetEmail(user.email, user.name, rawResetToken);

    res.json({
      message: 'If an account exists with that email, a password reset link has been dispatched.',
      devResetUrl: emailResult?.resetUrl,
    });
  } catch (e) {
    next(e);
  }
};

// 5. Reset Password using token
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword || typeof token !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ message: 'Valid token and new password are required.' });
    }

    if (newPassword.length < 6 || newPassword.length > 128) {
      return res.status(400).json({ message: 'Password must be between 6 and 128 characters.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Password reset link is invalid or has expired. Please request a new one.',
      });
    }

    // Update password & clear reset tokens
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (e) {
    next(e);
  }
};

// 6. User Login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      token: makeToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (e) {
    next(e);
  }
};

// 7. Verify current session
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (e) {
    next(e);
  }
};