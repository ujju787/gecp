// Automated Full-Stack Verification Suite for SQL, Python QR & UPI Gateway
import { db, sqlDb } from '../db.js';

const BASE_URL = 'http://localhost:5000/api';
const EXPECTED_UPI_ID = '6205482672@ptsbi';

async function runTests() {
  console.log('===========================================================');
  console.log('🚀 RUNNING GEC PALAMU SQL, PYTHON QR & UPI INTEGRATION TESTS');
  console.log('===========================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Test SQL Database Engine directly
  console.log('\n--- 1. Testing SQL Relational Database Layer ---');
  try {
    const users = db.getUsers();
    assert(Array.isArray(users) && users.length > 0, `Users fetched from SQLite (${users.length} users found)`);

    const admin = db.findUserByEmail('admin@gecpalamu.ac.in');
    assert(admin && admin.role === 'admin', `Admin found in SQLite: ${admin?.name}`);

    const student = db.findUserByRoll('22/CSE/042');
    assert(student && student.rollNo === '22/CSE/042', `Student found by Roll in SQLite: ${student?.name}`);

    const testUserRoll = `TEST/ROLL/${Date.now().toString().slice(-4)}`;
    const createdUser = db.createUser({
      id: `usr-test-${Date.now()}`,
      name: 'Test SQL Student',
      email: `test.${Date.now()}@gecpalamu.ac.in`,
      password: 'hashed_password_test',
      role: 'student',
      rollNo: testUserRoll,
      branch: 'Computer Science',
      branchCode: 'CSE',
      status: 'PENDING'
    });
    assert(createdUser && createdUser.rollNo === testUserRoll, `User created via SQL INSERT: ${createdUser.id}`);

    const foundCreated = db.findUserById(createdUser.id);
    assert(foundCreated && foundCreated.name === 'Test SQL Student', `Created user retrieved via SQL prepared SELECT`);

    const approved = db.approveStudent(createdUser.id, 'usr-admin-01');
    assert(approved && approved.status === 'APPROVED', `Student approved via SQL UPDATE`);
  } catch (err) {
    console.error('SQL Test Exception:', err);
    failed++;
  }

  // 2. Test Python QR Engine API Endpoint
  console.log('\n--- 2. Testing Python QR Generator Engine (Python 3.14 + Pillow) ---');
  try {
    const upiTestString = `upi://pay?pa=${EXPECTED_UPI_ID}&pn=Government%20Engineering%20College%20Palamu&mc=8221&tn=GECP%20Institutional%20Fee&am=2400&cu=INR`;
    const res = await fetch(`${BASE_URL}/qr/python`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: upiTestString,
        boxSize: 8,
        fillColor: '#0c4a6e'
      })
    });
    const qrData = await res.json();
    assert(res.ok && qrData.success === true, `Python QR API returned HTTP 200 OK & success=true`);
    assert(qrData.engine && qrData.engine.includes('Python'), `Engine verified: ${qrData.engine}`);
    assert(typeof qrData.qrBase64 === 'string' && qrData.qrBase64.startsWith('data:image/png;base64,'), `Base64 image output generated (${qrData.qrBase64?.length} chars)`);
  } catch (err) {
    console.error('Python QR Test Exception:', err);
    failed++;
  }

  // 3. Test UPI Payment Gateway with 6205482672@ptsbi
  console.log('\n--- 3. Testing UPI Payment Gateway & SQL Transaction Persistence ---');
  try {
    const testUtr = `4256${Math.floor(10000000 + Math.random() * 90000000)}`;
    const paymentPayload = {
      studentId: 'usr-std-01',
      studentName: 'Rahul Kumar',
      rollNo: '22/CSE/042',
      regNo: 'JUT/2022/CSE/0892',
      branch: 'Computer Science & Engineering',
      semester: '5th Semester',
      purpose: 'JUT End-Term Examination Fee (5th Sem)',
      feeType: 'exam',
      amount: 2400,
      upiId: EXPECTED_UPI_ID,
      utrNumber: testUtr,
      paymentMode: `Online UPI (${EXPECTED_UPI_ID})`,
      categoryConcession: 'general'
    };

    const payRes = await fetch(`${BASE_URL}/payment/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentPayload)
    });
    const payData = await payRes.json();
    assert(payRes.status === 201 && payData.success === true, `Payment processed with HTTP 201 Created`);
    assert(payData.receipt?.upiId === EXPECTED_UPI_ID, `Payee UPI ID verified: ${payData.receipt?.upiId}`);
    assert(payData.receipt?.utrNumber === testUtr, `Bank UTR Number verified: ${payData.receipt?.utrNumber}`);

    const receiptId = payData.receipt?.id;

    // Verify lookup by Receipt ID
    const verifyRes = await fetch(`${BASE_URL}/payment/receipt/${receiptId}`);
    const verifyData = await verifyRes.json();
    assert(verifyRes.ok && verifyData.verified === true, `Receipt verified in SQL database: ${verifyData.receipt?.id}`);
    assert(verifyData.receipt?.upiId === EXPECTED_UPI_ID, `Verified receipt UPI ID matches ${EXPECTED_UPI_ID}`);

    // Verify lookup by UTR Number
    const verifyUtrRes = await fetch(`${BASE_URL}/payment/receipt/${testUtr}`);
    const verifyUtrData = await verifyUtrRes.json();
    assert(verifyUtrRes.ok && verifyUtrData.verified === true, `Receipt verified by 12-Digit UTR: ${verifyUtrData.receipt?.utrNumber}`);
  } catch (err) {
    console.error('Payment Test Exception:', err);
    failed++;
  }

  // 4. Test Smart Attendance via SQL
  console.log('\n--- 4. Testing Smart Attendance SQL Operations ---');
  try {
    const attendancePayload = {
      qrData: JSON.stringify({
        type: 'GECP_ATTENDANCE',
        id: 'usr-std-01',
        roll: '22/CSE/042',
        name: 'Rahul Kumar',
        secKey: 'valid-jut-token-998',
        ts: Date.now()
      }),
      subjectCode: 'CS501',
      subjectName: 'Operating Systems'
    };

    const attRes = await fetch(`${BASE_URL}/attendance/scan-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attendancePayload)
    });
    const attData = await attRes.json();
    // Either verified or duplicate
    assert(attRes.ok || attRes.status === 409, `Smart Attendance endpoint handled QR scan (Status: ${attRes.status})`);

    const logsRes = await fetch(`${BASE_URL}/attendance/logs`);
    const logs = await logsRes.json();
    assert(Array.isArray(logs), `Attendance logs queried from SQLite table (${logs.length} logs)`);
  } catch (err) {
    console.error('Attendance Test Exception:', err);
    failed++;
  }

  console.log('\n===========================================================');
  console.log(`TOTAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===========================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
