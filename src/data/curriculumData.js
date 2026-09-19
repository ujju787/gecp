// Official Curriculum & Subject Catalog for Government Engineering College, Palamu
// Affiliated with Jharkhand University of Technology (JUT), Ranchi
// Covers 4 Engineering Branches across all 8 Semesters

export const BRANCHES = {
  CSE: {
    code: 'CSE',
    name: 'Computer Science & Engineering',
    hodName: 'Dr. Bhawesh Kumar',
    hodEmail: 'dr.bhawesh@gecpalamu.ac.in',
    description: 'Department of Computer Science & Engineering'
  },
  EE: {
    code: 'EE',
    name: 'Electrical Engineering',
    hodName: 'Dr. Vineet Shekhar',
    hodEmail: 'dr.vineet@gecpalamu.ac.in',
    description: 'Department of Electrical Engineering'
  },
  ME: {
    code: 'ME',
    name: 'Mechanical Engineering',
    hodName: 'Dr. Shivam Verma',
    hodEmail: 'dr.shivam@gecpalamu.ac.in',
    description: 'Department of Mechanical Engineering'
  },
  CE: {
    code: 'CE',
    name: 'Civil Engineering',
    hodName: 'Dr. Manish Ranjan',
    hodEmail: 'dr.manish@gecpalamu.ac.in',
    description: 'Department of Civil Engineering'
  }
};

export const SEMESTERS = [
  '1st Sem', '2nd Sem', '3rd Sem', '4th Sem', 
  '5th Sem', '6th Sem', '7th Sem', '8th Sem'
];

export const CURRICULUM_CATALOG = {
  // Common 1st Year (JUT Standard)
  COMMON_SEM1: [
    { code: 'BS101', name: 'Engineering Physics & Quantum Mechanics', credits: 4, type: 'Theory', faculty: 'Dr. N. K. Mishra' },
    { code: 'BS102', name: 'Mathematics-I (Calculus & Linear Algebra)', credits: 4, type: 'Theory', faculty: 'Dr. Sanjay Kr Singh' },
    { code: 'ES101', name: 'Basic Electrical & Electronics Engineering', credits: 4, type: 'Theory', faculty: 'Prof. Manish Kumar' },
    { code: 'ES102', name: 'Engineering Graphics & Computer Aided Design', credits: 3, type: 'Theory', faculty: 'Prof. S. C. Gupta' },
    { code: 'BS105P', name: 'Engineering Physics Laboratory', credits: 1.5, type: 'Practical', faculty: 'Dr. N. K. Mishra' },
    { code: 'ES103P', name: 'Electrical & Electronics Workshop Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. Manish Kumar' }
  ],
  COMMON_SEM2: [
    { code: 'BS201', name: 'Engineering Chemistry & Material Science', credits: 4, type: 'Theory', faculty: 'Dr. R. K. Pandey' },
    { code: 'BS202', name: 'Mathematics-II (ODE & Complex Variables)', credits: 4, type: 'Theory', faculty: 'Dr. Sanjay Kr Singh' },
    { code: 'ES201', name: 'Programming for Problem Solving (C/C++)', credits: 4, type: 'Theory', faculty: 'Prof. Priya Kumari' },
    { code: 'HS201', name: 'Professional English Communication & Ethics', credits: 3, type: 'Theory', faculty: 'Dr. Anjali Sinha' },
    { code: 'BS205P', name: 'Engineering Chemistry Laboratory', credits: 1.5, type: 'Practical', faculty: 'Dr. R. K. Pandey' },
    { code: 'ES202P', name: 'Computer Programming Laboratory', credits: 1.5, type: 'Practical', faculty: 'Prof. Priya Kumari' }
  ],

  // Computer Science & Engineering (CSE)
  CSE: {
    '1st Sem': 'COMMON_SEM1',
    '2nd Sem': 'COMMON_SEM2',
    '3rd Sem': [
      { code: 'CS301', name: 'Data Structures & Algorithms', credits: 4, type: 'Theory', faculty: 'Prof. Priya Kumari' },
      { code: 'CS302', name: 'Digital Electronics & Logic Design', credits: 4, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'CS303', name: 'Object Oriented Programming with C++', credits: 3, type: 'Theory', faculty: 'Dr. A. K. Verma' },
      { code: 'CS304', name: 'Discrete Mathematics & Graph Theory', credits: 4, type: 'Theory', faculty: 'Dr. Sanjay Kr Singh' },
      { code: 'CS305P', name: 'Data Structures & OOP Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. Priya Kumari' },
      { code: 'CS306P', name: 'Digital Electronics Laboratory', credits: 1.5, type: 'Practical', faculty: 'Prof. Manish Kumar' }
    ],
    '4th Sem': [
      { code: 'CS401', name: 'Computer Organization & Architecture', credits: 4, type: 'Theory', faculty: 'Dr. A. K. Verma' },
      { code: 'CS402', name: 'Formal Language & Automata Theory', credits: 3, type: 'Theory', faculty: 'Prof. Amit Sharma' },
      { code: 'CS403', name: 'Operating Systems Principles', credits: 4, type: 'Theory', faculty: 'Prof. Amit Sharma' },
      { code: 'CS404', name: 'Design and Analysis of Algorithms', credits: 4, type: 'Theory', faculty: 'Prof. Priya Kumari' },
      { code: 'CS405P', name: 'Operating Systems & Linux Shell Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. Amit Sharma' },
      { code: 'CS406P', name: 'Computer Architecture & Simulation Lab', credits: 1.5, type: 'Practical', faculty: 'Dr. A. K. Verma' }
    ],
    '5th Sem': [
      { code: 'CS501', name: 'Database Management Systems', credits: 4, type: 'Theory', faculty: 'Dr. A. K. Verma' },
      { code: 'CS502', name: 'Operating Systems & System Programming', credits: 4, type: 'Theory', faculty: 'Prof. Amit Sharma' },
      { code: 'CS503', name: 'Computer Networks & Internet Protocols', credits: 4, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'CS504', name: 'Design & Analysis of Algorithms', credits: 4, type: 'Theory', faculty: 'Prof. Priya Kumari' },
      { code: 'CS505P', name: 'DBMS & SQL Laboratory', credits: 2, type: 'Practical', faculty: 'Dr. A. K. Verma' },
      { code: 'CS506P', name: 'OS & Linux Shell Laboratory', credits: 1.5, type: 'Practical', faculty: 'Prof. Amit Sharma' },
      { code: 'CS507P', name: 'Algorithms & Competitive Programming Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. Priya Kumari' }
    ],
    '6th Sem': [
      { code: 'CS601', name: 'Compiler Design & Construction', credits: 4, type: 'Theory', faculty: 'Dr. A. K. Verma' },
      { code: 'CS602', name: 'Software Engineering & Agile Methodologies', credits: 4, type: 'Theory', faculty: 'Prof. Amit Sharma' },
      { code: 'CS603', name: 'Artificial Intelligence & Machine Learning', credits: 4, type: 'Theory', faculty: 'Prof. Priya Kumari' },
      { code: 'CS604', name: 'Cryptography & Network Security', credits: 3, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'CS605P', name: 'Compiler Design Lab', credits: 1.5, type: 'Practical', faculty: 'Dr. A. K. Verma' },
      { code: 'CS606P', name: 'AI & Machine Learning Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. Priya Kumari' }
    ],
    '7th Sem': [
      { code: 'CS701', name: 'Cloud Computing & Distributed Systems', credits: 4, type: 'Theory', faculty: 'Dr. A. K. Verma' },
      { code: 'CS702', name: 'Internet of Things (IoT) & Embedded Architecture', credits: 3, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'CS703', name: 'Information Retrieval & Data Mining', credits: 3, type: 'Theory', faculty: 'Prof. Priya Kumari' },
      { code: 'CS704P', name: 'Major Project Phase-I', credits: 3, type: 'Practical', faculty: 'Dr. A. K. Verma' },
      { code: 'CS705', name: 'Industrial Internship & Seminar', credits: 2, type: 'Practical', faculty: 'Prof. Amit Sharma' }
    ],
    '8th Sem': [
      { code: 'CS801', name: 'Big Data Analytics & Data Science', credits: 4, type: 'Theory', faculty: 'Dr. A. K. Verma' },
      { code: 'CS802', name: 'Deep Learning & Neural Networks', credits: 3, type: 'Theory', faculty: 'Prof. Priya Kumari' },
      { code: 'CS803P', name: 'Major Project Phase-II & Final Defense', credits: 8, type: 'Practical', faculty: 'Dr. A. K. Verma' },
      { code: 'CS804', name: 'Comprehensive Technical Viva Voce', credits: 2, type: 'Practical', faculty: 'Prof. Amit Sharma' }
    ]
  },

  // Mechanical Engineering (ME)
  ME: {
    '1st Sem': 'COMMON_SEM1',
    '2nd Sem': 'COMMON_SEM2',
    '3rd Sem': [
      { code: 'ME301', name: 'Thermodynamics & Heat Cycles', credits: 4, type: 'Theory', faculty: 'Prof. Sunil Kumar' },
      { code: 'ME302', name: 'Strength of Materials', credits: 4, type: 'Theory', faculty: 'Prof. K. N. Tiwari' },
      { code: 'ME303', name: 'Materials Science & Metallurgy', credits: 3, type: 'Theory', faculty: 'Dr. R. K. Pandey' },
      { code: 'ME304', name: 'Fluid Mechanics & Machinery', credits: 4, type: 'Theory', faculty: 'Prof. Sunil Kumar' },
      { code: 'ME305P', name: 'Fluid Mechanics Laboratory', credits: 1.5, type: 'Practical', faculty: 'Prof. Sunil Kumar' },
      { code: 'ME306P', name: 'Material Testing Laboratory', credits: 1.5, type: 'Practical', faculty: 'Prof. K. N. Tiwari' }
    ],
    '4th Sem': [
      { code: 'ME401', name: 'Kinematics of Machines', credits: 4, type: 'Theory', faculty: 'Prof. Sunil Kumar' },
      { code: 'ME402', name: 'Applied Thermal Engineering', credits: 4, type: 'Theory', faculty: 'Prof. K. N. Tiwari' },
      { code: 'ME403', name: 'Manufacturing Processes - I', credits: 3, type: 'Theory', faculty: 'Prof. S. C. Gupta' },
      { code: 'ME404', name: 'Heat & Mass Transfer Principles', credits: 4, type: 'Theory', faculty: 'Prof. Sunil Kumar' },
      { code: 'ME405P', name: 'Manufacturing Processes Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. S. C. Gupta' },
      { code: 'ME406P', name: 'Thermal Engineering Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. K. N. Tiwari' }
    ],
    '5th Sem': [
      { code: 'ME501', name: 'Dynamics of Machinery & Vibrations', credits: 4, type: 'Theory', faculty: 'Prof. Sunil Kumar' },
      { code: 'ME502', name: 'Machine Design - I', credits: 4, type: 'Theory', faculty: 'Prof. K. N. Tiwari' },
      { code: 'ME503', name: 'Internal Combustion Engines & Gas Turbines', credits: 4, type: 'Theory', faculty: 'Prof. Sunil Kumar' },
      { code: 'ME504', name: 'Manufacturing Processes - II', credits: 3, type: 'Theory', faculty: 'Prof. S. C. Gupta' },
      { code: 'ME505P', name: 'Dynamics & Vibration Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. Sunil Kumar' },
      { code: 'ME506P', name: 'IC Engines & Automobile Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. K. N. Tiwari' }
    ],
    '6th Sem': [
      { code: 'ME601', name: 'Machine Design - II', credits: 4, type: 'Theory', faculty: 'Prof. K. N. Tiwari' },
      { code: 'ME602', name: 'Refrigeration and Air Conditioning', credits: 4, type: 'Theory', faculty: 'Prof. Sunil Kumar' },
      { code: 'ME603', name: 'Operations Research & Industrial Management', credits: 3, type: 'Theory', faculty: 'Prof. S. C. Gupta' },
      { code: 'ME604', name: 'Finite Element Methods in Engineering', credits: 3, type: 'Theory', faculty: 'Prof. Sunil Kumar' },
      { code: 'ME605P', name: 'CAD/CAM & Simulation Lab', credits: 2, type: 'Practical', faculty: 'Prof. K. N. Tiwari' }
    ],
    '7th Sem': [
      { code: 'ME701', name: 'Power Plant Engineering', credits: 4, type: 'Theory', faculty: 'Prof. Sunil Kumar' },
      { code: 'ME702', name: 'Mechatronics and Industrial Automation', credits: 3, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'ME703', name: 'Total Quality Management & Reliability', credits: 3, type: 'Theory', faculty: 'Prof. S. C. Gupta' },
      { code: 'ME704P', name: 'Major Project Phase-I', credits: 3, type: 'Practical', faculty: 'Prof. Sunil Kumar' },
      { code: 'ME705', name: 'Industrial Internship & Training', credits: 2, type: 'Practical', faculty: 'Prof. K. N. Tiwari' }
    ],
    '8th Sem': [
      { code: 'ME801', name: 'Robotics, CNC & Advanced Automation', credits: 4, type: 'Theory', faculty: 'Prof. Sunil Kumar' },
      { code: 'ME802', name: 'Non-Conventional Energy Resources', credits: 3, type: 'Theory', faculty: 'Prof. K. N. Tiwari' },
      { code: 'ME803P', name: 'Major Project Phase-II & Final Defense', credits: 8, type: 'Practical', faculty: 'Prof. Sunil Kumar' },
      { code: 'ME804', name: 'Comprehensive Technical Seminar', credits: 2, type: 'Practical', faculty: 'Prof. S. C. Gupta' }
    ]
  },

  // Civil Engineering (CE)
  CE: {
    '1st Sem': 'COMMON_SEM1',
    '2nd Sem': 'COMMON_SEM2',
    '3rd Sem': [
      { code: 'CE301', name: 'Surveying & Geomatics', credits: 4, type: 'Theory', faculty: 'Prof. S. C. Gupta' },
      { code: 'CE302', name: 'Mechanics of Solids & Structural Materials', credits: 4, type: 'Theory', faculty: 'Prof. V. K. Singh' },
      { code: 'CE303', name: 'Building Materials & Construction Tech', credits: 3, type: 'Theory', faculty: 'Prof. S. C. Gupta' },
      { code: 'CE304', name: 'Fluid Mechanics & Hydraulics', credits: 4, type: 'Theory', faculty: 'Prof. V. K. Singh' },
      { code: 'CE305P', name: 'Surveying Field Practice Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. S. C. Gupta' },
      { code: 'CE306P', name: 'Fluid Mechanics & Hydraulics Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. V. K. Singh' }
    ],
    '4th Sem': [
      { code: 'CE401', name: 'Structural Analysis - I', credits: 4, type: 'Theory', faculty: 'Prof. V. K. Singh' },
      { code: 'CE402', name: 'Geotechnical Engineering - I (Soil Mechanics)', credits: 4, type: 'Theory', faculty: 'Prof. S. C. Gupta' },
      { code: 'CE403', name: 'Hydrology & Water Resources Engineering', credits: 3, type: 'Theory', faculty: 'Prof. V. K. Singh' },
      { code: 'CE404', name: 'Concrete Technology & Mix Design', credits: 4, type: 'Theory', faculty: 'Prof. S. C. Gupta' },
      { code: 'CE405P', name: 'Geotechnical Soil Testing Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. S. C. Gupta' },
      { code: 'CE406P', name: 'Concrete Testing & Quality Control Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. V. K. Singh' }
    ],
    '5th Sem': [
      { code: 'CE501', name: 'Design of Reinforced Concrete Structures', credits: 4, type: 'Theory', faculty: 'Prof. V. K. Singh' },
      { code: 'CE502', name: 'Structural Analysis - II', credits: 4, type: 'Theory', faculty: 'Prof. S. C. Gupta' },
      { code: 'CE503', name: 'Geotechnical Engineering - II (Foundations)', credits: 4, type: 'Theory', faculty: 'Prof. S. C. Gupta' },
      { code: 'CE504', name: 'Environmental Engineering - I (Water Supply)', credits: 3, type: 'Theory', faculty: 'Prof. V. K. Singh' },
      { code: 'CE505P', name: 'Structural CAD & RC Detailing Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. V. K. Singh' },
      { code: 'CE506P', name: 'Environmental Engineering Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. S. C. Gupta' }
    ],
    '6th Sem': [
      { code: 'CE601', name: 'Design of Steel Structures', credits: 4, type: 'Theory', faculty: 'Prof. V. K. Singh' },
      { code: 'CE602', name: 'Transportation Engineering - I (Highways)', credits: 4, type: 'Theory', faculty: 'Prof. S. C. Gupta' },
      { code: 'CE603', name: 'Environmental Engineering - II (Wastewater)', credits: 3, type: 'Theory', faculty: 'Prof. V. K. Singh' },
      { code: 'CE604', name: 'Irrigation Engineering & Hydraulic Structures', credits: 3, type: 'Theory', faculty: 'Prof. S. C. Gupta' },
      { code: 'CE605P', name: 'Transportation Engineering Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. S. C. Gupta' }
    ],
    '7th Sem': [
      { code: 'CE701', name: 'Bridge & Tunnel Engineering', credits: 4, type: 'Theory', faculty: 'Prof. V. K. Singh' },
      { code: 'CE702', name: 'Construction Management & Estimation', credits: 3, type: 'Theory', faculty: 'Prof. S. C. Gupta' },
      { code: 'CE703', name: 'Advanced Transportation & Airport Engg', credits: 3, type: 'Theory', faculty: 'Prof. V. K. Singh' },
      { code: 'CE704P', name: 'Major Project Phase-I', credits: 3, type: 'Practical', faculty: 'Prof. S. C. Gupta' },
      { code: 'CE705', name: 'Industrial Internship & Site Training', credits: 2, type: 'Practical', faculty: 'Prof. V. K. Singh' }
    ],
    '8th Sem': [
      { code: 'CE801', name: 'Earthquake Resistant Structural Design', credits: 4, type: 'Theory', faculty: 'Prof. V. K. Singh' },
      { code: 'CE802', name: 'Ground Improvement & Geosynthetics', credits: 3, type: 'Theory', faculty: 'Prof. S. C. Gupta' },
      { code: 'CE803P', name: 'Major Project Phase-II & Final Defense', credits: 8, type: 'Practical', faculty: 'Prof. S. C. Gupta' },
      { code: 'CE804', name: 'Comprehensive Technical Seminar', credits: 2, type: 'Practical', faculty: 'Prof. V. K. Singh' }
    ]
  },

  // Electrical Engineering (EE)
  EE: {
    '1st Sem': 'COMMON_SEM1',
    '2nd Sem': 'COMMON_SEM2',
    '3rd Sem': [
      { code: 'EE301', name: 'Electric Circuit Analysis & Networks', credits: 4, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'EE302', name: 'Electrical Machines - I (Transformers & DC)', credits: 4, type: 'Theory', faculty: 'Prof. R. P. Yadav' },
      { code: 'EE303', name: 'Electromagnetic Field Theory', credits: 3, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'EE304', name: 'Analog Electronics & Applications', credits: 4, type: 'Theory', faculty: 'Prof. R. P. Yadav' },
      { code: 'EE305P', name: 'Electrical Machines Lab - I', credits: 1.5, type: 'Practical', faculty: 'Prof. R. P. Yadav' },
      { code: 'EE306P', name: 'Analog Electronics Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. Manish Kumar' }
    ],
    '4th Sem': [
      { code: 'EE401', name: 'Electrical Machines - II (AC Machines)', credits: 4, type: 'Theory', faculty: 'Prof. R. P. Yadav' },
      { code: 'EE402', name: 'Digital Electronics & Microprocessors', credits: 4, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'EE403', name: 'Signals and Linear Systems', credits: 3, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'EE404', name: 'Power Systems - I (Generation & Transmission)', credits: 4, type: 'Theory', faculty: 'Prof. R. P. Yadav' },
      { code: 'EE405P', name: 'Electrical Machines Lab - II', credits: 1.5, type: 'Practical', faculty: 'Prof. R. P. Yadav' },
      { code: 'EE406P', name: 'Microprocessor & Interfacing Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. Manish Kumar' }
    ],
    '5th Sem': [
      { code: 'EE501', name: 'Power Electronics Devices & Converters', credits: 4, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'EE502', name: 'Power Systems - II (Analysis & Operation)', credits: 4, type: 'Theory', faculty: 'Prof. R. P. Yadav' },
      { code: 'EE503', name: 'Control Systems Engineering', credits: 4, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'EE504', name: 'Microcontrollers & Embedded Applications', credits: 3, type: 'Theory', faculty: 'Prof. R. P. Yadav' },
      { code: 'EE505P', name: 'Power Electronics Laboratory', credits: 1.5, type: 'Practical', faculty: 'Prof. Manish Kumar' },
      { code: 'EE506P', name: 'Control Systems Laboratory', credits: 1.5, type: 'Practical', faculty: 'Prof. R. P. Yadav' }
    ],
    '6th Sem': [
      { code: 'EE601', name: 'Power System Protection & Switchgear', credits: 4, type: 'Theory', faculty: 'Prof. R. P. Yadav' },
      { code: 'EE602', name: 'Electric Drives and Control', credits: 4, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'EE603', name: 'Renewable & Distributed Energy Systems', credits: 3, type: 'Theory', faculty: 'Prof. R. P. Yadav' },
      { code: 'EE604', name: 'Digital Signal Processing in Power Engg', credits: 3, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'EE605P', name: 'Power System Protection Lab', credits: 1.5, type: 'Practical', faculty: 'Prof. R. P. Yadav' }
    ],
    '7th Sem': [
      { code: 'EE701', name: 'High Voltage Engineering & Testing', credits: 4, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'EE702', name: 'Smart Grid Technologies & IoT', credits: 3, type: 'Theory', faculty: 'Prof. R. P. Yadav' },
      { code: 'EE703', name: 'Energy Conservation, Audit & Management', credits: 3, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'EE704P', name: 'Major Project Phase-I', credits: 3, type: 'Practical', faculty: 'Prof. Manish Kumar' },
      { code: 'EE705', name: 'Industrial Internship & Training', credits: 2, type: 'Practical', faculty: 'Prof. R. P. Yadav' }
    ],
    '8th Sem': [
      { code: 'EE801', name: 'Electric Traction & Industrial Utilization', credits: 4, type: 'Theory', faculty: 'Prof. R. P. Yadav' },
      { code: 'EE802', name: 'FACTS & HVDC Transmission Systems', credits: 3, type: 'Theory', faculty: 'Prof. Manish Kumar' },
      { code: 'EE803P', name: 'Major Project Phase-II & Defense', credits: 8, type: 'Practical', faculty: 'Prof. Manish Kumar' },
      { code: 'EE804', name: 'Comprehensive Technical Seminar', credits: 2, type: 'Practical', faculty: 'Prof. R. P. Yadav' }
    ]
  }
};

// Branch code normalizer
export function normalizeBranch(branchStr) {
  if (!branchStr) return 'CSE';
  const upper = String(branchStr).toUpperCase().trim();
  if (upper.includes('COMP') || upper.includes('CSE') || upper.includes('CS')) return 'CSE';
  if (upper.includes('MECH') || upper.includes('ME')) return 'ME';
  if (upper.includes('CIVIL') || upper.includes('CE')) return 'CE';
  if (upper.includes('ELECT') || upper.includes('EE') || upper.includes('EEE')) return 'EE';
  return 'CSE';
}

// Semester string normalizer
export function normalizeSemester(semStr) {
  if (!semStr) return '1st Sem';
  const str = String(semStr).trim();
  const digitMatch = str.match(/([1-8])/);
  if (digitMatch) {
    const d = digitMatch[1];
    const suffix = d === '1' ? 'st' : d === '2' ? 'nd' : d === '3' ? 'rd' : 'th';
    return d + suffix + ' Sem';
  }
  return '1st Sem';
}

// Returns full curriculum subject list for a student
export function getCurriculumSubjects(branch, semester) {
  const bCode = normalizeBranch(branch);
  const sem = normalizeSemester(semester);

  const branchCatalog = CURRICULUM_CATALOG[bCode] || CURRICULUM_CATALOG.CSE;
  let rawList = branchCatalog[sem];

  if (typeof rawList === 'string' && CURRICULUM_CATALOG[rawList]) {
    rawList = CURRICULUM_CATALOG[rawList];
  }

  if (!Array.isArray(rawList) || rawList.length === 0) {
    rawList = CURRICULUM_CATALOG.COMMON_SEM1;
  }

  return rawList.map(item => ({
    code: item.code,
    name: item.name,
    credits: item.credits || 3,
    type: item.type || 'Theory',
    faculty: item.faculty || 'Subject Teacher',
    totalClasses: 0,
    attendedClasses: 0,
    internalMarks: {
      midTerm: 0,
      assignment: 0,
      sessional: 0
    }
  }));
}

// Assigned courses for a teacher/HOD
export function getTeacherAssignedSubjects(facultyUser) {
  const role = facultyUser?.role || 'faculty';
  const email = (facultyUser?.email || '').toLowerCase();
  const name = facultyUser?.name || '';
  const dept = (facultyUser?.department || '').toLowerCase();
  const branchCode = (facultyUser?.branchCode || '').toUpperCase();

  const isHod = role === 'hod' || email.includes('hod');
  const isEE = branchCode === 'EE' || dept.includes('electrical') || email.includes('dr.vineet') || email.includes('.ee@');
  const isME = branchCode === 'ME' || dept.includes('mechanical') || email.includes('dr.shivam') || email.includes('.me@');
  const isCE = branchCode === 'CE' || dept.includes('civil') || email.includes('dr.manish') || email.includes('.ce@');

  // Electrical Engineering
  if (isEE) {
    if (isHod || email.includes('dr.vineet') || name.includes('Vineet')) {
      return [
        { code: 'EE501', name: 'Power Electronics Devices & Converters', semester: '5th Sem', branch: 'EE', role: 'HOD / Subject In-Charge' },
        { code: 'EE502', name: 'Power Systems - II (Analysis & Operation)', semester: '5th Sem', branch: 'EE', role: 'HOD Oversight' },
        { code: 'EE503', name: 'Control Systems Engineering', semester: '5th Sem', branch: 'EE', role: 'Theory Teacher' },
        { code: 'EE505P', name: 'Power Electronics Laboratory', semester: '5th Sem', branch: 'EE', role: 'Lab In-Charge' },
        { code: 'EE301', name: 'Electric Circuit Analysis & Networks', semester: '3rd Sem', branch: 'EE', role: 'Subject In-Charge' }
      ];
    }
    return [
      { code: 'EE501', name: 'Power Electronics Devices & Converters', semester: '5th Sem', branch: 'EE', role: 'Course Instructor' },
      { code: 'EE503', name: 'Control Systems Engineering', semester: '5th Sem', branch: 'EE', role: 'Course Instructor' },
      { code: 'EE505P', name: 'Power Electronics Laboratory', semester: '5th Sem', branch: 'EE', role: 'Lab Instructor' }
    ];
  }

  // Mechanical Engineering
  if (isME) {
    if (isHod || email.includes('dr.shivam') || name.includes('Shivam')) {
      return [
        { code: 'ME501', name: 'Dynamics of Machinery & Vibrations', semester: '5th Sem', branch: 'ME', role: 'HOD / Subject In-Charge' },
        { code: 'ME502', name: 'Machine Design - I', semester: '5th Sem', branch: 'ME', role: 'HOD Oversight' },
        { code: 'ME503', name: 'Internal Combustion Engines & Gas Turbines', semester: '5th Sem', branch: 'ME', role: 'Theory Teacher' },
        { code: 'ME505P', name: 'Dynamics & Vibration Lab', semester: '5th Sem', branch: 'ME', role: 'Lab In-Charge' },
        { code: 'ME304', name: 'Fluid Mechanics & Machinery', semester: '3rd Sem', branch: 'ME', role: 'Subject In-Charge' }
      ];
    }
    return [
      { code: 'ME501', name: 'Dynamics of Machinery & Vibrations', semester: '5th Sem', branch: 'ME', role: 'Course Instructor' },
      { code: 'ME503', name: 'Internal Combustion Engines & Gas Turbines', semester: '5th Sem', branch: 'ME', role: 'Course Instructor' },
      { code: 'ME505P', name: 'Dynamics & Vibration Lab', semester: '5th Sem', branch: 'ME', role: 'Lab Instructor' }
    ];
  }

  // Civil Engineering
  if (isCE) {
    if (isHod || email.includes('dr.manish') || name.includes('Manish')) {
      return [
        { code: 'CE501', name: 'Design of Reinforced Concrete Structures', semester: '5th Sem', branch: 'CE', role: 'HOD / Subject In-Charge' },
        { code: 'CE502', name: 'Structural Analysis - II', semester: '5th Sem', branch: 'CE', role: 'HOD Oversight' },
        { code: 'CE503', name: 'Geotechnical Engineering - II (Foundations)', semester: '5th Sem', branch: 'CE', role: 'Theory Teacher' },
        { code: 'CE505P', name: 'Structural CAD & RC Detailing Lab', semester: '5th Sem', branch: 'CE', role: 'Lab In-Charge' },
        { code: 'CE301', name: 'Surveying & Geomatics', semester: '3rd Sem', branch: 'CE', role: 'Subject In-Charge' }
      ];
    }
    return [
      { code: 'CE501', name: 'Design of Reinforced Concrete Structures', semester: '5th Sem', branch: 'CE', role: 'Course Instructor' },
      { code: 'CE503', name: 'Geotechnical Engineering - II (Foundations)', semester: '5th Sem', branch: 'CE', role: 'Course Instructor' },
      { code: 'CE505P', name: 'Structural CAD & RC Detailing Lab', semester: '5th Sem', branch: 'CE', role: 'Lab Instructor' }
    ];
  }

  // Computer Science & Engineering (Default)
  const isOS = email.includes('amit.sharma') || name.includes('Amit Sharma');
  const isDAA = email.includes('priya') || name.includes('Priya');

  if (isOS) {
    return [
      { code: 'CS502', name: 'Operating Systems & System Programming', semester: '5th Sem', branch: 'CSE', role: 'Primary Subject Teacher' },
      { code: 'CS506P', name: 'OS & Linux Shell Laboratory', semester: '5th Sem', branch: 'CSE', role: 'Lab Practical Teacher' },
      { code: 'CS403', name: 'Operating Systems Principles', semester: '4th Sem', branch: 'CSE', role: 'Theory Teacher' }
    ];
  }

  if (isDAA) {
    return [
      { code: 'CS504', name: 'Design & Analysis of Algorithms', semester: '5th Sem', branch: 'CSE', role: 'Primary Subject Teacher' },
      { code: 'CS507P', name: 'Algorithms & Competitive Programming Lab', semester: '5th Sem', branch: 'CSE', role: 'Lab Practical Teacher' },
      { code: 'CS301', name: 'Data Structures & Algorithms', semester: '3rd Sem', branch: 'CSE', role: 'Theory Teacher' }
    ];
  }

  if (isHod || email.includes('dr.bhawesh') || name.includes('Bhawesh') || email.includes('akverma')) {
    return [
      { code: 'CS501', name: 'Database Management Systems', semester: '5th Sem', branch: 'CSE', role: 'HOD / Subject In-Charge' },
      { code: 'CS505P', name: 'DBMS & SQL Laboratory', semester: '5th Sem', branch: 'CSE', role: 'Lab In-Charge' },
      { code: 'CS502', name: 'Operating Systems & System Programming', semester: '5th Sem', branch: 'CSE', role: 'HOD Oversight' },
      { code: 'CS504', name: 'Design & Analysis of Algorithms', semester: '5th Sem', branch: 'CSE', role: 'HOD Oversight' },
      { code: 'CS303', name: 'Object Oriented Programming with C++', semester: '3rd Sem', branch: 'CSE', role: 'Subject In-Charge' }
    ];
  }

  // Default for other faculty
  return [
    { code: 'CS501', name: 'Database Management Systems', semester: '5th Sem', branch: 'CSE', role: 'Course Instructor' },
    { code: 'CS502', name: 'Operating Systems & System Programming', semester: '5th Sem', branch: 'CSE', role: 'Course Instructor' }
  ];
}

// Official JUT Grade scale: internal evaluation out of 50
export function calculateSubjectGrade(internalMarks) {
  if (!internalMarks) return { grade: 'Pending', gradePoints: 0, isAssessed: false };

  const mid = Number(internalMarks.midTerm) || 0;
  const asg = Number(internalMarks.assignment) || 0;
  const ses = Number(internalMarks.sessional) || 0;
  const total = mid + asg + ses;

  if (total === 0) {
    return { grade: 'Pending', gradePoints: 0, total, isAssessed: false };
  }

  if (total >= 45) return { grade: 'A+', gradePoints: 10, total, isAssessed: true };
  if (total >= 40) return { grade: 'A', gradePoints: 9, total, isAssessed: true };
  if (total >= 35) return { grade: 'B+', gradePoints: 8, total, isAssessed: true };
  if (total >= 30) return { grade: 'B', gradePoints: 7, total, isAssessed: true };
  if (total >= 25) return { grade: 'C', gradePoints: 6, total, isAssessed: true };
  if (total >= 20) return { grade: 'P', gradePoints: 5, total, isAssessed: true };
  return { grade: 'F', gradePoints: 0, total, isAssessed: true };
}

// Calculate credit-weighted SGPA
export function calculateSGPA(subjects) {
  if (!Array.isArray(subjects) || subjects.length === 0) return 'Pending';

  let totalCreditPoints = 0;
  let assessedCredits = 0;

  for (const sub of subjects) {
    const evaluation = calculateSubjectGrade(sub.internalMarks);
    if (evaluation.isAssessed) {
      const cr = Number(sub.credits) || 3;
      totalCreditPoints += (evaluation.gradePoints * cr);
      assessedCredits += cr;
    }
  }

  if (assessedCredits === 0) return 'Pending';
  return (totalCreditPoints / assessedCredits).toFixed(2);
}

// Calculate overall attendance with zero-division guard
export function calculateOverallAttendance(subjects) {
  if (!Array.isArray(subjects) || subjects.length === 0) return 0;
  const total = subjects.reduce((sum, s) => sum + (Number(s.totalClasses) || 0), 0);
  const attended = subjects.reduce((sum, s) => sum + (Number(s.attendedClasses) || 0), 0);
  if (total <= 0) return 0;
  return Math.round((attended / total) * 100);
}

// Get sequential next semester in academic sequence
export function getNextSemester(currentSemester) {
  const clean = normalizeSemester(currentSemester);
  const idx = SEMESTERS.indexOf(clean);
  if (idx !== -1 && idx < SEMESTERS.length - 1) {
    return SEMESTERS[idx + 1];
  }
  if (idx === SEMESTERS.length - 1) {
    return 'Graduated';
  }
  return null;
}

// Check semester pass status according to JUT curriculum regulations
export function checkSemesterPassStatus(subjects) {
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return { passed: false, isPending: false, reason: 'No enrolled subjects found.' };
  }

  let assessedCount = 0;
  const failedSubjects = [];
  const pendingSubjects = [];

  for (const sub of subjects) {
    const evaluation = calculateSubjectGrade(sub.internalMarks);
    if (!evaluation.isAssessed) {
      pendingSubjects.push(sub.code || sub.name);
    } else {
      assessedCount++;
      if (evaluation.grade === 'F') {
        failedSubjects.push({
          code: sub.code,
          name: sub.name,
          score: evaluation.total
        });
      }
    }
  }

  const sgpaStr = calculateSGPA(subjects);
  const sgpa = parseFloat(sgpaStr);

  // If any subject is not yet assessed by faculty
  if (pendingSubjects.length > 0) {
    return {
      passed: false,
      isPending: true,
      pendingCount: pendingSubjects.length,
      pendingSubjects,
      sgpa: isNaN(sgpa) ? 'Pending' : sgpa,
      reason: `Evaluation pending for ${pendingSubjects.length} subjects: ${pendingSubjects.join(', ')}. Faculty assessment required.`
    };
  }

  // If any subject has F grade (score < 20 out of 50)
  if (failedSubjects.length > 0) {
    const names = failedSubjects.map(f => `${f.code} (${f.score}/50)`).join(', ');
    return {
      passed: false,
      isPending: false,
      hasBacklog: true,
      failedSubjects,
      sgpa: isNaN(sgpa) ? 0 : sgpa,
      reason: `Backlog detected in ${failedSubjects.length} subject(s): ${names}. Minimum 20 marks required in each subject.`
    };
  }

  // If SGPA is below 5.0
  if (isNaN(sgpa) || sgpa < 5.0) {
    return {
      passed: false,
      isPending: false,
      sgpa: isNaN(sgpa) ? 0 : sgpa,
      reason: `SGPA is ${sgpaStr}, which is below the JUT minimum qualifying standard of 5.0.`
    };
  }

  return {
    passed: true,
    isPending: false,
    hasBacklog: false,
    sgpa,
    totalSubjects: subjects.length,
    message: `All ${subjects.length} subjects successfully cleared with SGPA ${sgpa.toFixed(2)}!`
  };
}
