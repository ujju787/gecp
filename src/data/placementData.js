// Training & Placement (T&P) Cell Data for GEC Palamu

export const PLACEMENT_STATS = {
  highestPackage: "9.5 LPA",
  averagePackage: "5.4 LPA",
  medianPackage: "4.8 LPA",
  placementRate: "88.2%",
  totalOffers: "105+",
  visitingCompanies: "3 Companies",
  branchStats: [
    { branch: "Computer Science & Engg", placed: 92, avgPackage: "6.2 LPA", highest: "9.5 LPA" },
    { branch: "Mechanical Engineering", placed: 84, avgPackage: "5.0 LPA", highest: "6.5 LPA" },
    { branch: "Electrical Engineering", placed: 86, avgPackage: "5.2 LPA", highest: "7.2 LPA" },
    { branch: "Civil Engineering", placed: 80, avgPackage: "4.8 LPA", highest: "6.5 LPA" }
  ]
};

export const UPCOMING_DRIVES = [
  {
    id: "drv-yash",
    company: "Yash India Pvt. Ltd.",
    logoText: "YASH",
    color: "bg-emerald-600",
    role: "Graduate Engineer Trainee (Core & Systems)",
    package: "₹4.8 LPA - ₹6.5 LPA",
    eligibility: "B.Tech All Branches (CSE, EE, ME, CE) - Min 60%",
    location: "Ranchi / Jamshedpur / Pan India",
    driveDate: "2026-10-12",
    registrationDeadline: "2026-10-04",
    mode: "On-Campus Drive (Aptitude + Technical + HR)",
    type: "Full-Time",
    openPositions: 30,
    description: "Yash India Pvt. Ltd. visits GEC Palamu for graduate engineering roles across core manufacturing, plant automation, infrastructure, and technical operations."
  },
  {
    id: "drv-tcs",
    company: "Tata Consultancy Services (TCS)",
    logoText: "TCS",
    color: "bg-indigo-600",
    role: "Assistant System Engineer (Ninja & Digital)",
    package: "₹3.6 LPA (Ninja) / ₹7.2 LPA (Digital)",
    eligibility: "All B.Tech Branches (CSE, EE, ME, CE) with CGPA >= 6.0",
    location: "Pan India (Kolkata, Bangalore, Pune, Hyderabad)",
    driveDate: "2026-10-20",
    registrationDeadline: "2026-10-10",
    mode: "National Qualifier Test (NQT) + Interview",
    type: "Full-Time",
    openPositions: 40,
    description: "National recruitment drive for digital engineering, enterprise cloud solutions, software development, and system architecture."
  },
  {
    id: "drv-infosys",
    company: "Infosys",
    logoText: "INFY",
    color: "bg-blue-600",
    role: "Systems Engineer & Specialist Programmer",
    package: "₹4.0 LPA (SE) / ₹9.5 LPA (Specialist Programmer)",
    eligibility: "B.Tech All Branches (CSE, EE, ME, CE), No Active Backlogs",
    location: "Bangalore / Mysore / Bhubaneswar / Pune",
    driveDate: "2026-10-28",
    registrationDeadline: "2026-10-18",
    mode: "InfyTQ / Campus Assessment + Interview",
    type: "Full-Time",
    openPositions: 35,
    description: "Global IT consulting and digital services pioneer recruiting talented engineers for digital transformation, cloud architecture, and AI software engineering."
  }
];

export const LIVE_INTERNSHIPS = [
  {
    id: "int-yash",
    company: "Yash India Pvt. Ltd.",
    role: "Industrial Engineering & Operations Trainee Intern",
    stipend: "₹12,000 / month",
    duration: "2 Months (Nov - Dec 2026)",
    branches: ["ME", "EE", "CE", "CSE"],
    deadline: "2026-10-05",
    location: "Ranchi / Jamshedpur / Industrial Sites",
    applyStatus: "Open"
  },
  {
    id: "int-tcs",
    company: "Tata Consultancy Services (TCS)",
    role: "TCS iON Remote Digital Trainee Intern",
    stipend: "₹15,000 / month",
    duration: "3 Months (Virtual)",
    branches: ["CSE", "EE"],
    deadline: "2026-10-08",
    location: "Remote / Hybrid",
    applyStatus: "Open"
  },
  {
    id: "int-infosys",
    company: "Infosys",
    role: "Infosys Springboard Project Intern",
    stipend: "₹14,000 / month",
    duration: "2.5 Months",
    branches: ["CSE", "EE", "ME", "CE"],
    deadline: "2026-10-12",
    location: "Remote",
    applyStatus: "Open"
  }
];

export const RECRUITERS = [
  { name: "Yash India Pvt. Ltd.", category: "Engineering & Industrial Solutions" },
  { name: "Tata Consultancy Services (TCS)", category: "IT, Consulting & Cloud Solutions" },
  { name: "Infosys", category: "Digital Services & Enterprise Tech" }
];
