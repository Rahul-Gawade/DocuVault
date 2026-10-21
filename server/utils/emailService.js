const nodemailer = require('nodemailer');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5174';
const SMTP_FROM = process.env.SMTP_FROM || 'DocuVault <no-reply@docuvault.io>';

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Real SMTP transport if configured in .env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }

  // Development fallback: simulated ethereal or direct logger
  transporter = {
    sendMail: async (options) => {
      console.log('\n============================================================');
      console.log('📨 [DOCUVAULT SIMULATED EMAIL DISPATCH]');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log('------------------------------------------------------------');
      if (options.previewUrl) {
        console.log(`🔗 Action Link: ${options.previewUrl}`);
      }
      console.log('============================================================\n');
      return { messageId: 'simulated-' + Date.now(), response: 'OK' };
    },
  };

  return transporter;
};

// Base HTML template wrapper
const getHtmlLayout = ({ title, preheader, contentHtml }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      body { margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #171717; }
      .container { max-width: 580px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e5e7; overflow: hidden; }
      .header { padding: 32px 40px 24px; border-bottom: 1px solid #f0f0f3; text-align: center; }
      .logo { font-size: 20px; font-weight: 700; color: #171717; letter-spacing: -0.5px; }
      .content { padding: 36px 40px; }
      .title { font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 16px; color: #171717; }
      .text { font-size: 15px; line-height: 1.6; color: #52525b; margin-bottom: 24px; }
      .button-wrapper { text-align: center; margin: 32px 0; }
      .button { display: inline-block; background-color: #000000; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 28px; border-radius: 10px; }
      .footer { padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #f0f0f3; text-align: center; font-size: 12px; color: #a1a1aa; line-height: 1.5; }
      .link-text { word-break: break-all; color: #0d74ce; font-size: 13px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">🗄️ DocuVault</div>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <p>This is an automated notification from DocuVault Secure Document System.<br>If you did not request this email, please safely disregard it.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

// 1. Email Verification
exports.sendVerificationEmail = async (email, name, token) => {
  const mailer = await getTransporter();
  const verifyUrl = `${CLIENT_URL}/verify-email?token=${token}`;

  const contentHtml = `
    <h1 class="title">Verify your email address</h1>
    <p class="text">Hello ${name || 'there'},</p>
    <p class="text">Welcome to <strong>DocuVault</strong>. Please confirm your email address to activate your owner account and start uploading secure agreements.</p>
    <div class="button-wrapper">
      <a href="${verifyUrl}" class="button" target="_blank">Verify Email Address</a>
    </div>
    <p class="text">Or paste this link into your browser:<br><span class="link-text">${verifyUrl}</span></p>
    <p class="text" style="font-size: 13px; color: #71717a;">This link will expire in 24 hours.</p>
  `;

  await mailer.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: 'Verify your DocuVault account',
    html: getHtmlLayout({ title: 'Verify Email', contentHtml }),
    previewUrl: verifyUrl,
  });

  return { verifyUrl };
};

// 2. Password Reset
exports.sendPasswordResetEmail = async (email, name, token) => {
  const mailer = await getTransporter();
  const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;

  const contentHtml = `
    <h1 class="title">Reset your password</h1>
    <p class="text">Hello ${name || 'there'},</p>
    <p class="text">We received a request to reset the password for your DocuVault account. Click the button below to choose a new password.</p>
    <div class="button-wrapper">
      <a href="${resetUrl}" class="button" target="_blank">Reset Password</a>
    </div>
    <p class="text">Or paste this link into your browser:<br><span class="link-text">${resetUrl}</span></p>
    <p class="text" style="font-size: 13px; color: #71717a;">This link will expire in 1 hour for your security. If you did not request a password reset, no further action is needed.</p>
  `;

  await mailer.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: 'Reset your DocuVault password',
    html: getHtmlLayout({ title: 'Reset Password', contentHtml }),
    previewUrl: resetUrl,
  });

  return { resetUrl };
};

// 3. Signer Invitation
exports.sendSignerInvitationEmail = async (signerEmail, signerName, senderName, docTitle, accessToken) => {
  const mailer = await getTransporter();
  const signUrl = `${CLIENT_URL}/sign/${accessToken}`;

  const contentHtml = `
    <h1 class="title">Signature Requested</h1>
    <p class="text">Hello ${signerName},</p>
    <p class="text"><strong>${senderName}</strong> has invited you to review and electronically sign: <strong>"${docTitle}"</strong>.</p>
    <div class="button-wrapper">
      <a href="${signUrl}" class="button" target="_blank">Review & Sign Document</a>
    </div>
    <p class="text">You can access and sign this document directly without creating an account using your secure link below:<br><span class="link-text">${signUrl}</span></p>
    <p class="text" style="font-size: 13px; color: #71717a;">This document link will remain valid for 14 days under cryptographic token protection.</p>
  `;

  await mailer.sendMail({
    from: SMTP_FROM,
    to: signerEmail,
    subject: `${senderName} requested your signature on "${docTitle}"`,
    html: getHtmlLayout({ title: 'Sign Document', contentHtml }),
    previewUrl: signUrl,
  });

  return { signUrl };
};
