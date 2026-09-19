// Official College Data for Government Engineering College, Palamu (GEC Palamu)
// Sourced & enriched from https://www.gecpalamu.ac.in/

export const COLLEGE_INFO = {
  name: "Government Engineering College, Palamu",
  hindiName: "राजकीय अभियंत्रण महाविद्यालय, पलामू",
  tagline: "शिक्षा के क्षेत्र में पलामू लिख रहा इतिहास",
  affiliation: "Affiliated to Jharkhand University of Technology (JUT), Ranchi",
  approval: "Approved by AICTE, New Delhi",
  governance: "Department of Higher and Technical Education, Government of Jharkhand",
  established: 2022,
  address: "Post: Lesliganj, Medininagar, Palamu, Jharkhand - 822118",
  email: "gecp.academic@gmail.com",
  phone: "+91 94311 02845",
  womenHelpline: "181 / +91 94311 02846 (24x7)",
  antiRaggingTollFree: "1800-180-5522",
  campusArea: "50+ Acres Lush Green Campus",
  principal: {
    name: "Dr. Sanjay Kumar Singh",
    designation: "Principal, GEC Palamu",
    qualification: "Ph.D., M.Tech, B.Tech",
    message: `The Institute is established to create, nurture, and shape technical professionals and leaders to create an inclusive and sustainable society in a national and international perspective. To achieve this vision, we launched undergraduate engineering degree programs that nurture many vibrant and promising professionals equipped with skills to face the ever changing social, economical and technical landscape of our country.

At Government Engineering College, Palamu, we provide high-end undergraduate education and research opportunities in new frontiers of Engineering and Technology with special focus towards Leadership & Innovation. Students are provided with opportunities for interaction with experts from Industry through Guest Lectures, Industrial Visits, Vocational Training (internships), student chapters of International Professional bodies, and sponsored projects.

Spacious green campus in Lesliganj, state-of-the-art laboratories, enriched central library, and peaceful academic atmosphere ensure that learning becomes a truly transformative experience for every student.`
  },
  vision: "To attain global levels of excellence in scientific and technical education, fostering research, innovation, leadership qualities, and entrepreneurial attitude, contributing to the advancement of society and mankind.",
  mission: [
    "To provide high-quality undergraduate engineering education grounded in solid fundamentals and state-of-the-art technologies.",
    "To build strong industry-academia collaborations facilitating internships, live projects, and premier placements.",
    "To cultivate human values, ethical standards, environmental sensitivity, and societal commitment in future engineers.",
    "To develop modern infrastructure, research facilities, and incubation ecosystems in the Palamu region."
  ]
};

export const DEPARTMENTS = [
  {
    id: "cse",
    name: "Computer Science and Engineering",
    code: "CSE",
    intake: 60,
    head: "Dr. Bhawesh Kumar",
    hodEmail: "dr.bhawesh@gecpalamu.ac.in",
    hodPhone: "+91 94311 87211",
    established: 2022,
    description: "The Department of Computer Science & Engineering offers modern curricula emphasizing Cloud Computing, Artificial Intelligence, Machine Learning, Web Technologies, and Cyber Security.",
    labs: [
      "Advanced Computing & Cloud Lab",
      "Object Oriented Programming & Data Structures Lab",
      "Database Systems & Web Technologies Lab",
      "Network Security & IoT Research Lab"
    ],
    faculty: [
      { name: "Dr. Bhawesh Kumar", role: "Associate Professor & HOD", specialization: "Distributed Computing, Cloud & AI Architectures" },
      { name: "Prof. Amit Sharma", role: "Assistant Professor", specialization: "Operating Systems & Computer Networks" },
      { name: "Prof. Priya Kumari", role: "Assistant Professor", specialization: "Design & Analysis of Algorithms, Data Science" },
      { name: "Prof. Rajesh Gupta", role: "Assistant Professor", specialization: "Database Systems & Full Stack Development" }
    ],
    syllabusUrl: "#"
  },
  {
    id: "ee",
    name: "Electrical Engineering",
    code: "EE",
    intake: 60,
    head: "Dr. Vineet Shekhar",
    hodEmail: "dr.vineet@gecpalamu.ac.in",
    hodPhone: "+91 94311 87222",
    established: 2022,
    description: "Equips students with rigorous electrical theory and modern applications in Power Systems, Renewable Energy Microgrids, Control Systems, and Electric Vehicles.",
    labs: [
      "Electrical Machines & Drives Lab",
      "Power Systems Simulation Lab",
      "Control Systems & Microprocessors Lab",
      "Basic Electrical & Electronics Lab"
    ],
    faculty: [
      { name: "Dr. Vineet Shekhar", role: "Associate Professor & HOD", specialization: "Smart Grids, Renewable Microgrids & Power Systems" },
      { name: "Prof. Neha Agarwal", role: "Assistant Professor", specialization: "Control Systems Engineering & Automation" },
      { name: "Prof. Alok Tiwari", role: "Assistant Professor", specialization: "Electric Drives & Power Electronics Converters" }
    ],
    syllabusUrl: "#"
  },
  {
    id: "me",
    name: "Mechanical Engineering",
    code: "ME",
    intake: 60,
    head: "Dr. Shivam Verma",
    hodEmail: "dr.shivam@gecpalamu.ac.in",
    hodPhone: "+91 94311 87233",
    established: 2022,
    description: "Provides foundational and cutting-edge mechanical training in Thermal Engineering, Robotics, CAD/CAM, Automobile Engineering, and Manufacturing Sciences.",
    labs: [
      "Fluid Mechanics & Hydraulic Machinery Lab",
      "Thermodynamics & Heat Transfer Lab",
      "CAD/CAM Simulation & Modeling Lab",
      "Engineering Mechanics & Workshop Practice"
    ],
    faculty: [
      { name: "Dr. Shivam Verma", role: "Associate Professor & HOD", specialization: "Thermal Engineering, Robotics & CAD/CAM" },
      { name: "Prof. Rahul Sinha", role: "Assistant Professor", specialization: "Fluid Mechanics & Hydraulic Machinery" },
      { name: "Prof. Sunita Soren", role: "Assistant Professor", specialization: "Manufacturing Processes & Materials" }
    ],
    syllabusUrl: "#"
  },
  {
    id: "ce",
    name: "Civil Engineering",
    code: "CE",
    intake: 60,
    head: "Dr. Manish Ranjan",
    hodEmail: "dr.manish@gecpalamu.ac.in",
    hodPhone: "+91 94311 87244",
    established: 2022,
    description: "Focused on Structural Design, Environmental Engineering, Geo-technical survey, and Sustainable Infrastructure Development.",
    labs: [
      "Structural Analysis & Concrete Technology Lab",
      "Geotechnical & Soil Mechanics Lab",
      "Transportation Engineering Lab",
      "Advanced Surveying & GIS Lab"
    ],
    faculty: [
      { name: "Dr. Manish Ranjan", role: "Associate Professor & HOD", specialization: "Structural Dynamics, Earthquake Engg & Geotechnical Systems" },
      { name: "Prof. Vikash Kumar", role: "Assistant Professor", specialization: "Hydrology, Water Resources & Environmental Engg" },
      { name: "Prof. Ananya Roy", role: "Assistant Professor", specialization: "Geotechnical Soil Testing, Surveying & GIS" }
    ],
    syllabusUrl: "#"
  }
];

export const NOTICES_AND_TENDERS = {
  notices: [
    {
      id: "n-1",
      title: "Notice for Regular Class Commencement of Semester-3rd and 5th Sem Students",
      date: "2026-09-12",
      category: "Academic",
      isNew: true,
      description: "All students of 3rd and 5th semester are hereby informed that regular offline classes will commence as per the revised university timetable.",
      file: "Notice_Class_Commence_3rd_5th.pdf"
    },
    {
      id: "n-2",
      title: "Notice for Hostel Allocation of New Batch 2026-27",
      date: "2026-09-08",
      category: "Hostel",
      isNew: true,
      description: "Hostel allotment list for newly admitted B.Tech 1st year students has been published. Selected students must clear hostel dues by the due date.",
      file: "Hostel_Allocation_2026.pdf"
    },
    {
      id: "n-3",
      title: "Notice for Induction Programme of New Batch 2026-27",
      date: "2026-09-05",
      category: "Academic",
      isNew: true,
      description: "A 3-week AICTE mandatory Induction Programme for newly admitted B.Tech students will commence at the Main Seminar Hall.",
      file: "Induction_Programme_2026.pdf"
    },
    {
      id: "n-4",
      title: "Notice regarding Online Counselling on the basis of JEE (Main) - JCECEB",
      date: "2026-08-28",
      category: "Admission",
      isNew: false,
      description: "State Merit List counselling schedule for B.Tech admission at GEC Palamu through Jharkhand Combined Entrance Competitive Examination Board.",
      file: "JCECEB_Counselling_Notice.pdf"
    },
    {
      id: "n-5",
      title: "Notice: Regarding Examination and Form Verification of 7th Sem (2022-26 Batch)",
      date: "2026-08-20",
      category: "Examination",
      isNew: false,
      description: "Students must submit the verified examination forms and fee receipt at the academic section counter.",
      file: "Exam_Form_Verification_7thSem.pdf"
    },
    {
      id: "n-6",
      title: "Notice: Bank Loan & e-Kalyan Scholarship Assistance Camp",
      date: "2026-08-15",
      category: "Scholarship",
      isNew: false,
      description: "SBI and Canara Bank teams will set up an education loan desk at the administrative block alongside e-Kalyan Jharkhand document verification.",
      file: "Education_Loan_Notice.pdf"
    }
  ],
  tenders: [
    {
      id: "t-1",
      title: "Short Tender Notice: Regarding Innovation and Incubation Centre Setup",
      date: "2026-09-10",
      category: "Infrastructure",
      isNew: true,
      refNo: "GECP/TEND/2026/04",
      lastDate: "2026-09-28"
    },
    {
      id: "t-2",
      title: "Short Tender Notice for Digital Library Automation & RFID Implementation",
      date: "2026-09-02",
      category: "Library",
      isNew: true,
      refNo: "GECP/TEND/2026/03",
      lastDate: "2026-09-22"
    },
    {
      id: "t-3",
      title: "Tender Notice: Engineering Mechanics & Advanced CAD Lab Installation",
      date: "2026-08-24",
      category: "Laboratories",
      isNew: false,
      refNo: "GECP/TEND/2026/02",
      lastDate: "2026-09-15"
    },
    {
      id: "t-4",
      title: "Notice-Tender for Comprehensive Group Accidental Insurance for Students",
      date: "2026-08-10",
      category: "Student Welfare",
      isNew: false,
      refNo: "GECP/TEND/2026/01",
      lastDate: "2026-08-30"
    }
  ]
};

export const QUICK_STATS = [
  { label: "AICTE Approved Intake", value: "240+", suffix: "/ Year" },
  { label: "Engineering Disciplines", value: "4", suffix: "Branches" },
  { label: "Advanced Labs & Workshops", value: "24+", suffix: "State-of-art" },
  { label: "Campus Green Acreage", value: "50+", suffix: "Acres" },
  { label: "Highest Placement Offer", value: "₹18.5", suffix: "LPA" },
  { label: "Average Package", value: "₹5.8", suffix: "LPA" }
];
