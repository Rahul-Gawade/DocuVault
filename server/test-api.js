require('dotenv').config();
const http = require('http');
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./db/db');
const errorHandler = require('./middleware/errorHandler');

const User = require('./models/User');
const Document = require('./models/Document');
const Recipient = require('./models/Recipient');
const AuditLog = require('./models/AuditLog');

async function runTests() {
  await connectDB();
  console.log('--- STARTING DOCUVAULT BACKEND TESTS ---');

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '15mb' }));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/documents', require('./routes/documents'));
  app.use('/api/access', require('./routes/access'));
  app.use(errorHandler);

  const server = app.listen(5099);

  try {
    const baseUrl = 'http://localhost:5099/api';

    const post = async (endpoint, body, token) => {
      const res = await fetch(baseUrl + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return { status: res.status, data };
    };

    const get = async (endpoint, token) => {
      const res = await fetch(baseUrl + endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      return { status: res.status, data };
    };

    const testEmail = `testuser_${Date.now()}@example.com`;
    console.log('1. Registering user...');
    const regRes = await post('/auth/register', {
      name: 'Alice Owner',
      email: testEmail,
      password: 'password123',
    });
    console.log('Register response:', regRes.status, regRes.data.user);
    if (!regRes.data.token) throw new Error('Registration failed');
    const token = regRes.data.token;

    console.log('2. Verifying /auth/me...');
    const meRes = await get('/auth/me', token);
    console.log('Me response:', meRes.status, meRes.data.user.name);

    console.log('3. Uploading document with Multer...');
    const formData = new FormData();
    const dummyBlob = new Blob(['%PDF-1.4 simulated pdf document content'], { type: 'application/pdf' });
    formData.append('file', dummyBlob, 'NDA_Agreement.pdf');
    formData.append('title', 'Mutual NDA Agreement 2026');

    const uploadRes = await fetch(baseUrl + '/documents', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const uploadData = await uploadRes.json();
    console.log('Upload response:', uploadRes.status, uploadData.title, uploadData.fileUrl);
    const docId = uploadData._id;

    console.log('4. Listing owner documents...');
    const listRes = await get('/documents', token);
    console.log('List count:', listRes.data.total, 'Stats:', listRes.data.stats);

    console.log('5. Inviting recipient to sign...');
    const inviteRes = await post(`/documents/${docId}/recipients`, {
      name: 'Bob Signer',
      email: 'bob@example.com',
    }, token);
    console.log('Invite response:', inviteRes.status, 'Token:', inviteRes.data.accessToken?.substring(0, 10) + '...');
    const accessToken = inviteRes.data.accessToken;

    console.log('6. Public access endpoint (recipient opens link)...');
    const accessRes = await get(`/access/${accessToken}`);
    console.log('Access response:', accessRes.status, 'Recipient status:', accessRes.data.recipient.status);
    if (accessRes.data.recipient.status !== 'viewed') {
      throw new Error('Recipient status should be "viewed"');
    }

    console.log('7. Recipient submits canvas signature...');
    // Simulated base64 png
    const dummyBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const signRes = await post(`/access/${accessToken}/sign`, {
      signatureData: dummyBase64,
    });
    console.log('Sign response:', signRes.status, 'Doc Status:', signRes.data.documentStatus);
    if (signRes.data.documentStatus !== 'completed') {
      throw new Error('Document status should be "completed"');
    }

    console.log('8. Checking Audit Log as owner...');
    const auditRes = await get(`/documents/${docId}/audit`, token);
    console.log('Audit trail events count:', auditRes.data.length);
    auditRes.data.forEach((log) => console.log(`   - [${log.action}] ${log.details}`));

    console.log('\n--- ALL BACKEND TESTS PASSED SUCCESSFULLY! ---');
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
