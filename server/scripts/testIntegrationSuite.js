import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from '../routes/authRoutes.js';
import studentRoutes from '../routes/studentRoutes.js';
import settingsRoutes from '../routes/settingsRoutes.js';
import analyticsRoutes from '../routes/analyticsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);

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

async function run() {
  console.log('================================================================');
  console.log('🧪 ANKSETU FULL INTEGRATION & DATA ACCURACY TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}: ${details}`);
      failed++;
    }
  }

  // 1. Institute Name Global Persistence
  {
    const newInstituteName = `Greenwood International Academy (${Date.now()})`;
    const updateRes = await request('PUT', '/api/settings', { schoolName: newInstituteName });
    const getRes = await request('GET', '/api/settings');

    assert(
      updateRes.status === 200 &&
        updateRes.body.success &&
        getRes.body?.data?.schoolName === newInstituteName,
      'Integration 1: Institute name update and global retrieval synchronization',
      `Updated: ${updateRes.body?.data?.schoolName}, Got: ${getRes.body?.data?.schoolName}`
    );
  }

  // 2. Separate Teacher and Administrator login validation
  {
    // Try logging in with Teacher account under Admin portal (expectedRole: 'admin')
    const teacherInAdminPortal = await request('POST', '/api/auth/login', {
      email: 'teacher@anksetu.edu',
      password: 'password123',
      expectedRole: 'admin',
    });
    assert(
      teacherInAdminPortal.status === 403 &&
        teacherInAdminPortal.body.message.includes('Teacher'),
      'Integration 2a: Teacher account rejected when attempting Administrator portal sign in',
      `Status: ${teacherInAdminPortal.status}, Message: "${teacherInAdminPortal.body?.message}"`
    );

    // Try logging in with Admin account under Teacher portal (expectedRole: 'teacher')
    const adminInTeacherPortal = await request('POST', '/api/auth/login', {
      email: 'admin@anksetu.edu',
      password: 'password123',
      expectedRole: 'teacher',
    });
    assert(
      adminInTeacherPortal.status === 403 &&
        adminInTeacherPortal.body.message.includes('Administrator'),
      'Integration 2b: Admin account rejected when attempting Teacher portal sign in',
      `Status: ${adminInTeacherPortal.status}, Message: "${adminInTeacherPortal.body?.message}"`
    );

    // Valid Teacher in Teacher Portal
    const validTeacher = await request('POST', '/api/auth/login', {
      email: 'teacher@anksetu.edu',
      password: 'password123',
      expectedRole: 'teacher',
    });
    assert(
      validTeacher.status === 200 && validTeacher.body.user.role === 'teacher',
      'Integration 2c: Teacher sign in succeeds in Teacher portal',
      `Status: ${validTeacher.status}`
    );

    // Valid Admin in Admin Portal
    const validAdmin = await request('POST', '/api/auth/login', {
      email: 'admin@anksetu.edu',
      password: 'password123',
      expectedRole: 'admin',
    });
    assert(
      validAdmin.status === 200 && validAdmin.body.user.role === 'admin',
      'Integration 2d: Administrator sign in succeeds in Administrator portal',
      `Status: ${validAdmin.status}`
    );
  }

  // 3. Dashboard and Students Data Accuracy and Synchronization
  {
    // Fetch students list
    const studentsRes = await request('GET', '/api/students');
    const studentCount = studentsRes.body?.data?.length || 0;

    // Fetch dashboard analytics
    const dashboardRes = await request('GET', '/api/analytics/dashboard');
    const dashboardCount = dashboardRes.body?.kpis?.totalStudents;

    assert(
      studentCount === dashboardCount,
      'Integration 3a: Dashboard Total Students exactly matches Students section list',
      `Students Section: ${studentCount}, Dashboard: ${dashboardCount}`
    );

    // Add a new student
    const testRoll = `ROLL-${Date.now().toString().slice(-4)}`;
    const testAdm = `ADM-${Date.now().toString().slice(-4)}`;
    const createStudentRes = await request('POST', '/api/students', {
      name: 'Integration Test Student',
      rollNumber: testRoll,
      admissionNumber: testAdm,
      class: 'Class 10',
      section: 'A',
      fatherName: 'Test Father',
      phone: '+91 98765 00000',
    });
    assert(
      createStudentRes.status === 201 && createStudentRes.body.success,
      'Integration 3b: Create new student record',
      JSON.stringify(createStudentRes.body)
    );

    // Re-verify synchronization after adding student
    const studentsResAfterAdd = await request('GET', '/api/students');
    const dashboardResAfterAdd = await request('GET', '/api/analytics/dashboard');
    const newStudentCount = studentsResAfterAdd.body?.data?.length || 0;
    const newDashboardCount = dashboardResAfterAdd.body?.kpis?.totalStudents;

    assert(
      newStudentCount === studentCount + 1 && newStudentCount === newDashboardCount,
      'Integration 3c: Dashboard Total Students automatically incremented and synchronized',
      `Expected: ${studentCount + 1}, Students List: ${newStudentCount}, Dashboard: ${newDashboardCount}`
    );

    // Delete the test student to test decrement synchronization
    const createdId = createStudentRes.body?.data?._id || createStudentRes.body?.data?.studentId;
    const deleteRes = await request('DELETE', `/api/students/${createdId}`);
    assert(
      deleteRes.status === 200 && deleteRes.body.success,
      'Integration 3d: Delete test student record',
      JSON.stringify(deleteRes.body)
    );

    const studentsResAfterDel = await request('GET', '/api/students');
    const dashboardResAfterDel = await request('GET', '/api/analytics/dashboard');
    assert(
      studentsResAfterDel.body?.data?.length === studentCount &&
        dashboardResAfterDel.body?.kpis?.totalStudents === studentCount,
      'Integration 3e: Dashboard Total Students automatically decremented and synchronized upon deletion',
      `Expected: ${studentCount}, Students List: ${studentsResAfterDel.body?.data?.length}, Dashboard: ${dashboardResAfterDel.body?.kpis?.totalStudents}`
    );
  }

  console.log('\n================================================================');
  console.log(`📊 INTEGRATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

run().catch((err) => {
  console.error('Fatal Integration Runner Error:', err);
  process.exit(1);
});
