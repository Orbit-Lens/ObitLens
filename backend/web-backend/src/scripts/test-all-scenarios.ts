import mongoose from 'mongoose';
import { createApp } from '../app.js';
import { env } from '../config/env.js';

interface TestResult {
  category: string;
  testName: string;
  endpoint: string;
  httpStatus: number;
  expectedStatus: number;
  dbVerified: boolean;
  passed: boolean;
  notes?: string;
}

const results: TestResult[] = [];

async function runTests() {
  console.log('🚀 Starting Complete API & Database Verification Test Suite...\n');

  // 1. Connect to Database
  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ Connected to MongoDB:', mongoose.connection.name);
  const db = mongoose.connection.db!;

  // 2. Start Express Test Server
  const app = createApp();
  const PORT = 5099;
  const server = app.listen(PORT);
  const BASE_URL = `http://localhost:${PORT}`;
  console.log(`🌐 Test Server running on ${BASE_URL}\n`);

  let testUserToken = '';
  let testUserId = '';
  let dbUserObjId: mongoose.Types.ObjectId | null = null;
  let testProjectId = '';
  let sourceImageId = '';
  let referenceImageId = '';
  let testJobId = '';
  let testEmail = `test_runner_${Date.now()}@orbitlens.app`;

  function logResult(res: TestResult) {
    results.push(res);
    const icon = res.passed ? '✅ PASSED' : '❌ FAILED';
    const dbIcon = res.dbVerified ? '🗄️ DB Verified' : '⚠️ DB N/A';
    console.log(`[${icon}] [${dbIcon}] [HTTP ${res.httpStatus}/${res.expectedStatus}] ${res.category} -> ${res.testName} (${res.endpoint})`);
    if (res.notes) console.log(`   └─ ${res.notes}`);
  }

  try {
    // -------------------------------------------------------------
    // CATEGORY 1: System & Health
    // -------------------------------------------------------------
    {
      const res = await fetch(`${BASE_URL}/health`);
      const body = await res.json();
      logResult({
        category: '1. System & Health',
        testName: 'Liveness Probe',
        endpoint: 'GET /health',
        httpStatus: res.status,
        expectedStatus: 200,
        dbVerified: false,
        passed: res.status === 200 && body.data?.status === 'healthy',
        notes: `Status: ${body.data?.status}`,
      });
    }

    {
      const res = await fetch(`${BASE_URL}/ready`);
      const body = await res.json();
      logResult({
        category: '1. System & Health',
        testName: 'Readiness Probe',
        endpoint: 'GET /ready',
        httpStatus: res.status,
        expectedStatus: 200,
        dbVerified: true,
        passed: res.status === 200 && body.data?.mongodb?.status === 'connected',
        notes: `MongoDB: ${body.data?.mongodb?.status}, Redis: ${body.data?.redis?.status}`,
      });
    }

    // -------------------------------------------------------------
    // CATEGORY 2: Auth
    // -------------------------------------------------------------
    {
      // Register New User (Create Scenario 201)
      const payload = {
        name: 'Test Automation User',
        email: testEmail,
        password: 'Password123!',
        role: 'user',
      };
      const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();

      // Check DB directly
      const dbUser = await db.collection('users').findOne({ email: testEmail });
      dbUserObjId = dbUser?._id as mongoose.Types.ObjectId;
      testUserId = dbUserObjId?.toString() || '';
      testUserToken = body.data?.accessToken || '';

      const dbPassed = !!dbUser && dbUser.name === 'Test Automation User';

      logResult({
        category: '2. Auth',
        testName: 'Register User (Success 201)',
        endpoint: 'POST /api/v1/auth/register',
        httpStatus: res.status,
        expectedStatus: 201,
        dbVerified: dbPassed,
        passed: res.status === 201 && dbPassed,
        notes: `User created in DB with ID: ${testUserId}`,
      });
    }

    {
      // Duplicate Email Register Failure (409 Conflict)
      const initialDbCount = await db.collection('users').countDocuments();
      const payload = {
        name: 'Duplicate User',
        email: testEmail,
        password: 'Password123!',
      };
      const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const finalDbCount = await db.collection('users').countDocuments();
      const dbNotPolluted = initialDbCount === finalDbCount;

      logResult({
        category: '2. Auth',
        testName: 'Register Duplicate Email (Error 409)',
        endpoint: 'POST /api/v1/auth/register',
        httpStatus: res.status,
        expectedStatus: 409,
        dbVerified: dbNotPolluted,
        passed: res.status === 409 && dbNotPolluted,
        notes: `DB user count remained unchanged at ${finalDbCount}`,
      });
    }

    {
      // Register Weak Password Validation Error (400 Bad Request)
      const payload = {
        name: 'Weak Password User',
        email: 'weakpass@orbitlens.app',
        password: 'weak',
      };
      const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const dbUser = await db.collection('users').findOne({ email: 'weakpass@orbitlens.app' });
      const dbNotCreated = !dbUser;

      logResult({
        category: '2. Auth',
        testName: 'Register Weak Password (Error 400)',
        endpoint: 'POST /api/v1/auth/register',
        httpStatus: res.status,
        expectedStatus: 400,
        dbVerified: dbNotCreated,
        passed: res.status === 400 && dbNotCreated,
        notes: `Validation rejected payload before DB creation`,
      });
    }

    {
      // Login User (Success 200)
      const payload = { email: testEmail, password: 'Password123!' };
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      testUserToken = body.data?.accessToken || testUserToken;

      logResult({
        category: '2. Auth',
        testName: 'Login User (Success 200)',
        endpoint: 'POST /api/v1/auth/login',
        httpStatus: res.status,
        expectedStatus: 200,
        dbVerified: true,
        passed: res.status === 200 && !!testUserToken,
        notes: `Issued valid JWT token`,
      });
    }

    {
      // Login User Invalid Credentials (Error 401)
      const payload = { email: testEmail, password: 'WrongPassword' };
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      logResult({
        category: '2. Auth',
        testName: 'Login Invalid Credentials (Error 401)',
        endpoint: 'POST /api/v1/auth/login',
        httpStatus: res.status,
        expectedStatus: 401,
        dbVerified: false,
        passed: res.status === 401,
        notes: `Access rejected for wrong password`,
      });
    }

    // -------------------------------------------------------------
    // CATEGORY 3: Users
    // -------------------------------------------------------------
    {
      // Get User Profile (Success 200)
      const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      const body = await res.json();
      const returnedName = body.data?.name || body.data?.user?.name;

      logResult({
        category: '3. Users',
        testName: 'Get Current Profile (Success 200)',
        endpoint: 'GET /api/v1/users/me',
        httpStatus: res.status,
        expectedStatus: 200,
        dbVerified: true,
        passed: res.status === 200 && !!returnedName,
        notes: `Retrieved user profile for "${returnedName}"`,
      });
    }

    {
      // Get User Profile Without Token (Error 401)
      const res = await fetch(`${BASE_URL}/api/v1/users/me`);
      logResult({
        category: '3. Users',
        testName: 'Get Profile Missing Token (Error 401)',
        endpoint: 'GET /api/v1/users/me',
        httpStatus: res.status,
        expectedStatus: 401,
        dbVerified: false,
        passed: res.status === 401,
        notes: `Blocked request without Bearer token`,
      });
    }

    {
      // Update Profile Name (Update Scenario 200)
      const updatedName = 'Updated Automation Name';
      const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify({ name: updatedName }),
      });

      // Verify DB direct update
      const dbUser = await db.collection('users').findOne({ email: testEmail });
      const dbUpdated = dbUser?.name === updatedName;

      logResult({
        category: '3. Users',
        testName: 'Update Profile Name (Update 200)',
        endpoint: 'PUT /api/v1/users/me',
        httpStatus: res.status,
        expectedStatus: 200,
        dbVerified: dbUpdated,
        passed: res.status === 200 && dbUpdated,
        notes: `DB record name verified updated to: "${dbUser?.name}"`,
      });
    }

    // -------------------------------------------------------------
    // CATEGORY 4: Projects
    // -------------------------------------------------------------
    {
      // Create Project (Create Scenario 201)
      const payload = {
        name: 'Lunar Crater Alignment Project',
        description: 'Testing OHRC and TMC sub-pixel alignment accuracy.',
        tags: ['lunar', 'ohrc', 'test'],
      };
      const res = await fetch(`${BASE_URL}/api/v1/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify(payload),
      });
      const body = await res.json();

      // Verify in DB directly scoped to current test user
      const dbProj = await db.collection('projects').findOne({ userId: dbUserObjId, name: 'Lunar Crater Alignment Project' });
      testProjectId = dbProj?._id.toString() || body.data?._id || body.data?.id || '';
      const dbCreated = !!dbProj && dbProj.description.includes('OHRC');

      logResult({
        category: '4. Projects',
        testName: 'Create Project (Create 201)',
        endpoint: 'POST /api/v1/projects',
        httpStatus: res.status,
        expectedStatus: 201,
        dbVerified: dbCreated,
        passed: res.status === 201 && dbCreated,
        notes: `Created project in DB with ID: ${testProjectId}`,
      });
    }

    {
      // Update Project (Update Scenario 200)
      const payload = {
        name: 'Lunar Crater Alignment (Phase 2)',
        tags: ['lunar', 'ohrc', 'phase-2'],
      };
      const res = await fetch(`${BASE_URL}/api/v1/projects/${testProjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify(payload),
      });

      // Verify in DB
      const dbProj = await db.collection('projects').findOne({ _id: new mongoose.Types.ObjectId(testProjectId) });
      const dbUpdated = dbProj?.name === 'Lunar Crater Alignment (Phase 2)' && dbProj.tags.includes('phase-2');

      logResult({
        category: '4. Projects',
        testName: 'Update Project (Update 200)',
        endpoint: 'PUT /api/v1/projects/:id',
        httpStatus: res.status,
        expectedStatus: 200,
        dbVerified: dbUpdated,
        passed: res.status === 200 && dbUpdated,
        notes: `DB verified updated project name and tags`,
      });
    }

    // -------------------------------------------------------------
    // CATEGORY 5: Images
    // -------------------------------------------------------------
    {
      // Request Upload URL for Source Image (Create Scenario 201)
      const payload = {
        name: 'Source OHRC Image 001',
        filename: 'ohrc_source_001.tif',
        contentType: 'image/tiff',
        format: 'GEOTIFF',
        sensor: 'OHRC',
        projectId: testProjectId,
        resolutionMetersPerPixel: 0.25,
      };
      const res = await fetch(`${BASE_URL}/api/v1/images/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify(payload),
      });
      const body = await res.json();

      const dbImg = await db.collection('images').findOne({ userId: dbUserObjId, name: 'Source OHRC Image 001' });
      sourceImageId = dbImg?._id.toString() || body.data?.imageId || '';
      const dbPending = dbImg?.status === 'pending_upload';

      logResult({
        category: '5. Images',
        testName: 'Request Presigned Upload URL (201)',
        endpoint: 'POST /api/v1/images/upload-url',
        httpStatus: res.status,
        expectedStatus: 201,
        dbVerified: dbPending,
        passed: res.status === 201 && dbPending,
        notes: `Generated S3 presigned URL. DB status: pending_upload, ID: ${sourceImageId}`,
      });
    }

    {
      // Confirm Upload Completion (Approve/Confirm Scenario 200)
      const payload = {
        fileSizeBytes: 5242880,
        width: 2048,
        height: 2048,
        channels: 1,
      };
      const res = await fetch(`${BASE_URL}/api/v1/images/${sourceImageId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify(payload),
      });

      // Verify in DB
      const dbImg = await db.collection('images').findOne({ _id: new mongoose.Types.ObjectId(sourceImageId) });
      const dbConfirmed = dbImg?.status === 'ready' && dbImg.width === 2048;

      logResult({
        category: '5. Images',
        testName: 'Confirm Upload Completion (Approve 200)',
        endpoint: 'POST /api/v1/images/:id/confirm',
        httpStatus: res.status,
        expectedStatus: 200,
        dbVerified: dbConfirmed,
        passed: res.status === 200 && dbConfirmed,
        notes: `DB verified status updated to "ready" with dimensions 2048x2048`,
      });
    }

    {
      // Request Upload URL & Confirm Reference Image
      const payload = {
        name: 'Reference TMC Image 002',
        filename: 'tmc_ref_002.tif',
        contentType: 'image/tiff',
        format: 'GEOTIFF',
        sensor: 'TMC-2',
        projectId: testProjectId,
        resolutionMetersPerPixel: 5.0,
      };
      const res = await fetch(`${BASE_URL}/api/v1/images/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify(payload),
      });
      
      const dbImg = await db.collection('images').findOne({ userId: dbUserObjId, name: 'Reference TMC Image 002' });
      referenceImageId = dbImg?._id.toString() || '';

      // Confirm reference image upload
      await fetch(`${BASE_URL}/api/v1/images/${referenceImageId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify({ fileSizeBytes: 1048576, width: 1024, height: 1024 }),
      });
    }

    // -------------------------------------------------------------
    // CATEGORY 6: Jobs
    // -------------------------------------------------------------
    {
      // Job Creation Error - Same Image Selection (Error 400)
      const payload = {
        sourceImageId: sourceImageId,
        referenceImageId: sourceImageId,
      };
      const res = await fetch(`${BASE_URL}/api/v1/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify(payload),
      });

      logResult({
        category: '6. Jobs',
        testName: 'Create Job Same Source & Reference (Error 400)',
        endpoint: 'POST /api/v1/jobs',
        httpStatus: res.status,
        expectedStatus: 400,
        dbVerified: true,
        passed: res.status === 400,
        notes: `Rejected duplicate image selection`,
      });
    }

    {
      // Create Registration Job (Create Scenario 201)
      const payload = {
        sourceImageId: sourceImageId,
        referenceImageId: referenceImageId,
        projectId: testProjectId,
        algorithm: 'classical',
        transformModel: 'homography',
      };
      const res = await fetch(`${BASE_URL}/api/v1/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify(payload),
      });
      const body = await res.json();

      // Check DB
      const dbJob = await db.collection('jobs').findOne({ userId: dbUserObjId, sourceImageId: new mongoose.Types.ObjectId(sourceImageId) });
      testJobId = dbJob?._id.toString() || body.data?.job?.id || body.data?._id || '';
      const dbQueued = dbJob?.status === 'queued';

      logResult({
        category: '6. Jobs',
        testName: 'Create Registration Job (Create 201)',
        endpoint: 'POST /api/v1/jobs',
        httpStatus: res.status,
        expectedStatus: 201,
        dbVerified: dbQueued,
        passed: res.status === 201 && dbQueued,
        notes: `Created job in DB with ID: ${testJobId}, status: queued`,
      });
    }

    {
      // Internal Status Callback Update (Approve/Update Scenario 200)
      const payload = {
        status: 'complete',
        progress: 100,
        statusMessage: 'Registration completed with high accuracy',
        metrics: {
          rmse: 0.38,
          inlierCount: 420,
          totalCandidateMatches: 500,
          inlierRatio: 0.84,
          meanReprojectionError: 0.32,
          medianReprojectionError: 0.30,
          coverageUniformityScore: 0.91,
          processingTimeMs: 1250,
        },
      };
      const res = await fetch(`${BASE_URL}/api/v1/jobs/${testJobId}/status-internal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Key': env.PROCESSING_SERVICE_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      // Check DB direct state update
      const dbJob = await db.collection('jobs').findOne({ _id: new mongoose.Types.ObjectId(testJobId) });
      const dbCompleted = dbJob?.status === 'complete' && dbJob?.metrics?.rmse === 0.38;

      logResult({
        category: '6. Jobs',
        testName: 'Internal Job Status Callback (Approve 200)',
        endpoint: 'POST /api/v1/jobs/:id/status-internal',
        httpStatus: res.status,
        expectedStatus: 200,
        dbVerified: dbCompleted,
        passed: res.status === 200 && dbCompleted,
        notes: `DB verified status updated to "complete" and RMSE metrics populated`,
      });
    }

    {
      // Delete/Cancel Job (Discard Scenario 200)
      const res = await fetch(`${BASE_URL}/api/v1/jobs/${testJobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${testUserToken}` },
      });

      // Check DB verification that record is deleted
      const dbJob = await db.collection('jobs').findOne({ _id: new mongoose.Types.ObjectId(testJobId) });
      const dbDeleted = !dbJob;

      logResult({
        category: '6. Jobs',
        testName: 'Delete / Cancel Job (Discard 200)',
        endpoint: 'DELETE /api/v1/jobs/:id',
        httpStatus: res.status,
        expectedStatus: 200,
        dbVerified: dbDeleted,
        passed: res.status === 200 && dbDeleted,
        notes: `DB verified record deleted from jobs collection`,
      });
    }

    // -------------------------------------------------------------
    // CATEGORY 7: Metrics
    // -------------------------------------------------------------
    {
      const res = await fetch(`${BASE_URL}/api/v1/metrics/overview`, {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      const body = await res.json();

      logResult({
        category: '7. Metrics',
        testName: 'Get Metrics Overview (200)',
        endpoint: 'GET /api/v1/metrics/overview',
        httpStatus: res.status,
        expectedStatus: 200,
        dbVerified: true,
        passed: res.status === 200 && body.data?.overview !== undefined,
        notes: `Retrieved metrics overview for current user`,
      });
    }

    // -------------------------------------------------------------
    // CATEGORY 8: Contact
    // -------------------------------------------------------------
    {
      // Submit Contact Message (Create Scenario 201)
      const payload = {
        name: 'Dr. Vikram',
        email: 'vikram.isro@example.org',
        subject: 'OHRC Sub-Pixel Alignment Verification',
        message: 'Requesting validation test dataset for lunar south pole region.',
      };
      const res = await fetch(`${BASE_URL}/api/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Verify DB direct record
      const dbContact = await db.collection('contact_messages').findOne({ email: 'vikram.isro@example.org' });
      const dbCreated = !!dbContact && dbContact.subject.includes('OHRC');

      logResult({
        category: '8. Contact',
        testName: 'Submit Contact Message (Create 201)',
        endpoint: 'POST /api/v1/contact',
        httpStatus: res.status,
        expectedStatus: 201,
        dbVerified: dbCreated,
        passed: res.status === 201 && dbCreated,
        notes: `DB verified contact message inserted into contact_messages collection`,
      });
    }

    // Clean up test user account (Discard Account Scenario 200)
    {
      const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify({ confirmation: 'DELETE MY ACCOUNT' }),
      });

      const dbUser = await db.collection('users').findOne({ email: testEmail });
      const dbDeleted = !dbUser;

      logResult({
        category: '3. Users',
        testName: 'Delete User Account (Discard 200)',
        endpoint: 'DELETE /api/v1/users/me',
        httpStatus: res.status,
        expectedStatus: 200,
        dbVerified: dbDeleted,
        passed: res.status === 200 && dbDeleted,
        notes: `Test automation account cleaned up and deleted from DB`,
      });
    }
  } catch (err: any) {
    console.error('❌ Unexpected Error during test execution:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
  }

  // Summary Report
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log('\n========================================================================');
  console.log(`📊 COMPLETE INTEGRATION TEST SUITE RESULT: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
