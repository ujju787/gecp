// Digital Library & Study Resource Hub Data for GEC Palamu

export const LIBRARY_CATEGORIES = [
  "All Categories",
  "Previous Year Questions (PYQs)",
  "Faculty Lecture Notes",
  "Laboratory Manuals",
  "JUT Syllabus & Curriculum",
  "Student Shared Notes"
];

export const INITIAL_RESOURCES = [
  // PYQs
  {
    id: "res-pyq-1",
    title: "JUT End-Term Exam 2025: Database Management Systems (CS501)",
    category: "Previous Year Questions (PYQs)",
    branch: "CSE",
    semester: "5th Semester",
    year: "2025",
    fileType: "PDF",
    size: "2.4 MB",
    downloads: 412,
    rating: 4.9,
    uploadedBy: "Central Exam Cell",
    tags: ["DBMS", "SQL", "Normalization", "Transactions", "JUT 2025"]
  },
  {
    id: "res-pyq-2",
    title: "JUT End-Term Exam 2024: Operating Systems & Systems Programming (CS502)",
    category: "Previous Year Questions (PYQs)",
    branch: "CSE",
    semester: "5th Semester",
    year: "2024",
    fileType: "PDF",
    size: "1.8 MB",
    downloads: 380,
    rating: 4.8,
    uploadedBy: "Central Exam Cell",
    tags: ["OS", "CPU Scheduling", "Paging", "Deadlocks"]
  },
  {
    id: "res-pyq-3",
    title: "JUT End-Term Exam 2025: Fluid Mechanics & Machinery (ME301)",
    category: "Previous Year Questions (PYQs)",
    branch: "ME",
    semester: "3rd Semester",
    year: "2025",
    fileType: "PDF",
    size: "3.1 MB",
    downloads: 295,
    rating: 4.7,
    uploadedBy: "Mechanical Dept",
    tags: ["Bernoulli", "Navier Stokes", "Turbines", "Pumps"]
  },
  {
    id: "res-pyq-4",
    title: "JUT End-Term Exam 2024: Structural Analysis & Design (CE501)",
    category: "Previous Year Questions (PYQs)",
    branch: "CE",
    semester: "5th Semester",
    year: "2024",
    fileType: "PDF",
    size: "2.9 MB",
    downloads: 260,
    rating: 4.8,
    uploadedBy: "Civil Dept",
    tags: ["Moment Distribution", "Trusses", "Deflection"]
  },
  {
    id: "res-pyq-5",
    title: "JUT End-Term Exam 2025: Power Systems Analysis (EE501)",
    category: "Previous Year Questions (PYQs)",
    branch: "EE",
    semester: "5th Semester",
    year: "2025",
    fileType: "PDF",
    size: "2.7 MB",
    downloads: 310,
    rating: 4.9,
    uploadedBy: "Electrical Dept",
    tags: ["Load Flow", "Fault Analysis", "Stability", "JUT 2025"]
  },

  // Faculty Lecture Notes
  {
    id: "res-not-1",
    title: "Complete Lecture Notes: Design & Analysis of Algorithms (Unit 1 to 5)",
    category: "Faculty Lecture Notes",
    branch: "CSE",
    semester: "5th Semester",
    year: "2026",
    fileType: "PDF",
    size: "8.6 MB",
    downloads: 740,
    rating: 5.0,
    uploadedBy: "Prof. Priya Kumari (CSE Dept)",
    tags: ["Asymptotic Notations", "Greedy", "DP", "NP-Completeness"]
  },
  {
    id: "res-not-2",
    title: "Thermodynamics & Heat Transfer Handwritten Formulae & Derivations",
    category: "Faculty Lecture Notes",
    branch: "ME",
    semester: "3rd Semester",
    year: "2026",
    fileType: "PDF",
    size: "5.4 MB",
    downloads: 489,
    rating: 4.9,
    uploadedBy: "Dr. R. N. Pathak (HOD Mechanical)",
    tags: ["Carnot Cycle", "Entropy", "Conduction", "Radiation"]
  },
  {
    id: "res-not-3",
    title: "Geotechnical Engineering Soil Mechanics Master Notes",
    category: "Faculty Lecture Notes",
    branch: "CE",
    semester: "4th Semester",
    year: "2025",
    fileType: "PDF",
    size: "6.2 MB",
    downloads: 320,
    rating: 4.7,
    uploadedBy: "Dr. S. K. Gupta (Civil Dept)",
    tags: ["Soil Classification", "Permeability", "Shear Strength"]
  },

  // Lab Manuals
  {
    id: "res-lab-1",
    title: "Official Lab Manual: DBMS & PL/SQL Practical with 25 Verified Programs",
    category: "Laboratory Manuals",
    branch: "CSE",
    semester: "5th Semester",
    year: "2026",
    fileType: "PDF",
    size: "4.1 MB",
    downloads: 512,
    rating: 4.9,
    uploadedBy: "Dr. A. K. Verma",
    tags: ["SQL DDL/DML", "Triggers", "Cursors", "Procedures", "ER Diagram"]
  },
  {
    id: "res-lab-2",
    title: "Electrical Machines & Virtual Simulation Lab Guide",
    category: "Laboratory Manuals",
    branch: "EE",
    semester: "4th Semester",
    year: "2025",
    fileType: "PDF",
    size: "3.8 MB",
    downloads: 278,
    rating: 4.8,
    uploadedBy: "Prof. Rakesh Ranjan",
    tags: ["Transformers", "Induction Motors", "Synchronous Machines"]
  },

  // Syllabus
  {
    id: "res-syl-1",
    title: "JUT AICTE Model Curriculum: B.Tech All Branches 1st & 2nd Semester",
    category: "JUT Syllabus & Curriculum",
    branch: "Common",
    semester: "1st & 2nd Sem",
    year: "2026",
    fileType: "PDF",
    size: "1.9 MB",
    downloads: 1240,
    rating: 5.0,
    uploadedBy: "Academic Cell GEC Palamu",
    tags: ["AICTE", "Engineering Physics", "Mathematics", "Basic Electronics"]
  },
  {
    id: "res-syl-2",
    title: "Jharkhand University of Technology: B.Tech CSE Complete 3rd-8th Sem Syllabus",
    category: "JUT Syllabus & Curriculum",
    branch: "CSE",
    semester: "3rd to 8th Sem",
    year: "2026",
    fileType: "PDF",
    size: "2.1 MB",
    downloads: 890,
    rating: 4.9,
    uploadedBy: "Academic Cell GEC Palamu",
    tags: ["Full Syllabus", "Course Outcomes", "Electives", "Credit System"]
  },

  // Community Shared Notes
  {
    id: "res-comm-1",
    title: "Student Short Notes: Computer Networks Quick Revision Sheet for Midterms",
    category: "Student Shared Notes",
    branch: "CSE",
    semester: "5th Semester",
    year: "2026",
    fileType: "PDF",
    size: "1.2 MB",
    downloads: 320,
    rating: 4.8,
    uploadedBy: "CSE Academic Cell",
    tags: ["OSI Model", "Subnetting", "TCP/UDP", "Routing Protocols"]
  }
];
