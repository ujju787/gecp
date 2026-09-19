// Intelligent Knowledge Base for "Palamu Mitra" - Official GEC Palamu AI Assistant

export const QUICK_PROMPTS = [
  "How to get admission in B.Tech?",
  "Hostel facilities and room allotment",
  "Fee structure for B.Tech & Semester dues",
  "How to reach Lesliganj campus?",
  "e-Kalyan Jharkhand Scholarship process",
  "Contact numbers & Principal office"
];

export const BOT_KNOWLEDGE_BASE = [
  {
    keywords: ["admission", "admissions", "jceceb", "jee", "counseling", "counselling", "cutoff", "eligibility"],
    title: "B.Tech Admissions Procedure",
    reply: `Government Engineering College, Palamu conducts B.Tech admissions primarily through **JCECEB (Jharkhand Combined Entrance Competitive Examination Board)** based on **JEE (Main)** merit ranks.

**Key Steps:**
1. Appear in JEE (Main) examination.
2. Register for JCECEB State Merit List on https://jceceb.jharkhand.gov.in.
3. Participate in online choice filling; select **Government Engineering College, Palamu** and your preferred branch (CSE, ME, CE, EE).
4. Upon seat allotment, report to GEC Palamu campus (Lesliganj) with original documents:
   - Allotment Letter & JEE Admit/Rank Card
   - 10th & 12th Marksheets & Passing Certificates
   - Residential (Domicile) & Caste Certificate (issued by SDO/CO Jharkhand)
   - TC, Migration & Character Certificates
   - Medical Fitness Certificate & Passport photos

*Note: Lateral entry (Diploma to 2nd Year) is conducted through JCECEB DECE (LE).*`
  },
  {
    keywords: ["hostel", "room", "mess", "boarding", "residence", "stay"],
    title: "Hostel Facilities & Allotment",
    reply: `GEC Palamu provides well-equipped on-campus residential facilities for both boys and girls:
- **Boys Hostel**: Birsa Munda Boys Hostel (Block A & B)
- **Girls Hostel**: Rani Gaidinliu Girls Hostel (Gated with 24x7 security & female warden)

**Hostel Features:**
- Furnished rooms with bed, study table, chair, and wardrobe
- High-speed Wi-Fi and 24x7 power backup
- Hygenic mess serving vegetarian & nutritious meals
- Recreation room, table tennis, badminton court, and gymnasium
- **Hostel Mess Charge**: Approx. ₹2,000 - ₹2,500/month (Managed on cooperative basis)
- Allotment is done merit-cum-distance wise post-admission.`
  },
  {
    keywords: ["fee", "fees", "payment", "cost", "semester fee", "tuition", "challan"],
    title: "Fee Structure & Payment",
    reply: `As a Government Engineering College under the Dept. of Higher & Technical Education, Government of Jharkhand, fees are highly subsidized:

- **Tuition Fee**: Approx. ₹15,000 - ₹25,000 per year (Category-wise concessions as per Govt. norms).
- **University Registration & Exam Fee (JUT)**: Approx. ₹2,400 per semester.
- **Hostel Rent**: Subsidized government nominal seat rent.
- **Payment Portal**: You can pay semester fees, exam fees, and hostel dues directly via our **Online Fee Payment Gateway** tab with instant stamped receipt download.`
  },
  {
    keywords: ["reach", "route", "address", "location", "station", "bus", "travel", "lesliganj", "daltonganj", "medininagar"],
    title: "Campus Location & How to Reach",
    reply: `**Address:** Government Engineering College, Post: Lesliganj, Medininagar, Palamu District, Jharkhand - 822118.

**How to Reach:**
- **By Train:** The nearest major railway station is **Daltonganj (DTO)**, about 22 km away, well-connected to Ranchi, Patna, Varanasi, and Delhi.
- **By Road:** From Daltonganj / Medininagar bus stand, frequent buses, autos, and shared vehicles are readily available directly to Lesliganj (approx. 35 mins journey).
- **By Air:** Nearest airport is **Birsa Munda Airport, Ranchi (IXR)** (~185 km), connected via direct express buses and trains to Daltonganj.`
  },
  {
    keywords: ["scholarship", "ekalyan", "e-kalyan", "financial aid", "concession", "st", "sc", "obc"],
    title: "Scholarship & Financial Aid",
    reply: `Eligible students can avail the following state and central scholarships:
1. **e-Kalyan Jharkhand Scholarship:** For SC, ST, and BC/OBC students of Jharkhand state whose family income conforms to government limits. Reimburses tuition fees and maintenance allowances.
2. **AICTE Pragati & Saksham Scholarship:** For meritorious girl students and differently-abled students.
3. **National Scholarship Portal (NSP):** Central minority, post-matric, and central sector schemes.
4. **Student Credit Card / Bank Loans:** Education loan facilitation desk by SBI & Canara Bank on campus.`
  },
  {
    keywords: ["cse", "computer science", "syllabus", "programming", "labs"],
    title: "Computer Science & Engineering (CSE)",
    reply: `The **CSE Department** at GEC Palamu has an approved intake of 60 seats per batch.
- **HOD:** Dr. A. K. Verma
- **Curriculum:** Follows Jharkhand University of Technology (JUT) AICTE Model Curriculum.
- **Core Topics:** Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks, AI/ML, Cloud Computing, Cyber Security.
- **Laboratories:** High-performance systems with gigabit LAN, GPU workstations, and open-source software stack.
- Check the **Digital Library** section on this website to view and download complete syllabus and lecture notes.`
  },
  {
    keywords: ["contact", "phone", "email", "principal", "helpline", "women helpline", "ragging"],
    title: "Official Contacts & Grievance Desks",
    reply: `**Official Contact Directory:**
- **Principal:** Dr. Sanjay Kumar Singh
- **Email:** gecp.academic@gmail.com
- **Phone:** +91 94311 02845
- **24x7 Women Safety Helpline:** 181 / +91 94311 02846
- **Anti-Ragging National Toll Free:** 1800-180-5522
- **Training & Placement Cell:** placement@gecpalamu.ac.in
- **Address:** Lesliganj, Medininagar, Palamu - 822118`
  },
  {
    keywords: ["placement", "package", "recruitment", "companies", "t&p", "tpo", "jobs", "internship"],
    title: "Training & Placement Highlights",
    reply: `GEC Palamu boasts an active Training & Placement (T&P) Cell:
- **Highest Offer:** ₹9.5 LPA
- **Average CTC:** ₹5.4 LPA
- **Placement Rate:** 88.2%
- **Top Recruiters:** Yash India Pvt. Ltd., Tata Consultancy Services (TCS), Infosys
- Check our dedicated **T&P Cell Portal** tab on this site to view upcoming campus recruitment drives and apply for live industrial internships!`
  }
];

export function queryChatbot(userQuery) {
  const q = userQuery.toLowerCase().trim();
  
  // Direct greetings
  if (q === "hi" || q === "hello" || q === "hey" || q === "namaste" || q === "pranam") {
    return {
      title: "Namaste! Welcome to GEC Palamu Helpdesk",
      reply: "Hello! I am **Palamu Mitra**, the official virtual assistant of Government Engineering College, Palamu. How can I help you today? You can ask me about B.Tech admissions, hostel allotment, fee payments, library resources, placements, or campus directions."
    };
  }

  // Search knowledge base
  for (const item of BOT_KNOWLEDGE_BASE) {
    const match = item.keywords.some(kw => q.includes(kw));
    if (match) {
      return item;
    }
  }

  // Intelligent fallback with helpful guidance
  return {
    title: "Information Query",
    reply: `Thank you for asking! Government Engineering College, Palamu (GEC Palamu) is an AICTE-approved premier institution in Lesliganj, Palamu, affiliated to Jharkhand University of Technology (JUT).

For specific details, feel free to ask about:
- **"B.Tech Admissions & JCECEB"**
- **"Hostel facilities & fees"**
- **"Online Fee Payment"**
- **"CSE, ME, CE, EE syllabus"**
- **"Placements & Recruiters"**
- **"Principal contact & address"**

You can also reach the college academic section directly at **gecp.academic@gmail.com** or call **+91 94311 02845**.`
  };
}
