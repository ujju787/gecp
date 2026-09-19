// Mock Student & Faculty Data for GEC Palamu Portal
// All mock students purged: only newly registered students are loaded dynamically from SQLite database.

export const DEFAULT_STUDENT = null;

export const DEFAULT_FACULTY = {
  id: "fac-01",
  name: "Dr. A. K. Verma",
  designation: "Associate Professor & Head of Department",
  department: "Computer Science and Engineering",
  email: "akverma.cse@gecpalamu.ac.in",
  phone: "+91 94311 02845",
  specialization: "Distributed Systems, Database Engineering",
  assignedClasses: [
    { code: "CS501", name: "Database Management Systems", semester: "5th Sem", studentsCount: 0 },
    { code: "CS505P", name: "DBMS Laboratory", semester: "5th Sem", studentsCount: 0 },
    { code: "CS701", name: "Cloud Computing & DevOps", semester: "7th Sem", studentsCount: 0 }
  ],
  studentRosterCS501: []
};
