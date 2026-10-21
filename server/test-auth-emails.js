const BASE = 'http://localhost:5000/api';

async function testAuth() {
  console.log('--- TESTING EMAIL VERIFICATION & FORGOT PASSWORD FLOWS ---');

  const testEmail = `auth_test_${Date.now()}@example.com`;
  const initialPassword = 'initialPassword123';
  const newPassword = 'newSecretPassword456';

  // 1. Register
  console.log('\n1. Registering user with verification email...');
  const regRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Security Tester', email: testEmail, password: initialPassword }),
  });
  const regData = await regRes.json();
  console.log('Register status:', regRes.status, regData.message);
  if (!regData.devVerifyUrl) throw new Error('Expected devVerifyUrl for testing');
  console.log('Dev Verify URL:', regData.devVerifyUrl);

  // Extract verification token from URL
  const verifyToken = new URL(regData.devVerifyUrl).searchParams.get('token');

  // 2. Verify Email
  console.log('\n2. Verifying email using token...');
  const verifyRes = await fetch(`${BASE}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: verifyToken }),
  });
  const verifyData = await verifyRes.json();
  console.log('Verify status:', verifyRes.status, verifyData.message);
  if (!verifyData.user?.isEmailVerified) throw new Error('User email should be verified');

  // 3. Forgot Password
  console.log('\n3. Requesting forgot-password reset link...');
  const forgotRes = await fetch(`${BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  });
  const forgotData = await forgotRes.json();
  console.log('Forgot status:', forgotRes.status, forgotData.message);
  if (!forgotData.devResetUrl) throw new Error('Expected devResetUrl for testing');
  console.log('Dev Reset URL:', forgotData.devResetUrl);

  const resetToken = new URL(forgotData.devResetUrl).searchParams.get('token');

  // 4. Reset Password
  console.log('\n4. Resetting password using reset token...');
  const resetRes = await fetch(`${BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: resetToken, newPassword }),
  });
  const resetData = await resetRes.json();
  console.log('Reset status:', resetRes.status, resetData.message);

  // 5. Test Login with New Password
  console.log('\n5. Logging in with new password...');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: newPassword }),
  });
  const loginData = await loginRes.json();
  console.log('Login status:', loginRes.status, 'Token issued:', Boolean(loginData.token));
  if (!loginData.token) throw new Error('Login with new password failed');

  console.log('\n--- ALL AUTHENTICATION & EMAIL FLOWS PASSED PERFECTLY! ---');
}

testAuth().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
