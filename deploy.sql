-- MySQL dump 10.13  Distrib 9.4.0, for Win64 (x86_64)
--
-- Host: localhost    Database: gec_palamu
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendance_records`
--

DROP TABLE IF EXISTS `attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_records` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentId` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rollNo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subjectCode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subjectName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sessionTime` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verifiedVia` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `facultyId` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_att_student` (`studentId`),
  KEY `idx_att_roll` (`rollNo`),
  KEY `idx_att_subject` (`subjectCode`),
  KEY `idx_att_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_records`
--

LOCK TABLES `attendance_records` WRITE;
/*!40000 ALTER TABLE `attendance_records` DISABLE KEYS */;
INSERT INTO `attendance_records` VALUES ('att-1789793413925-nbs3lr','usr-std-469866','25CSD010','ujjwal kumar','CS502','Operating Systems & System Programming','2026-09-19','10:20 AM','MANUAL_FACULTY_MARK','usr-teacher-01','PRESENT','2026-09-19T04:50:13.920Z');
/*!40000 ALTER TABLE `attendance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campus_events`
--

DROP TABLE IF EXISTS `campus_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campus_events` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tagline` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `badge` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `time` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `venue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prizePool` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `teamSize` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registrationDeadline` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Open',
  `tracks` text COLLATE utf8mb4_unicode_ci,
  `rules` text COLLATE utf8mb4_unicode_ci,
  `organizerName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdBy` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_evt_date` (`date`),
  KEY `idx_evt_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campus_events`
--

LOCK TABLES `campus_events` WRITE;
/*!40000 ALTER TABLE `campus_events` DISABLE KEYS */;
INSERT INTO `campus_events` VALUES ('evt-517518-962','Cyber Security & Cloud Defense 2026','','Workshop','New Event','2026-11-05','10:30 AM - 03:30 PM','Seminar Hall 1, GEC Palamu','Certificate of Merit','Solo','2026-10-30','Open','[]','[]','Department of CSE, GEC Palamu','Dr. A. K. Verma (HOD CSE)','2026-09-19T05:41:57.518Z'),('evt-891238-986','hackArena','code for campus','Hackathon','department Event','2026-11-10','09:30 AM onwards','Main Computing Center & Central Auditorium, GEC Palamu','₹25,000 Cash + Certificates','2 - 4 Members','2026-11-01','Open','[\"AI & Machine Learning\",\"Cyber Security & Cloud\",\"IoT & Embedded Systems\",\"Open Innovation\"]','[\"Valid College ID card mandatory.\",\"All participants must register before the deadline.\"]','HOD Dr. A. K. Verma & Department of CSE','usr-fac-01','2026-09-19T05:48:11.238Z'),('evt-ai-workshop','National Workshop on Applied GenAI & LLMs in Engineering','Hands-on Masterclass with Google & Industry ML Architects','Workshop','Certification','2026-09-27','02:00 PM - 05:30 PM','Smart Classroom Hall 1 & Online Hybrid','Certificate of Excellence + Free Cloud Labs','Solo Participant','2026-09-24','Filling Fast','[\"Prompt Engineering & Vector Databases\",\"Building Agentic AI Systems\",\"Deploying Deep Learning models to Cloud Endpoints\"]','[\"Laptop with Python installed recommended.\",\"Free registration for all GEC Palamu students.\"]','HOD CSE & Google Cloud Community','usr-fac-akverma','2026-09-19T05:34:56.979Z'),('evt-techkriti-2026','TechKriti 2026 - Annual Techno-Management Fest','Igniting Engineering Innovations Across Jharkhand','Tech-Fest','State-Level','2026-11-04','10:00 AM - 07:00 PM (3 Days)','GEC Palamu Central Campus Grounds','₹1,50,000 Cash Prizes','Individual / Team up to 5','2026-10-25','Open','[\"RoboWar & Line Follower Bot Sprint\",\"Bridge-O-Mania (Civil Structural Modelling)\",\"Cad-A-Thon (Mechanical 3D Design)\",\"Web-Craft & Algorithmic Code Sprint\"]','[\"Open to all AICTE / UGC approved engineering colleges.\",\"Certificates signed by Technical Education Department & Principal GEC Palamu.\"]','Technical Club & Innovation Cell, GEC Palamu','usr-fac-akverma','2026-09-19T05:34:56.972Z'),('evt-utkarsh-cultural','Utkarsh 2026 - Annual Cultural & Literary Extravaganza','Celebrating Music, Drama, Art & Jharkhand\'s Heritage','Cultural','Grand Celebration','2026-12-12','04:00 PM onwards','Open Air Amphitheatre, GEC Palamu','Trophies + ₹60,000 Rewards','Solo & Group','2026-12-01','Upcoming','[\"Battle of the Bands (Rock & Folk Fusion)\",\"Chhau & Tribal Dance Invitational\",\"Slam Poetry & Parliamentary Debate\",\"Short Film Making & Photography Exhibition\"]','[\"Standard inter-college cultural guidelines apply.\",\"Participants must register before deadline.\"]','Student Affairs & Cultural Council, GEC Palamu','usr-fac-akverma','2026-09-19T05:34:56.986Z');
/*!40000 ALTER TABLE `campus_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_registrations`
--

DROP TABLE IF EXISTS `event_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_registrations` (
  `ticketId` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `eventId` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `eventTitle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentId` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rollNo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `semester` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `teamName` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leaderName` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leaderEmail` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `teamSize` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `track` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `venue` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'CONFIRMED',
  `createdAt` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`ticketId`),
  KEY `idx_reg_event` (`eventId`),
  KEY `idx_reg_student` (`studentId`),
  KEY `idx_reg_roll` (`rollNo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_registrations`
--

LOCK TABLES `event_registrations` WRITE;
/*!40000 ALTER TABLE `event_registrations` DISABLE KEYS */;
INSERT INTO `event_registrations` VALUES ('PASS-GECP-286716','evt-891238-986','hackArena','usr-std-981679','26CSE0002','abhay kumar','Computer Science & Engineering','1st Sem','tech thunder','abhay kumar','abhaykr@gmail.com','3','AI & Machine Learning','Main Computing Center & Central Auditorium, GEC Palamu','2026-11-10','CONFIRMED','2026-09-19T05:50:49.441Z'),('PASS-GECP-497257','evt-891238-986','hackArena','usr-std-469866','25CSD010','ujjwal kumar','Computer Science & Engineering','5th Sem','tech titans','ujjwal kumar','uk.mishr99@gmail.com','3','AI & Machine Learning','Main Computing Center & Central Auditorium, GEC Palamu','2026-11-10','CONFIRMED','2026-09-19T05:49:47.133Z'),('PASS-GECP-630227','evt-ai-workshop','National Workshop on Applied GenAI & LLMs in Engineering','usr-std-981679','26CSE0002','abhay kumar','Computer Science & Engineering','1st Sem','tech thunder','abhay kumar','abhaykr@gmail.com','3','Prompt Engineering & Vector Databases','Smart Classroom Hall 1 & Online Hybrid','2026-09-27','CONFIRMED','2026-09-19T05:51:04.633Z'),('PASS-GECP-761541','evt-517518-962','Campus Event','usr-std-01','25CS0001','Aarav Kumar','CSE','5th Sem','CyberGuardians','Aarav Kumar','aarav.kumar@gecpalamu.ac.in','1','Cloud Security Track','GEC Palamu Campus','2026-09-19','CONFIRMED','2026-09-19T05:41:57.702Z');
/*!40000 ALTER TABLE `event_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faculty_members`
--

DROP TABLE IF EXISTS `faculty_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_members` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branchCode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'faculty',
  `qualification` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialization` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experienceYears` int DEFAULT '5',
  `cabin` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` text COLLATE utf8mb4_unicode_ci,
  `joiningDate` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `createdAt` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_fac_dept` (`department`),
  KEY `idx_fac_branch` (`branchCode`),
  KEY `idx_fac_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faculty_members`
--

LOCK TABLES `faculty_members` WRITE;
/*!40000 ALTER TABLE `faculty_members` DISABLE KEYS */;
INSERT INTO `faculty_members` VALUES ('fac-ce-02','Prof. Vikash Kumar','vikash.ce@gecpalamu.ac.in','+91 94311 87245','Civil Engineering','CE','Assistant Professor (Hydraulics & Water Resources)','faculty','M.Tech in Water Resources (IIT BHU)','Hydrology, Water Resources & Environmental Engg',6,'Civil Engineering Block, Room C-205','https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=400','2021-11-01','ACTIVE','2026-09-19T06:11:58.244Z'),('fac-ce-03','Prof. Ananya Roy','ananya.ce@gecpalamu.ac.in','+91 94311 87246','Civil Engineering','CE','Assistant Professor (Surveying & Concrete Tech)','faculty','M.Tech in Structural Engineering (NIT Durgapur)','Geotechnical Soil Testing, Surveying & GIS',5,'Civil Engineering Block, Room C-208','https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=400','2022-09-15','ACTIVE','2026-09-19T06:11:58.258Z'),('fac-cse-02','Prof. Amit Sharma','amit.sharma@gecpalamu.ac.in','+91 94311 87212','Computer Science and Engineering','CSE','Assistant Professor (Subject Teacher - OS)','faculty','M.Tech in CSE (NIT Rourkela)','Operating Systems & Computer Networks',7,'Academic Block-A, Room 208','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400','2021-08-10','ACTIVE','2026-09-19T06:11:58.097Z'),('fac-cse-03','Prof. Priya Kumari','priya.faculty@gecpalamu.ac.in','+91 94311 87213','Computer Science and Engineering','CSE','Assistant Professor (Subject Teacher - DAA)','faculty','M.Tech in Software Engineering (BIT Mesra)','Design & Analysis of Algorithms, Data Science',6,'Academic Block-A, Room 210','https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400','2022-01-15','ACTIVE','2026-09-19T06:11:58.112Z'),('fac-cse-04','Prof. Rajesh Gupta','rajesh.gupta@gecpalamu.ac.in','+91 94311 87214','Computer Science and Engineering','CSE','Assistant Professor (Web Tech & DBMS)','faculty','M.Tech in CSE (IIT Patna)','Database Systems & Full Stack Development',5,'Academic Block-A, Room 212','https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400','2022-08-01','ACTIVE','2026-09-19T06:11:58.130Z'),('fac-ee-02','Prof. Neha Agarwal','neha.ee@gecpalamu.ac.in','+91 94311 87223','Electrical Engineering','EE','Assistant Professor (Control Systems)','faculty','M.Tech in Control & Instrumentation (IIT ISM)','Control Systems Engineering & Automation',6,'Academic Block-B, Room 112','https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400','2021-03-20','ACTIVE','2026-09-19T06:11:58.158Z'),('fac-ee-03','Prof. Alok Tiwari','alok.ee@gecpalamu.ac.in','+91 94311 87224','Electrical Engineering','EE','Assistant Professor (Power Electronics)','faculty','M.Tech in Power Electronics (NIT Calicut)','Electric Drives & Power Electronics Converters',7,'Academic Block-B, Room 115','https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400','2020-09-01','ACTIVE','2026-09-19T06:11:58.172Z'),('fac-hod-ce-01','Dr. Manish Ranjan','dr.manish@gecpalamu.ac.in','+91 94311 87244','Civil Engineering','CE','Head of Department & Associate Professor','hod','Ph.D. in Structural Engineering (IIT Patna), M.Tech (Civil)','Structural Dynamics, Earthquake Engg & Geotechnical Systems',12,'Civil Engineering Block, Room C-202','https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400','2019-08-20','ACTIVE','2026-09-19T06:11:58.228Z'),('fac-hod-cse-01','Dr. Bhawesh Kumar','dr.bhawesh@gecpalamu.ac.in','+91 94311 87211','Computer Science and Engineering','CSE','Head of Department & Associate Professor','hod','Ph.D. in Computer Science (IIT Dhanbad), M.Tech (CSE)','Distributed Computing, Cloud & AI Architectures',14,'Academic Block-A, Room 204','https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400','2018-07-15','ACTIVE','2026-09-19T06:11:58.074Z'),('fac-hod-ee-01','Dr. Vineet Shekhar','dr.vineet@gecpalamu.ac.in','+91 94311 87222','Electrical Engineering','EE','Head of Department & Associate Professor','hod','Ph.D. in Power Systems (NIT Jamshedpur), M.Tech (EE)','Smart Grids, Renewable Microgrids & Power Systems',13,'Academic Block-B, Room 108','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400','2019-01-10','ACTIVE','2026-09-19T06:11:58.145Z'),('fac-hod-me-01','Dr. Shivam Verma','dr.shivam@gecpalamu.ac.in','+91 94311 87233','Mechanical Engineering','ME','Head of Department & Associate Professor','hod','Ph.D. in Thermal Engineering (BIT Mesra), M.Tech (ME)','Thermal Engineering, Robotics & CAD/CAM',15,'Workshop Complex, Room M-101','https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400','2017-08-01','ACTIVE','2026-09-19T06:11:58.185Z'),('fac-me-02','Prof. Rahul Sinha','rahul.me@gecpalamu.ac.in','+91 94311 87234','Mechanical Engineering','ME','Assistant Professor (Fluid Mechanics)','faculty','M.Tech in Thermal & Fluids (IIT Roorkee)','Fluid Mechanics & Hydraulic Machinery',8,'Workshop Complex, Room M-105','https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400','2021-02-15','ACTIVE','2026-09-19T06:11:58.199Z'),('fac-me-03','Prof. Sunita Soren','sunita.me@gecpalamu.ac.in','+91 94311 87235','Mechanical Engineering','ME','Assistant Professor (Manufacturing Sciences)','faculty','M.Tech in Production Engineering (NIT Jamshedpur)','Manufacturing Processes & Materials',5,'Workshop Complex, Room M-108','https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400','2022-07-10','ACTIVE','2026-09-19T06:11:58.214Z');
/*!40000 ALTER TABLE `faculty_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_transactions`
--

DROP TABLE IF EXISTS `fee_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fee_transactions` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `refNo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentId` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rollNo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `regNo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branch` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `semester` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purpose` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `feeType` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` double NOT NULL,
  `concessionCategory` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentMode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `upiId` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT '6205482672@ptsbi',
  `utrNumber` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `merchantCode` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `securityHash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `time` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fee_ref` (`refNo`),
  KEY `idx_fee_student` (`studentId`),
  KEY `idx_fee_roll` (`rollNo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_transactions`
--

LOCK TABLES `fee_transactions` WRITE;
/*!40000 ALTER TABLE `fee_transactions` DISABLE KEYS */;
INSERT INTO `fee_transactions` VALUES ('TXN-GECP-166340','SBI-EPAY-11364911','usr-std-469866','ujjwal kumar','25CSD010','24021445010','Computer Science & Engineering','5th Sem','JUT End-Term Examination Fee (5th Sem)','exam',2400,'general','Online UPI (6205482672@ptsbi)','6205482672@ptsbi','12345679123','SUCCESS','Government Engineering College, Palamu','GECP-SBI-COLLECT-822118','SHA256-JGYYRBGY8E-MU6PRU2S','18 Sept 2026','02:16:06 pm','2026-09-18T08:46:06.340Z'),('TXN-GECP-232778','SBI-EPAY-69815730','usr-std-469866','ujjwal kumar','25CSD010','24021445010','Computer Science & Engineering','5th Sem','JUT End-Term Examination Fee (5th Sem)','exam',2400,'general','Online UPI (6205482672@ptsbi)','6205482672@ptsbi','636106106981','SUCCESS','Government Engineering College, Palamu','GECP-SBI-COLLECT-822118','SHA256-RUNOE5LWAR-MU6PT9CA','18 Sept 2026','02:17:12 pm','2026-09-18T08:47:12.778Z'),('TXN-GECP-388702','SBI-EPAY-13280438','usr-std-469866','ujjwal kumar','25CSD010','24021445010','Computer Science & Engineering','5th Sem','Hostel Rent & Mess Charges','hostel',6000,'general','Online UPI (6205482672@ptsbi)','6205482672@ptsbi','981479857754','SUCCESS','Government Engineering College, Palamu','GECP-SBI-COLLECT-822118','SHA256-NOQ2EAFK7O-MU7UZIE6','19 Sept 2026','09:29:48 am','2026-09-19T03:59:48.702Z'),('TXN-GECP-682011','SBI-EPAY-16646817','usr-std-01','ujjwal kumar','25CSD010','JUT/2022/CSE/0892','Computer Science and Engineering','1st Sem','JUT End-Term Examination Fee (1st Sem)','exam',2400,'general','Online UPI (6205482672@ptsbi)','6205482672@ptsbi','789789682006','SUCCESS','Government Engineering College, Palamu','GECP-SBI-COLLECT-822118','SHA256-I2QKU95V4H-MU7UKD3V','19 Sept 2026','09:18:02 am','2026-09-19T03:48:02.011Z'),('TXN-GECP-764529','SBI-EPAY-72061638','usr-std-469866','ujjwal kumar','25CSD010','JUT/2022/CSE/0892','Computer Science and Engineering','1st Sem','JUT End-Term Examination Fee (1st Sem)','exam',2400,'general','Online UPI (6205482672@ptsbi)','6205482672@ptsbi','789789764524','SUCCESS','Government Engineering College, Palamu','GECP-SBI-COLLECT-822118','SHA256-HLLYVA2S4D-MU7UM4S1','19 Sept 2026','09:19:24 am','2026-09-19T03:49:24.529Z'),('TXN-GECP-778504','SBI-EPAY-33928861','usr-std-469866','ujjwal kumar','25CSD010','JUT/2022/CSE/0892','Computer Science and Engineering','1st Sem','JUT End-Term Examination Fee (1st Sem)','exam',2400,'general','Online UPI (6205482672@ptsbi)','6205482672@ptsbi','789789778501','SUCCESS','Government Engineering College, Palamu','GECP-SBI-COLLECT-822118','SHA256-REXTFMHZCF-MU7UMFK8','19 Sept 2026','09:19:38 am','2026-09-19T03:49:38.504Z'),('TXN-GECP-807645','SBI-EPAY-97072051','usr-std-469866','ujjwal kumar','25CSD010','JUT/2022/CSE/0892','Computer Science and Engineering','1st Sem','JUT End-Term Examination Fee (1st Sem)','exam',2400,'general','Online UPI (6205482672@ptsbi)','6205482672@ptsbi','789789807642','SUCCESS','Government Engineering College, Palamu','GECP-SBI-COLLECT-822118','SHA256-LECFDCQYUB-MU7UN21P','19 Sept 2026','09:20:07 am','2026-09-19T03:50:07.645Z'),('TXN-GECP-823121','SBI-EPAY-74847157','usr-std-469866','ujjwal kumar','25CSD010','24021445010','Computer Science & Engineering','5th Sem','5th Sem Academic Tuition Fee','tuition',15200,'general','Online UPI (6205482672@ptsbi)','6205482672@ptsbi','123456789102','SUCCESS','Government Engineering College, Palamu','GECP-SBI-COLLECT-822118','SHA256-94O3O2T6KJ-MU7VU975','19 Sept 2026','09:53:43 am','2026-09-19T04:23:43.121Z');
/*!40000 ALTER TABLE `fee_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_resources`
--

DROP TABLE IF EXISTS `library_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `library_resources` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `semester` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fileType` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `downloads` int DEFAULT '0',
  `rating` double DEFAULT '5',
  `uploadedBy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaderId` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tags` text COLLATE utf8mb4_unicode_ci,
  `verifiedByAdmin` tinyint(1) DEFAULT '1',
  `createdAt` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_lib_category` (`category`),
  KEY `idx_lib_branch` (`branch`),
  KEY `idx_lib_semester` (`semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_resources`
--

LOCK TABLES `library_resources` WRITE;
/*!40000 ALTER TABLE `library_resources` DISABLE KEYS */;
INSERT INTO `library_resources` VALUES ('res-db-198266','V42602285732','Student Shared Notes','CSE','5th Semester','2026','PDF','0.2 MB',0,5,'Rahul Kumar (Student)','anonymous','[\"ege\"]',0,'2026-09-17'),('res-db-767775','SIH2026 IDEA Presentation Format. 2026','Student Shared Notes','CSE','5th Semester','2026','PDF','1.4 MB',1,5,'Rahul Kumar (Student)','anonymous','[\"SIH 2026\"]',0,'2026-09-17'),('res-lab-1','Official Lab Manual: DBMS & PL/SQL Practical with 25 Verified Programs','Laboratory Manuals','CSE','5th Semester','2026','PDF','4.1 MB',519,4.9,'Dr. A. K. Verma',NULL,'[\"SQL DDL/DML\",\"Triggers\",\"Cursors\",\"Procedures\",\"ER Diagram\"]',1,'2026-08-15'),('res-not-1','Complete Lecture Notes: Design & Analysis of Algorithms (Unit 1 to 5)','Faculty Lecture Notes','CSE','5th Semester','2026','PDF','8.6 MB',742,5,'Prof. Priya Kumari (CSE Dept)',NULL,'[\"Asymptotic Notations\",\"Greedy\",\"DP\",\"NP-Completeness\"]',1,'2026-08-10'),('res-pyq-2','JUT End-Term Exam 2024: Operating Systems & Systems Programming (CS502)','Previous Year Questions (PYQs)','CSE','5th Semester','2024','PDF','1.8 MB',383,4.8,'Central Exam Cell',NULL,'[\"OS\",\"CPU Scheduling\",\"Paging\",\"Deadlocks\"]',1,'2026-08-01'),('res-pyq-3','JUT End-Term Exam 2025: Fluid Mechanics & Machinery (ME301)','Previous Year Questions (PYQs)','ME','3rd Semester','2025','PDF','3.1 MB',298,4.7,'Mechanical Dept',NULL,'[\"Bernoulli\",\"Navier Stokes\",\"Turbines\",\"Pumps\"]',1,'2026-08-02'),('res-pyq-4','JUT End-Term Exam 2024: Structural Analysis & Design (CE501)','Previous Year Questions (PYQs)','CE','5th Semester','2024','PDF','2.9 MB',264,4.8,'Civil Dept',NULL,'[\"Moment Distribution\",\"Trusses\",\"Deflection\"]',1,'2026-08-02'),('res-pyq-5','JUT End-Term Exam 2025: Power Systems Analysis (EE501)','Previous Year Questions (PYQs)','EE','5th Semester','2025','PDF','2.7 MB',312,4.9,'Electrical Dept',NULL,'[\"Load Flow\",\"Fault Analysis\",\"Stability\",\"JUT 2025\"]',1,'2026-08-03');
/*!40000 ALTER TABLE `library_resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_fee_dues`
--

DROP TABLE IF EXISTS `student_fee_dues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_fee_dues` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentId` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rollNo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tuitionDue` double DEFAULT '15200',
  `examDue` double DEFAULT '2400',
  `hostelDue` double DEFAULT '6000',
  `libraryDue` double DEFAULT '0',
  `tuitionPaid` double DEFAULT '0',
  `examPaid` double DEFAULT '0',
  `hostelPaid` double DEFAULT '0',
  `libraryPaid` double DEFAULT '0',
  `updatedAt` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fee_std` (`studentId`),
  KEY `idx_fee_roll` (`rollNo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_fee_dues`
--

LOCK TABLES `student_fee_dues` WRITE;
/*!40000 ALTER TABLE `student_fee_dues` DISABLE KEYS */;
INSERT INTO `student_fee_dues` VALUES ('fee-1789789587507-167','usr-std-469866','25CSD010',0,0,0,0,15200,9600,6000,0,'2026-09-19T04:23:43.167Z'),('fee-1789791449562-812','usr-std-217513','25CS0001',15200,2400,0,0,0,0,0,0,'2026-09-19T04:17:29.552Z'),('fee-1789791981720-722','usr-std-981679','26CSE0002',15200,2400,0,0,0,0,0,0,'2026-09-19T04:26:21.720Z'),('fee-1789796556752-29','usr-std-669826','23/CSE/055',15200,2400,6000,0,0,0,0,0,'2026-09-19T05:42:36.752Z');
/*!40000 ALTER TABLE `student_fee_dues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_grades`
--

DROP TABLE IF EXISTS `student_grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_grades` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentId` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rollNo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subjectCode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subjectName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `midTerm` double DEFAULT '0',
  `assignment` double DEFAULT '0',
  `sessional` double DEFAULT '0',
  `updatedAt` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_grade_std` (`studentId`,`subjectCode`),
  KEY `idx_grade_roll` (`rollNo`,`subjectCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_grades`
--

LOCK TABLES `student_grades` WRITE;
/*!40000 ALTER TABLE `student_grades` DISABLE KEYS */;
INSERT INTO `student_grades` VALUES ('grd-012747-908','usr-std-669826','23/CSE/055','CS301','Data Structures & Algorithms',28,9,9,'2026-09-18T12:55:24.474Z'),('grd-066742-426','usr-std-217513','25CS0001','CS502','Operating Systems & System Programming',11,0,0,'2026-09-19T03:54:49.628Z'),('grd-066748-9','usr-std-469866','25CSD010','CS502','Operating Systems & System Programming',26,9,9,'2026-09-19T04:50:25.736Z'),('grd-384662-214','usr-std-669826','23/CSE/055','CS501','Database Management Systems',0,0,0,'2026-09-18T04:39:46.496Z'),('grd-384680-758','usr-std-579474','25CED010','CS501','Database Management Systems',0,0,0,'2026-09-18T04:39:46.515Z'),('grd-384690-161','usr-std-217513','25CS0001','CS501','Database Management Systems',2,0,0,'2026-09-19T04:05:33.679Z'),('grd-384699-102','usr-std-469866','25CSD010','CS501','Database Management Systems',24,8,8,'2026-09-19T04:05:33.694Z'),('grd-384702-696','usr-std-519149','25EED010','CS501','Database Management Systems',0,0,0,'2026-09-18T04:39:46.527Z'),('grd-844873-484','usr-std-669826','23/CSE/055','CS502','Operating Systems',28,9,9,'2026-09-18T08:40:44.873Z'),('grd-973572-846','usr-std-669826','23/CSE/055','CS302','Digital Electronics & Logic Design',15,10,8,'2026-09-18T12:53:18.948Z');
/*!40000 ALTER TABLE `student_grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_subject_attendance`
--

DROP TABLE IF EXISTS `student_subject_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_subject_attendance` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentId` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rollNo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subjectCode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subjectName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `totalClasses` int DEFAULT '0',
  `attendedClasses` int DEFAULT '0',
  `lastAttendedDate` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updatedAt` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sub_att_std` (`studentId`,`subjectCode`),
  KEY `idx_sub_att_roll` (`rollNo`,`subjectCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_subject_attendance`
--

LOCK TABLES `student_subject_attendance` WRITE;
/*!40000 ALTER TABLE `student_subject_attendance` DISABLE KEYS */;
INSERT INTO `student_subject_attendance` VALUES ('subatt-1789720637758-p3ie70','usr-std-669826','','CS502','Operating Systems',2,2,'2026-09-18','2026-09-18T08:40:44.842Z'),('subatt-1789720890954-efsibt','usr-std-217513','25CS0001','CS501','Database Management Systems',4,3,'2026-09-19','2026-09-19T04:05:33.566Z'),('subatt-1789720890971-w8vgt6','usr-std-469866','25CSD010','CS501','Database Management Systems',4,3,'2026-09-19','2026-09-19T04:05:25.596Z'),('subatt-1789721066684-ihg9k6','usr-std-217513','25CS0001','CS502','Operating Systems & System Programming',3,2,'2026-09-19','2026-09-19T03:54:49.534Z'),('subatt-1789721066704-0x67fo','usr-std-469866','25CSD010','CS502','Operating Systems & System Programming',4,3,'2026-09-19','2026-09-19T04:50:13.920Z'),('subatt-1789735973556-nugt9b','usr-std-669826','23/CSE/055','CS302','Digital Electronics & Logic Design',3,3,'2026-09-18','2026-09-18T12:53:18.887Z'),('subatt-1789736120071-jjcsqg','usr-std-669826','23/CSE/055','CS301','Data Structures & Algorithms',2,1,'2026-09-18','2026-09-18T12:55:24.435Z'),('subatt-1789736266017-dhnzr9','usr-std-579474','25CED010','CS501','Database Management Systems',1,1,'2026-09-18','2026-09-18T12:57:46.016Z'),('subatt-1789736286633-yyojib','usr-std-579474','25CED010','CS502','Operating Systems & Systems Programming',1,1,'2026-09-18','2026-09-18T12:58:06.633Z'),('subatt-1789736299574-z52inu','usr-std-217513','25CS0001','CS504','Design & Analysis of Algorithms',1,1,'2026-09-18','2026-09-18T12:58:19.574Z'),('subatt-1789736300891-1orc0v','usr-std-579474','25CED010','CS504','Design & Analysis of Algorithms',1,1,'2026-09-18','2026-09-18T12:58:20.890Z'),('subatt-1789736302207-aw7x9h','usr-std-669826','23/CSE/055','CS504','Design & Analysis of Algorithms',1,1,'2026-09-18','2026-09-18T12:58:22.206Z'),('subatt-1789736303260-2ovb9f','usr-std-469866','25CSD010','CS504','Design & Analysis of Algorithms',1,1,'2026-09-18','2026-09-18T12:58:23.260Z'),('subatt-1789736304271-kbh0rx','usr-std-519149','25EED010','CS504','Design & Analysis of Algorithms',1,1,'2026-09-18','2026-09-18T12:58:24.270Z'),('subatt-1789789807875-8owf06','usr-std-01','25CSD010','CS101','Problem Solving & Programming',1,1,'2026-09-19','2026-09-19T03:50:07.835Z');
/*!40000 ALTER TABLE `student_subject_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_broadcasts`
--

DROP TABLE IF EXISTS `teacher_broadcasts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_broadcasts` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacherId` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacherName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacherDesignation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subjectCode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subjectName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'info',
  `targetAudience` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'All Students',
  `createdAt` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_broadcasts`
--

LOCK TABLES `teacher_broadcasts` WRITE;
/*!40000 ALTER TABLE `teacher_broadcasts` DISABLE KEYS */;
INSERT INTO `teacher_broadcasts` VALUES ('bc-1789675216621','usr-fac-01','Dr. A. K. Verma','Head of Department & Associate Professor','CS501','Database Management Systems','Classs','Hello students','info','All Department Students (CSE)','2026-09-17T20:00:16.621Z'),('bc-1789675528525','usr-fac-02','Prof. Amit Sharma','Assistant Professor (Subject Teacher - OS)','CS502','Operating Systems & System Programming','CS502 Operating Systems - Practical Lab 2 Deadline','Students must submit process scheduling simulation code in C/C++ by Friday 5 PM to Lab 3.','assignment','All Enrolled CS502 Students','2026-09-17T20:05:28.525Z');
/*!40000 ALTER TABLE `teacher_broadcasts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rollNo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `regNo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branch` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branchCode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `semester` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `batch` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cgpa` double DEFAULT NULL,
  `bloodGroup` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `avatar` text COLLATE utf8mb4_unicode_ci,
  `contact` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guardianName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hostelResident` tinyint(1) DEFAULT '0',
  `hostelName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dob` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approvedAt` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approvedBy` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rejectionReason` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_roll` (`rollNo`),
  KEY `idx_users_role_status` (`role`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('usr-admin-01','Dr. Sanjay Kumar Singh','admin@gecpalamu.ac.in','$2b$10$CqkvzqhpQDHxSLSeodbqpuLW5HVMEkqWcZR22xZuvoLSkjRvkTS8G','admin','Principal & Institutional Admin',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'APPROVED',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-08-01T10:00:00.000Z','2026-08-01T10:00:00.000Z','SYSTEM',NULL),('usr-fac-01','Dr. A. K. Verma','akverma@gecpalamu.ac.in','$2b$10$CqkvzqhpQDHxSLSeodbqpusgCFlqQpF9G9GSvzPotv1lf9kuk5yPK','hod','Head of Department & Associate Professor','Computer Science and Engineering',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'APPROVED',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-08-01T10:00:00.000Z','2026-08-01T10:00:00.000Z','usr-admin-01',NULL),('usr-fac-ce-02','Prof. Vikash Kumar','vikash.ce@gecpalamu.ac.in','$2b$10$DVVCqESKTQauBNh6ETl8e.506Ldl.M4iltRvF98XyA1IBzmliZkgq','faculty','Assistant Professor (Hydraulics & Water Resources)','Civil Engineering',NULL,NULL,'Civil Engineering','CE',NULL,NULL,NULL,NULL,'APPROVED',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-09-19T06:11:58.252Z','2026-09-19T06:11:58.252Z',NULL,NULL),('usr-fac-ce-03','Prof. Ananya Roy','ananya.ce@gecpalamu.ac.in','$2b$10$DVVCqESKTQauBNh6ETl8e.506Ldl.M4iltRvF98XyA1IBzmliZkgq','faculty','Assistant Professor (Surveying & Concrete Tech)','Civil Engineering',NULL,NULL,'Civil Engineering','CE',NULL,NULL,NULL,NULL,'APPROVED',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-09-19T06:11:58.268Z','2026-09-19T06:11:58.268Z',NULL,NULL),('usr-fac-cse-04','Prof. Rajesh Gupta','rajesh.gupta@gecpalamu.ac.in','$2b$10$DVVCqESKTQauBNh6ETl8e.506Ldl.M4iltRvF98XyA1IBzmliZkgq','faculty','Assistant Professor (Web Tech & DBMS)','Computer Science and Engineering',NULL,NULL,'Computer Science and Engineering','CSE',NULL,NULL,NULL,NULL,'APPROVED',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-09-19T06:11:58.137Z','2026-09-19T06:11:58.137Z',NULL,NULL),('usr-fac-ee-02','Prof. Neha Agarwal','neha.ee@gecpalamu.ac.in','$2b$10$DVVCqESKTQauBNh6ETl8e.506Ldl.M4iltRvF98XyA1IBzmliZkgq','faculty','Assistant Professor (Control Systems)','Electrical Engineering',NULL,NULL,'Electrical Engineering','EE',NULL,NULL,NULL,NULL,'APPROVED',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-09-19T06:11:58.165Z','2026-09-19T06:11:58.165Z',NULL,NULL),('usr-fac-ee-03','Prof. Alok Tiwari','alok.ee@gecpalamu.ac.in','$2b$10$DVVCqESKTQauBNh6ETl8e.506Ldl.M4iltRvF98XyA1IBzmliZkgq','faculty','Assistant Professor (Power Electronics)','Electrical Engineering',NULL,NULL,'Electrical Engineering','EE',NULL,NULL,NULL,NULL,'APPROVED',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-09-19T06:11:58.178Z','2026-09-19T06:11:58.178Z',NULL,NULL),('usr-fac-hod-ce-01','Dr. Manish Ranjan','dr.manish@gecpalamu.ac.in','$2b$10$DVVCqESKTQauBNh6ETl8e.506Ldl.M4iltRvF98XyA1IBzmliZkgq','hod','Head of Department & Associate Professor','Civil Engineering',NULL,NULL,'Civil Engineering','CE',NULL,NULL,NULL,NULL,'APPROVED',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-09-19T06:11:58.236Z','2026-09-19T06:11:58.236Z',NULL,NULL),('usr-fac-hod-cse-01','Dr. Bhawesh Kumar','dr.bhawesh@gecpalamu.ac.in','$2b$10$DVVCqESKTQauBNh6ETl8e.506Ldl.M4iltRvF98XyA1IBzmliZkgq','hod','Head of Department & Associate Professor','Computer Science and Engineering',NULL,NULL,'Computer Science and Engineering','CSE',NULL,NULL,NULL,NULL,'APPROVED',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-09-19T06:11:58.090Z','2026-09-19T06:11:58.090Z',NULL,NULL),('usr-fac-hod-ee-01','Dr. Vineet Shekhar','dr.vineet@gecpalamu.ac.in','$2b$10$DVVCqESKTQauBNh6ETl8e.506Ldl.M4iltRvF98XyA1IBzmliZkgq','hod','Head of Department & Associate Professor','Electrical Engineering',NULL,NULL,'Electrical Engineering','EE',NULL,NULL,NULL,NULL,'APPROVED',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-09-19T06:11:58.152Z','2026-09-19T06:11:58.152Z',NULL,NULL),('usr-fac-hod-me-01','Dr. Shivam Verma','dr.shivam@gecpalamu.ac.in','$2b$10$DVVCqESKTQauBNh6ETl8e.506Ldl.M4iltRvF98XyA1IBzmliZkgq','hod','Head of Department & Associate Professor','Mechanical Engineering',NULL,NULL,'Mechanical Engineering','ME',NULL,NULL,NULL,NULL,'APPROVED',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-09-19T06:11:58.192Z','2026-09-19T06:11:58.192Z',NULL,NULL),('usr-fac-me-02','Prof. Rahul Sinha','rahul.me@gecpalamu.ac.in','$2b$10$DVVCqESKTQauBNh6ETl8e.506Ldl.M4iltRvF98XyA1IBzmliZkgq','faculty','Assistant Professor (Fluid Mechanics)','Mechanical Engineering',NULL,NULL,'Mechanical Engineering','ME',NULL,NULL,NULL,NULL,'APPROVED',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-09-19T06:11:58.207Z','2026-09-19T06:11:58.207Z',NULL,NULL),('usr-fac-me-03','Prof. Sunita Soren','sunita.me@gecpalamu.ac.in','$2b$10$DVVCqESKTQauBNh6ETl8e.506Ldl.M4iltRvF98XyA1IBzmliZkgq','faculty','Assistant Professor (Manufacturing Sciences)','Mechanical Engineering',NULL,NULL,'Mechanical Engineering','ME',NULL,NULL,NULL,NULL,'APPROVED',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-09-19T06:11:58.221Z','2026-09-19T06:11:58.221Z',NULL,NULL),('usr-std-217513','ujivan','ujjivankr@gmail.com','$2b$10$ZNnE8GgB18RD5DpoVTKFGOQiEgETH7utGCAZdyHnKc6/aTGlWpbjO','student',NULL,NULL,'25CS0001','24021440003','Computer Science & Engineering','Computer','3rd Sem','2026 - 2030',8.75,'B+','APPROVED','https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80','+91 98765 00000','Guardian / Parent',0,'Day Scholar / Non-Resident','General','2005-01-01','2026-09-18T04:36:57.513Z','2026-09-18T04:37:17.236Z','usr-admin-01',NULL),('usr-std-469866','ujjwal kumar','uk.mishr99@gmail.com','$2b$10$zzRMsHmfZEHT4Xx6UH0lxeZsQoUCWO0Vd1HDkJ4BCi48nDY18bEo2','student',NULL,NULL,'25CSD010','24021445010','Computer Science & Engineering','Computer','5th Semester','2026 - 2030',NULL,NULL,'APPROVED','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',NULL,NULL,0,NULL,NULL,NULL,'2026-09-18T03:51:09.866Z','2026-09-18T03:53:42.549Z','usr-admin-01',NULL),('usr-std-519149','rahul kumar','rahulkumar@gmail.com','$2b$10$/xUdkiofvXHF4ZIbhwD7dO370SuPo2v7ixU7gtr/SHFQRfepCspW.','student',NULL,NULL,'25EED010','24021455010','Electrical Engineering','Electrical','5th Semester','2026 - 2030',NULL,NULL,'APPROVED','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',NULL,NULL,0,NULL,NULL,NULL,'2026-09-18T03:51:59.149Z','2026-09-18T03:53:41.248Z','usr-admin-01',NULL),('usr-std-579474','vikash soren','vikashsoren@gmail.com','$2b$10$tcKAybI0HFvE.uYXnGvhlOG/GpxWnOZ.Dxp3Hs7P3q2ZKx.TEogmO','student',NULL,NULL,'25CED010','24021435010','Civil Engineering','Civil','5th Semester','2026 - 2030',NULL,NULL,'APPROVED','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',NULL,NULL,0,NULL,NULL,NULL,'2026-09-18T03:52:59.474Z','2026-09-18T03:53:39.904Z','usr-admin-01',NULL),('usr-std-669826','Vikash Kumar Verma','vikash.student@gecpalamu.ac.in','$2b$10$ZZ9lnqs2gyJYpnPjCyaaKO2EfqIPkL0FUKnVto4ya94zbakh3ld3m','student',NULL,NULL,'23/CSE/055','JUT/2026/23/CSE/055','Computer Science & Engineering','Computer','3rd Semester','2026 - 2030',NULL,'O+','APPROVED','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80','+91 98765 43210','Rameshwar Verma',1,'Birsa Munda Boys Hostel (Room 305)','OBC','2004-08-15','2026-09-18T04:27:49.826Z',NULL,NULL,NULL),('usr-std-981679','abhay kumar','abhaykr@gmail.com','$2b$10$l4rd0tnPHqoX01Ue0d/KuOirDnZ5s5OofDTy7ufKotdLB2NxKCneS','student',NULL,NULL,'26CSE0002','JUT/2026/26cse0002','Computer Science & Engineering','Computer','1st Semester','2026 - 2030',NULL,NULL,'APPROVED','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',NULL,NULL,0,NULL,NULL,NULL,'2026-09-19T04:26:21.679Z','2026-09-19T04:26:47.132Z','usr-admin-01',NULL),('usr-teacher-01','Prof. Amit Sharma','amit.sharma@gecpalamu.ac.in','$2b$10$zkzo185Nc.v2LtbhHY5zq.evcxBu8BEkM8nrKhM52NPcfEuWE.XRq','faculty','Assistant Professor (Subject Teacher - OS)','Computer Science and Engineering',NULL,NULL,'Computer Science and Engineering','CSE',NULL,NULL,NULL,NULL,'APPROVED',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-09-17T19:39:57.809Z',NULL,NULL,NULL),('usr-teacher-02','Prof. Priya Kumari','priya.faculty@gecpalamu.ac.in','$2b$10$zkzo185Nc.v2LtbhHY5zq.evcxBu8BEkM8nrKhM52NPcfEuWE.XRq','faculty','Assistant Professor (Subject Teacher - DAA)','Computer Science and Engineering',NULL,NULL,'Computer Science and Engineering','CSE',NULL,NULL,NULL,NULL,'APPROVED',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-09-17T19:39:57.824Z',NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-20 18:05:03
