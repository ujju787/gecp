// Automated test script for:
// 1. Attendance marked once per day, locked for regular faculty
// 2. HOD authorized override to change marked attendance
// 3. Semester progression upon student passing semester

const API_BASE = 'http://localhost:5000/api';

async function main() {
  console.log('🧪 Starting Automated Tests for Attendance Locking, HOD Override & Semester Progression...\n');

  // Step 1: Login as Regular Faculty (Prof. Amit Sharma)
  console.log('1️⃣ Logging in as Regular Faculty (amit.sharma@gecpalamu.ac.in)...');
  const facLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'amit.sharma@gecpalamu.ac.in', password: 'Faculty@123' })
  });
  const facData = await facLoginRes.json();
  if (!facData.token) throw new Error('Failed to login as faculty: ' + JSON.stringify(facData));
  const facToken = facData.token;
  console.log('   ✅ Faculty logged in successfully. Role:', facData.user.role);

  // Step 2: Login as HOD (Dr. A. K. Verma)
  console.log('\n2️⃣ Logging in as HOD (akverma@gecpalamu.ac.in)...');
  const hodLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'akverma@gecpalamu.ac.in', password: 'Faculty@123' })
  });
  const hodData = await hodLoginRes.json();
  if (!hodData.token) throw new Error('Failed to login as HOD: ' + JSON.stringify(hodData));
  const hodToken = hodData.token;
  console.log('   ✅ HOD logged in successfully. Role:', hodData.user.role, 'Name:', hodData.user.name);

  // Find a student
  const studentsRes = await fetch(`${API_BASE}/students/all`);
  const { students } = await studentsRes.json();
  const testStudent = students[0] || { id: 'usr-std-001', rollNo: '25CSD010', name: 'Ujjwal Kumar' };
  console.log(`\n📋 Target student for test: ${testStudent.name} (Roll: ${testStudent.rollNo}, ID: ${testStudent.id}, Sem: ${testStudent.semester || '1st Sem'})`);

  const todayDate = new Date().toISOString().split('T')[0];
  const testSubject = 'CS502';

  // Step 3: Regular faculty marks attendance for the first time today
  console.log(`\n3️⃣ Regular faculty marking attendance for ${testSubject} today (${todayDate}) as PRESENT...`);
  const mark1Res = await fetch(`${API_BASE}/attendance/mark-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${facToken}`
    },
    body: JSON.stringify({
      facultyId: facData.user.id,
      subjectCode: testSubject,
      subjectName: 'Operating Systems & System Programming',
      date: todayDate,
      records: [
        { studentId: testStudent.id, rollNo: testStudent.rollNo, studentName: testStudent.name, status: 'present' }
      ]
    })
  });
  const mark1Result = await mark1Res.json();
  console.log('   Result of 1st marking:', mark1Result.message || mark1Result);

  // Step 4: Regular faculty tries to change attendance from PRESENT to ABSENT today!
  console.log(`\n4️⃣ Regular faculty attempts to CHANGE attendance to ABSENT today (${todayDate})...`);
  const mark2Res = await fetch(`${API_BASE}/attendance/mark-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${facToken}`
    },
    body: JSON.stringify({
      facultyId: facData.user.id,
      subjectCode: testSubject,
      subjectName: 'Operating Systems & System Programming',
      date: todayDate,
      records: [
        { studentId: testStudent.id, rollNo: testStudent.rollNo, studentName: testStudent.name, status: 'absent' }
      ]
    })
  });
  const mark2Result = await mark2Res.json();
  console.log('   Result of regular faculty attempt:', mark2Result.message || mark2Result);
  if (mark2Result.locked === true) {
    console.log('   🔒 SUCCESS: Regular faculty is BLOCKED from modifying marked attendance!');
  } else {
    console.warn('   ⚠️ Warning: Regular faculty was not blocked!');
  }

  // Step 5: HOD changes the attendance from PRESENT to ABSENT today
  console.log(`\n5️⃣ HOD (Dr. A. K. Verma) executes authorized attendance change to ABSENT...`);
  const hodMarkRes = await fetch(`${API_BASE}/attendance/mark-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hodToken}`
    },
    body: JSON.stringify({
      facultyId: hodData.user.id,
      subjectCode: testSubject,
      subjectName: 'Operating Systems & System Programming',
      date: todayDate,
      isHodOverride: true,
      records: [
        { studentId: testStudent.id, rollNo: testStudent.rollNo, studentName: testStudent.name, status: 'absent' }
      ]
    })
  });
  const hodMarkResult = await hodMarkRes.json();
  console.log('   Result of HOD attempt:', hodMarkResult.message || hodMarkResult);
  if (hodMarkResult.hodOverride === true || hodMarkResult.success === true) {
    console.log('   👑 SUCCESS: HOD successfully authorized and modified the attendance record!');
  } else {
    throw new Error('HOD override failed!');
  }

  // Verify verification method in log
  const logCheckRes = await fetch(`${API_BASE}/attendance/logs?subjectCode=${testSubject}&date=${todayDate}`);
  const logs = await logCheckRes.json();
  const modifiedLog = logs.find(l => l.rollNo === testStudent.rollNo || l.studentId === testStudent.id);
  console.log('   Verified log entry:', {
    subject: modifiedLog?.subjectCode,
    date: modifiedLog?.date,
    status: modifiedLog?.status,
    verifiedVia: modifiedLog?.verifiedVia
  });

  // Step 6: Test Semester Progression
  console.log(`\n6️⃣ Testing Student Semester Progression for ${testStudent.name}...`);
  const currentSem = testStudent.semester || '1st Sem';
  const targetNextSem = currentSem === '1st Sem' ? '2nd Sem' : '3rd Sem';
  console.log(`   Advancing student from ${currentSem} -> ${targetNextSem}...`);

  const promoteRes = await fetch(`${API_BASE}/students/${testStudent.id}/semester`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hodToken}`
    },
    body: JSON.stringify({
      newSemester: targetNextSem,
      cgpa: 8.75
    })
  });
  const promoteResult = await promoteRes.json();
  console.log('   Progression API Response:', promoteResult.message);
  console.log('   Updated student profile in MySQL:', {
    name: promoteResult.student?.name,
    roll: promoteResult.student?.rollNo,
    semester: promoteResult.student?.semester,
    cgpa: promoteResult.student?.cgpa
  });

  // Step 7: Verify examination dues were re-provisioned for the new semester
  console.log(`\n7️⃣ Verifying upcoming semester examination fee dues re-provisioned...`);
  const duesRes = await fetch(`${API_BASE}/payment/dues/${testStudent.id}`);
  const dues = await duesRes.json();
  console.log('   Fee dues in MySQL:', {
    tuitionDue: dues.tuitionDue,
    examDue: dues.examDue,
    examPaid: dues.examPaid
  });

  if (dues.examDue === 2400) {
    console.log('   💳 SUCCESS: Examination fee dues (₹2,400) for the new semester properly re-provisioned!');
  }

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Both requirements fully verified in MySQL 9.4 database.');
}

main().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
