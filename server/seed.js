require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const connectDB = require('./db/db');
const User = require('./models/User');
const Document = require('./models/Document');
const Recipient = require('./models/Recipient');
const AuditLog = require('./models/AuditLog');

async function seed() {
  await connectDB();
  console.log('Connected to DB for seeding...');

  // 1. Create or update Demo User
  const email = 'demo.owner@docuvault.io';
  let user = await User.findOne({ email });
  const passwordHash = await bcrypt.hash('docuvault2026', 10);

  if (!user) {
    user = await User.create({
      name: 'Sarah Connor',
      email,
      passwordHash,
      isEmailVerified: true,
    });
    console.log('Created demo user:', user.email);
  } else {
    user.passwordHash = passwordHash;
    user.isEmailVerified = true;
    await user.save();
    console.log('Updated demo user password and verified status:', user.email);
  }

  // Ensure sample upload files exist in uploads/
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const samplePdf1 = path.join(uploadsDir, 'sample-nda.pdf');
  if (!fs.existsSync(samplePdf1)) {
    fs.writeFileSync(samplePdf1, '%PDF-1.4\n1 0 obj\n<< /Title (DocuVault Mutual NDA Agreement) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
  }

  const samplePdf2 = path.join(uploadsDir, 'sample-consulting-agreement.pdf');
  if (!fs.existsSync(samplePdf2)) {
    fs.writeFileSync(samplePdf2, '%PDF-1.4\n1 0 obj\n<< /Title (DocuVault Consulting Agreement) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
  }

  // Check if documents already exist
  const existingDocs = await Document.countDocuments({ ownerRef: user._id });
  if (existingDocs === 0) {
    console.log('Creating sample documents and audit trails...');

    // Doc 1: Mutual NDA (Pending / Viewed)
    const token1 = crypto.randomBytes(32).toString('hex');
    const doc1 = await Document.create({
      ownerRef: user._id,
      title: 'Mutual Non-Disclosure Agreement 2026',
      fileUrl: '/uploads/sample-nda.pdf',
      publicId: 'sample-nda',
      fileType: 'application/pdf',
      fileSize: 482000,
      status: 'pending',
    });

    const recipient1 = await Recipient.create({
      documentRef: doc1._id,
      name: 'Michael Scott',
      email: 'michael.scott@dundermifflin.com',
      accessToken: token1,
      status: 'viewed',
    });

    await AuditLog.create([
      {
        documentRef: doc1._id,
        action: 'created',
        details: 'Document "Mutual Non-Disclosure Agreement 2026" uploaded by owner',
        timestamp: new Date(Date.now() - 3600000 * 24),
      },
      {
        documentRef: doc1._id,
        recipientRef: recipient1._id,
        action: 'invited',
        details: `Signer invited: ${recipient1.name} (${recipient1.email})`,
        timestamp: new Date(Date.now() - 3600000 * 20),
      },
      {
        documentRef: doc1._id,
        recipientRef: recipient1._id,
        action: 'viewed',
        details: `Document opened and reviewed by ${recipient1.name} (${recipient1.email})`,
        timestamp: new Date(Date.now() - 3600000 * 2),
      },
    ]);

    // Doc 2: Consulting Agreement (Completed)
    const token2 = crypto.randomBytes(32).toString('hex');
    const doc2 = await Document.create({
      ownerRef: user._id,
      title: 'Senior Engineering Consulting Agreement',
      fileUrl: '/uploads/sample-consulting-agreement.pdf',
      publicId: 'sample-consulting-agreement',
      fileType: 'application/pdf',
      fileSize: 624000,
      status: 'completed',
    });

    // Create a dummy signature image
    const dummySignatureUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK8AAAAyCAYAAADgQ0YVAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAA...';

    const recipient2 = await Recipient.create({
      documentRef: doc2._id,
      name: 'Alex Johnson',
      email: 'alex.johnson@techcorp.io',
      accessToken: token2,
      status: 'signed',
      signatureImageUrl: dummySignatureUrl,
      signedAt: new Date(Date.now() - 3600000 * 5),
    });

    await AuditLog.create([
      {
        documentRef: doc2._id,
        action: 'created',
        details: 'Document "Senior Engineering Consulting Agreement" uploaded by owner',
        timestamp: new Date(Date.now() - 3600000 * 48),
      },
      {
        documentRef: doc2._id,
        recipientRef: recipient2._id,
        action: 'invited',
        details: `Signer invited: ${recipient2.name} (${recipient2.email})`,
        timestamp: new Date(Date.now() - 3600000 * 40),
      },
      {
        documentRef: doc2._id,
        recipientRef: recipient2._id,
        action: 'viewed',
        details: `Document opened by ${recipient2.name} (${recipient2.email})`,
        timestamp: new Date(Date.now() - 3600000 * 12),
      },
      {
        documentRef: doc2._id,
        recipientRef: recipient2._id,
        action: 'signed',
        details: `Digitally signed by ${recipient2.name} (${recipient2.email})`,
        timestamp: new Date(Date.now() - 3600000 * 5),
      },
    ]);

    console.log('Seed completed successfully!');
    console.log('Demo Account: demo.owner@docuvault.io / docuvault2026');
    console.log('Sample signing link:', `http://localhost:5173/sign/${token1}`);
  } else {
    console.log('Sample documents already present.');
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
