import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from '../routes/authRoutes.js';
import userService from '../services/userService.js';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Helper function to simulate HTTP requests without opening a network socket
async function request(method, path, body = null, headers = {}) {
  return new Promise((resolve) => {
    const normalizedHeaders = { 'content-type': 'application/json' };
    for (const [k, v] of Object.entries(headers)) {
      normalizedHeaders[k.toLowerCase()] = v;
    }

    const req = {
      method,
      url: path,
      originalUrl: path,
      headers: normalizedHeaders,
      body: body || {},
    };

    let statusCode = 200;
    const resHeaders = {};

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      setHeader(k, v) {
        resHeaders[k] = v;
      },
      json(data) {
        resolve({ status: statusCode, body: data, headers: resHeaders });
      },
      send(data) {
        resolve({ status: statusCode, body: data, headers: resHeaders });
      },
    };

    app.handle(req, res);
  });
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 ANKSETU AUTHENTICATION TEST SUITE - 10 RIGOROUS TESTS');
  console.log('================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${details}`);
      failedCount++;
    }
  }

  // TEST 1: Login with valid existing credentials
  {
    const res = await request('POST', '/api/auth/login', {
      email: 'teacher@anksetu.edu',
      password: 'password123',
    });
    assert(
      res.status === 200 && res.body.success === true && res.body.token && res.body.user.role === 'teacher',
      'Test 1: Login with valid existing credentials',
      JSON.stringify(res.body)
    );
  }

  // TEST 2: Login with incorrect password
  {
    const res = await request('POST', '/api/auth/login', {
      email: 'teacher@anksetu.edu',
      password: 'wrongpassword999',
    });
    assert(
      res.status === 401 &&
        res.body.success === false &&
        res.body.message === 'Invalid email or password.',
      'Test 2: Login with incorrect password',
      `Status: ${res.status}, Message: "${res.body.message}"`
    );
  }

  // TEST 3: Login with an unregistered email
  {
    const res = await request('POST', '/api/auth/login', {
      email: 'nonexistent_user_999@anksetu.edu',
      password: 'password123',
    });
    assert(
      res.status === 404 &&
        res.body.success === false &&
        res.body.message === 'Account not found. Please register or contact your administrator.',
      'Test 3: Login with an unregistered email',
      `Status: ${res.status}, Message: "${res.body.message}"`
    );
  }

  // TEST 4: Register a new teacher account
  const newTeacherEmail = `teacher_test_${Date.now()}@anksetu.edu`;
  let newTeacherToken = null;
  {
    const res = await request('POST', '/api/auth/register', {
      name: 'Sunita Mehra',
      email: newTeacherEmail,
      password: 'secureTeacherPass123',
      confirmPassword: 'secureTeacherPass123',
      role: 'teacher',
      organization: 'Modern Vidya Mandir',
      phone: '+91 98765 43210',
    });
    newTeacherToken = res.body?.token;
    assert(
      res.status === 201 &&
        res.body.success === true &&
        res.body.user.email === newTeacherEmail &&
        res.body.user.role === 'teacher' &&
        res.body.token,
      'Test 4: Register a new teacher account',
      JSON.stringify(res.body)
    );
  }

  // TEST 5: Attempt duplicate registration
  {
    const res = await request('POST', '/api/auth/register', {
      name: 'Sunita Mehra Duplicate',
      email: newTeacherEmail,
      password: 'anotherPassword123',
      role: 'teacher',
      organization: 'Modern Vidya Mandir',
      phone: '+91 98765 43210',
    });
    assert(
      res.status === 400 &&
        res.body.success === false &&
        res.body.message.includes('already exists'),
      'Test 5: Attempt duplicate registration',
      `Status: ${res.status}, Message: "${res.body.message}"`
    );
  }

  // TEST 6: Attempt unauthorized administrator registration
  {
    // 6a: Attempt without secret key
    const resWithoutKey = await request('POST', '/api/auth/register', {
      name: 'Malicious Admin',
      email: `fakeadmin_${Date.now()}@school.edu`,
      password: 'adminPassword123',
      role: 'admin',
      organization: 'Unauthorized Academy',
      phone: '+91 90000 00000',
    });
    assert(
      resWithoutKey.status === 403 &&
        resWithoutKey.body.success === false &&
        resWithoutKey.body.message.includes('Unauthorized'),
      'Test 6a: Reject unauthorized administrator registration without secret key',
      `Status: ${resWithoutKey.status}, Message: "${resWithoutKey.body.message}"`
    );

    // 6b: Attempt with invalid secret key
    const resWithWrongKey = await request('POST', '/api/auth/register', {
      name: 'Malicious Admin 2',
      email: `fakeadmin2_${Date.now()}@school.edu`,
      password: 'adminPassword123',
      role: 'admin',
      adminSecretKey: 'wrong_key_123',
      organization: 'Unauthorized Academy',
      phone: '+91 90000 00000',
    });
    assert(
      resWithWrongKey.status === 403 &&
        resWithWrongKey.body.success === false &&
        resWithWrongKey.body.message.includes('Unauthorized'),
      'Test 6b: Reject unauthorized administrator registration with invalid secret key',
      `Status: ${resWithWrongKey.status}, Message: "${resWithWrongKey.body.message}"`
    );

    // 6c: Authorize administrator registration with valid secret key
    const validAdminEmail = `valid_admin_${Date.now()}@school.edu`;
    const resWithValidKey = await request('POST', '/api/auth/register', {
      name: 'Authorized Admin',
      email: validAdminEmail,
      password: 'adminPassword123',
      role: 'admin',
      adminSecretKey: process.env.ADMIN_REGISTRATION_KEY || 'anksetu_admin_master_secret_2026',
      organization: 'Authorized Academy',
      phone: '+91 90000 00000',
    });
    assert(
      resWithValidKey.status === 201 &&
        resWithValidKey.body.success === true &&
        resWithValidKey.body.user.role === 'admin',
      'Test 6c: Allow authorized administrator registration with verified secret key',
      `Status: ${resWithValidKey.status}, Role: "${resWithValidKey.body?.user?.role}"`
    );
  }

  // TEST 7: Verify role-based dashboard redirection and user profiles
  {
    // Login as Teacher
    const teacherLogin = await request('POST', '/api/auth/login', {
      email: 'teacher@anksetu.edu',
      password: 'password123',
    });
    const isTeacher = teacherLogin.body?.user?.role === 'teacher';

    // Login as Admin
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@anksetu.edu',
      password: 'password123',
    });
    const isAdmin = adminLogin.body?.user?.role === 'admin';

    assert(
      isTeacher && isAdmin,
      'Test 7: Verify role-based identification (Teacher vs Admin profiles)',
      `Teacher Role: ${teacherLogin.body?.user?.role}, Admin Role: ${adminLogin.body?.user?.role}`
    );
  }

  // TEST 8: Verify protected routes and API access
  {
    // 8a: Without token
    const resNoToken = await request('GET', '/api/auth/me');
    const rejectedNoToken = resNoToken.status === 401;

    // 8b: With invalid token
    const resInvalidToken = await request('GET', '/api/auth/me', null, {
      Authorization: 'Bearer invalid_tampered_token_xyz',
    });
    const rejectedInvalid = resInvalidToken.status === 401;

    // 8c: With valid teacher token
    const resValidTeacher = await request('GET', '/api/auth/me', null, {
      Authorization: `Bearer ${newTeacherToken}`,
    });
    const acceptedTeacher =
      resValidTeacher.status === 200 && resValidTeacher.body.user.email === newTeacherEmail;

    assert(
      rejectedNoToken && rejectedInvalid && acceptedTeacher,
      'Test 8: Verify protected routes and API token verification',
      `No Token: ${resNoToken.status}, Invalid Token: ${resInvalidToken.status}, Valid Token: ${resValidTeacher.status}`
    );
  }

  // TEST 9: Verify password hashing in the database
  {
    const storedUser = await userService.findUserByEmail(newTeacherEmail);
    const hasStoredUser = !!storedUser;
    const isBcrypt =
      storedUser &&
      (storedUser.password.startsWith('$2a$') || storedUser.password.startsWith('$2b$')) &&
      storedUser.password.length >= 60;
    const noPlainText = storedUser && !storedUser.password.includes('secureTeacherPass123');

    assert(
      hasStoredUser && isBcrypt && noPlainText,
      'Test 9: Verify bcrypt password hashing in database (no plain-text)',
      `Stored Hash: ${storedUser?.password?.substring(0, 20)}...`
    );
  }

  // TEST 10: Verify logout, password reset, and session expiration
  {
    // 10a: Forgot password workflow
    const forgotRes = await request('POST', '/api/auth/forgot-password', {
      email: newTeacherEmail,
    });
    const resetToken = forgotRes.body?.resetToken;
    const forgotSuccess = forgotRes.status === 200 && forgotRes.body.success;

    // 10b: Reset password using token
    let resetSuccess = false;
    if (resetToken) {
      const resetRes = await request('POST', '/api/auth/reset-password', {
        token: resetToken,
        password: 'brandNewPassword456',
        confirmPassword: 'brandNewPassword456',
      });
      resetSuccess = resetRes.status === 200 && resetRes.body.success;
    }

    // 10c: Verify old password fails and new password succeeds
    const oldPassRes = await request('POST', '/api/auth/login', {
      email: newTeacherEmail,
      password: 'secureTeacherPass123',
    });
    const oldRejected = oldPassRes.status === 401;

    const newPassRes = await request('POST', '/api/auth/login', {
      email: newTeacherEmail,
      password: 'brandNewPassword456',
    });
    const newAccepted = newPassRes.status === 200 && newPassRes.body.success;

    // 10d: Expired token verification
    const expiredToken = jwt.sign(
      { id: 'usr-admin-001', role: 'admin', email: 'admin@anksetu.edu' },
      process.env.JWT_SECRET || 'anksetu_super_secret_jwt_key_2026_school_management',
      { expiresIn: '0s' }
    );
    // Allow brief moment for expiration
    await new Promise((r) => setTimeout(r, 100));
    const expiredRes = await request('GET', '/api/auth/me', null, {
      Authorization: `Bearer ${expiredToken}`,
    });
    const expiredRejected = expiredRes.status === 401;

    assert(
      forgotSuccess && resetSuccess && oldRejected && newAccepted && expiredRejected,
      'Test 10: Verify verified password reset and expired token session rejection',
      `Forgot: ${forgotSuccess}, Reset: ${resetSuccess}, Old Rejected: ${oldRejected}, New Accepted: ${newAccepted}, Expired: ${expiredRejected}`
    );
  }

  console.log('\n================================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED out of 10 TESTS`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
