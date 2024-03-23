-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql-service.lunaris-databases:3306
-- Generation Time: Mar 23, 2024 at 04:27 PM
-- Server version: 8.0.36
-- PHP Version: 8.2.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Lunaris`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `userId` int NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `alerts`
--

CREATE TABLE `alerts` (
  `alertId` int NOT NULL,
  `userId` int NOT NULL,
  `content` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `untilDate` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `announcementId` int NOT NULL,
  `universityId` int NOT NULL,
  `userId` int NOT NULL,
  `fileId` int DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `pinnedDate` timestamp NULL DEFAULT NULL,
  `editedDate` timestamp NULL DEFAULT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `chats`
--

CREATE TABLE `chats` (
  `chatId` int NOT NULL,
  `userId1` int NOT NULL,
  `userId2` int NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `chatsMessages`
--

CREATE TABLE `chatsMessages` (
  `chatMessageId` int NOT NULL,
  `chatId` int NOT NULL,
  `userId` int NOT NULL,
  `fileId` int DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `delivered` tinyint(1) NOT NULL,
  `seen` tinyint(1) NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `classId` int NOT NULL,
  `studyYearId` int NOT NULL,
  `subjectId` int DEFAULT NULL,
  `classLongId` varchar(36) COLLATE utf8mb4_0900_as_cs NOT NULL,
  `className` longtext COLLATE utf8mb4_0900_as_cs,
  `classPrefix` longtext COLLATE utf8mb4_0900_as_cs,
  `classSuffix` longtext COLLATE utf8mb4_0900_as_cs,
  `classDescription` longtext COLLATE utf8mb4_0900_as_cs,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `classesAssignments`
--

CREATE TABLE `classesAssignments` (
  `classAssigId` int NOT NULL,
  `classId` int NOT NULL,
  `classAssigName` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `classAssigDesc` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `dueDate` timestamp NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `classesAssignmentsFiles`
--

CREATE TABLE `classesAssignmentsFiles` (
  `classAssigId` int NOT NULL,
  `fileId` int NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `classesAssignmentsGrades`
--

CREATE TABLE `classesAssignmentsGrades` (
  `classAssigId` int NOT NULL,
  `userId` int NOT NULL,
  `grade` float DEFAULT NULL,
  `handedInDate` timestamp NULL DEFAULT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `classesAssignmentsUserFiles`
--

CREATE TABLE `classesAssignmentsUserFiles` (
  `classAssigId` int NOT NULL,
  `userId` int NOT NULL,
  `fileId` int NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `classesFiles`
--

CREATE TABLE `classesFiles` (
  `classId` int NOT NULL,
  `fileId` int NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `classesMembers`
--

CREATE TABLE `classesMembers` (
  `classMemberId` int NOT NULL,
  `classId` int NOT NULL,
  `userId` int DEFAULT NULL,
  `groupId` int DEFAULT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `classesMessages`
--

CREATE TABLE `classesMessages` (
  `classMessageId` int NOT NULL,
  `classId` int NOT NULL,
  `userId` int NOT NULL,
  `fileId` int DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `pinnedDate` timestamp NULL DEFAULT NULL,
  `editedDate` timestamp NULL DEFAULT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `contactInfoEmail`
--

CREATE TABLE `contactInfoEmail` (
  `userId` int NOT NULL,
  `email` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `contactInfoPhone`
--

CREATE TABLE `contactInfoPhone` (
  `userId` int NOT NULL,
  `phone` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `fees`
--

CREATE TABLE `fees` (
  `feeId` int NOT NULL,
  `studyYearId` int NOT NULL,
  `feeName` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `feesFee`
--

CREATE TABLE `feesFee` (
  `feesFeeId` int NOT NULL,
  `feeId` int NOT NULL,
  `fromDate` timestamp NOT NULL,
  `toDate` timestamp NOT NULL,
  `amount` float NOT NULL,
  `isoCurrency` tinytext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `feesMembers`
--

CREATE TABLE `feesMembers` (
  `feeMemberId` int NOT NULL,
  `feeId` int NOT NULL,
  `userId` int DEFAULT NULL,
  `groupId` int DEFAULT NULL,
  `yearId` int NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE `files` (
  `fileId` int NOT NULL,
  `fileName` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `storedFileName` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `lastModifiedUserId` int NOT NULL,
  `lastModifiedDate` timestamp NOT NULL,
  `fileType` tinyint NOT NULL,
  `parentId` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `filesPermissions`
--

CREATE TABLE `filesPermissions` (
  `filePermissionId` int NOT NULL,
  `fileId` int NOT NULL,
  `userId` int DEFAULT NULL,
  `groupId` int DEFAULT NULL,
  `permissionType` int NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `finalGrades`
--

CREATE TABLE `finalGrades` (
  `studentYearId` int NOT NULL,
  `subjectId` int NOT NULL,
  `grade` float NOT NULL,
  `credits` int NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `fullAdmins`
--

CREATE TABLE `fullAdmins` (
  `userId` int NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `groupsMembers`
--

CREATE TABLE `groupsMembers` (
  `groupId` int NOT NULL,
  `userId` int NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `logins`
--

CREATE TABLE `logins` (
  `loginId` int NOT NULL,
  `userId` int NOT NULL,
  `expDate` timestamp NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `paymentId` int NOT NULL,
  `feeId` int NOT NULL,
  `userId` int NOT NULL,
  `amount` float NOT NULL,
  `clientSecret` varchar(60) COLLATE utf8mb4_0900_as_cs NOT NULL,
  `purchaseStatus` tinyint NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `professors`
--

CREATE TABLE `professors` (
  `userId` int NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `programId` int NOT NULL,
  `universityId` int NOT NULL,
  `programType` tinytext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `programName` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `programShortName` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `archived` tinyint(1) NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `schools`
--

CREATE TABLE `schools` (
  `schoolId` int NOT NULL,
  `universityId` int NOT NULL,
  `schoolName` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `studentGroups`
--

CREATE TABLE `studentGroups` (
  `groupId` int NOT NULL,
  `universityId` int NOT NULL,
  `groupName` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `userId` int NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `personalNumericCode` longtext COLLATE utf8mb4_0900_as_cs,
  `dateOfBirth` date NOT NULL,
  `seriesAndCINumber` longtext COLLATE utf8mb4_0900_as_cs,
  `ciIssueDate` date DEFAULT NULL,
  `ciExpiryDate` date DEFAULT NULL,
  `gender` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `birthCountry` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `birthCity` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `maritalStatus` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `fatherFirstName` longtext COLLATE utf8mb4_0900_as_cs,
  `motherFirstName` longtext COLLATE utf8mb4_0900_as_cs,
  `citizenship` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `ethnicity` longtext COLLATE utf8mb4_0900_as_cs,
  `ppSeriesAndNumber` longtext COLLATE utf8mb4_0900_as_cs,
  `ppIssueDate` date DEFAULT NULL,
  `ppExpiryDate` date DEFAULT NULL,
  `nationality` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `highSchoolGraduate` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `graduationYear` int NOT NULL,
  `graduationCity` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `preUniversityCountry` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `preUniversityCounty` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `preUniversityBranch` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `specialization` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `educationForm` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `profile` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `diplomaType` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `diplomaSeriesAndNumber` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `diplomaIssuer` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `linguisticCertificate` longtext COLLATE utf8mb4_0900_as_cs,
  `preUniversityMedia` float DEFAULT NULL,
  `universitySchoolGraduate` longtext COLLATE utf8mb4_0900_as_cs,
  `universityGraduationYear` int DEFAULT NULL,
  `universityCountry` longtext COLLATE utf8mb4_0900_as_cs,
  `universityCounty` longtext COLLATE utf8mb4_0900_as_cs,
  `universityCity` longtext COLLATE utf8mb4_0900_as_cs,
  `universityBranch` longtext COLLATE utf8mb4_0900_as_cs,
  `universityProgram` longtext COLLATE utf8mb4_0900_as_cs,
  `universityDiplomaIssuer` longtext COLLATE utf8mb4_0900_as_cs,
  `universityDiplomaType` longtext COLLATE utf8mb4_0900_as_cs,
  `universityDiplomaSeriesAndNumber` longtext COLLATE utf8mb4_0900_as_cs,
  `universityDiplomaIssueYear` int DEFAULT NULL,
  `universityMedia` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `studentsYears`
--

CREATE TABLE `studentsYears` (
  `studentYearId` int NOT NULL,
  `yearId` int NOT NULL,
  `userId` int NOT NULL,
  `studyYearId` int NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `studyYears`
--

CREATE TABLE `studyYears` (
  `studyYearId` int NOT NULL,
  `universityId` int NOT NULL,
  `fromYear` tinyint NOT NULL,
  `toYear` tinyint NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `subjectId` int NOT NULL,
  `subjectName` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `credits` int NOT NULL,
  `archived` tinyint(1) NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `universities`
--

CREATE TABLE `universities` (
  `universityId` int NOT NULL,
  `universityName` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `universityLongId` varchar(36) COLLATE utf8mb4_0900_as_cs NOT NULL,
  `stripePubKey` varchar(107) COLLATE utf8mb4_0900_as_cs NOT NULL,
  `stripePrivKey` varchar(107) COLLATE utf8mb4_0900_as_cs NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userId` int NOT NULL,
  `universityId` int NOT NULL,
  `email` varchar(64) COLLATE utf8mb4_0900_as_cs NOT NULL,
  `hashedPassword` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `role` tinyint NOT NULL,
  `firstName` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `lastName` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `desc` longtext COLLATE utf8mb4_0900_as_cs,
  `website` longtext COLLATE utf8mb4_0900_as_cs,
  `publicEmail` longtext COLLATE utf8mb4_0900_as_cs,
  `profileImageFileId` int DEFAULT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `disabled` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `years`
--

CREATE TABLE `years` (
  `yearId` int NOT NULL,
  `programId` int NOT NULL,
  `yearIndex` tinyint NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

-- --------------------------------------------------------

--
-- Table structure for table `yearsSubjects`
--

CREATE TABLE `yearsSubjects` (
  `yearId` int NOT NULL,
  `subjectId` int NOT NULL,
  `semesterIndex` tinyint NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`userId`);

--
-- Indexes for table `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`alertId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`announcementId`),
  ADD KEY `universityId` (`universityId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `fileId` (`fileId`);

--
-- Indexes for table `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`chatId`),
  ADD KEY `userId1` (`userId1`),
  ADD KEY `userId2` (`userId2`);

--
-- Indexes for table `chatsMessages`
--
ALTER TABLE `chatsMessages`
  ADD PRIMARY KEY (`chatMessageId`),
  ADD KEY `chatId` (`chatId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `fileId` (`fileId`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`classId`),
  ADD KEY `studyYearId` (`studyYearId`),
  ADD KEY `subjectId` (`subjectId`);

--
-- Indexes for table `classesAssignments`
--
ALTER TABLE `classesAssignments`
  ADD PRIMARY KEY (`classAssigId`),
  ADD KEY `classId` (`classId`);

--
-- Indexes for table `classesAssignmentsFiles`
--
ALTER TABLE `classesAssignmentsFiles`
  ADD PRIMARY KEY (`classAssigId`,`fileId`),
  ADD KEY `fileId` (`fileId`);

--
-- Indexes for table `classesAssignmentsGrades`
--
ALTER TABLE `classesAssignmentsGrades`
  ADD PRIMARY KEY (`classAssigId`,`userId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `classesAssignmentsUserFiles`
--
ALTER TABLE `classesAssignmentsUserFiles`
  ADD PRIMARY KEY (`classAssigId`,`userId`,`fileId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `fileId` (`fileId`);

--
-- Indexes for table `classesFiles`
--
ALTER TABLE `classesFiles`
  ADD PRIMARY KEY (`classId`,`fileId`),
  ADD KEY `fileId` (`fileId`);

--
-- Indexes for table `classesMembers`
--
ALTER TABLE `classesMembers`
  ADD PRIMARY KEY (`classMemberId`),
  ADD UNIQUE KEY `classId` (`classId`,`userId`,`groupId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `groupId` (`groupId`);

--
-- Indexes for table `classesMessages`
--
ALTER TABLE `classesMessages`
  ADD PRIMARY KEY (`classMessageId`),
  ADD KEY `classId` (`classId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `fileId` (`fileId`);

--
-- Indexes for table `contactInfoEmail`
--
ALTER TABLE `contactInfoEmail`
  ADD PRIMARY KEY (`userId`);

--
-- Indexes for table `contactInfoPhone`
--
ALTER TABLE `contactInfoPhone`
  ADD PRIMARY KEY (`userId`);

--
-- Indexes for table `fees`
--
ALTER TABLE `fees`
  ADD PRIMARY KEY (`feeId`),
  ADD KEY `studyYearId` (`studyYearId`);

--
-- Indexes for table `feesFee`
--
ALTER TABLE `feesFee`
  ADD PRIMARY KEY (`feesFeeId`),
  ADD KEY `feeId` (`feeId`);

--
-- Indexes for table `feesMembers`
--
ALTER TABLE `feesMembers`
  ADD PRIMARY KEY (`feeMemberId`),
  ADD UNIQUE KEY `feeId` (`feeId`,`userId`,`groupId`,`yearId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `groupId` (`groupId`),
  ADD KEY `yearId` (`yearId`);

--
-- Indexes for table `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`fileId`),
  ADD KEY `lastModifiedUserId` (`lastModifiedUserId`),
  ADD KEY `parentId` (`parentId`);

--
-- Indexes for table `filesPermissions`
--
ALTER TABLE `filesPermissions`
  ADD PRIMARY KEY (`filePermissionId`),
  ADD KEY `fileId` (`fileId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `groupId` (`groupId`);

--
-- Indexes for table `finalGrades`
--
ALTER TABLE `finalGrades`
  ADD PRIMARY KEY (`studentYearId`,`subjectId`),
  ADD KEY `subjectId` (`subjectId`);

--
-- Indexes for table `fullAdmins`
--
ALTER TABLE `fullAdmins`
  ADD PRIMARY KEY (`userId`);

--
-- Indexes for table `groupsMembers`
--
ALTER TABLE `groupsMembers`
  ADD PRIMARY KEY (`groupId`,`userId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `logins`
--
ALTER TABLE `logins`
  ADD PRIMARY KEY (`loginId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`paymentId`),
  ADD KEY `feeId` (`feeId`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `professors`
--
ALTER TABLE `professors`
  ADD PRIMARY KEY (`userId`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`programId`),
  ADD KEY `universityId` (`universityId`);

--
-- Indexes for table `schools`
--
ALTER TABLE `schools`
  ADD PRIMARY KEY (`schoolId`),
  ADD KEY `universityId` (`universityId`);

--
-- Indexes for table `studentGroups`
--
ALTER TABLE `studentGroups`
  ADD PRIMARY KEY (`groupId`),
  ADD KEY `universityId` (`universityId`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`userId`);

--
-- Indexes for table `studentsYears`
--
ALTER TABLE `studentsYears`
  ADD PRIMARY KEY (`studentYearId`),
  ADD KEY `yearId` (`yearId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `studyYearId` (`studyYearId`);

--
-- Indexes for table `studyYears`
--
ALTER TABLE `studyYears`
  ADD PRIMARY KEY (`studyYearId`),
  ADD KEY `universityId` (`universityId`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`subjectId`);

--
-- Indexes for table `universities`
--
ALTER TABLE `universities`
  ADD PRIMARY KEY (`universityId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `universityId` (`universityId`),
  ADD KEY `profileImageFileId` (`profileImageFileId`);

--
-- Indexes for table `years`
--
ALTER TABLE `years`
  ADD PRIMARY KEY (`yearId`),
  ADD KEY `programId` (`programId`);

--
-- Indexes for table `yearsSubjects`
--
ALTER TABLE `yearsSubjects`
  ADD PRIMARY KEY (`yearId`,`subjectId`),
  ADD KEY `subjectId` (`subjectId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alerts`
--
ALTER TABLE `alerts`
  MODIFY `alertId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `announcementId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chats`
--
ALTER TABLE `chats`
  MODIFY `chatId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chatsMessages`
--
ALTER TABLE `chatsMessages`
  MODIFY `chatMessageId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `classId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `classesAssignments`
--
ALTER TABLE `classesAssignments`
  MODIFY `classAssigId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `classesMembers`
--
ALTER TABLE `classesMembers`
  MODIFY `classMemberId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `classesMessages`
--
ALTER TABLE `classesMessages`
  MODIFY `classMessageId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fees`
--
ALTER TABLE `fees`
  MODIFY `feeId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `feesFee`
--
ALTER TABLE `feesFee`
  MODIFY `feesFeeId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `feesMembers`
--
ALTER TABLE `feesMembers`
  MODIFY `feeMemberId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `files`
--
ALTER TABLE `files`
  MODIFY `fileId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `filesPermissions`
--
ALTER TABLE `filesPermissions`
  MODIFY `filePermissionId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `logins`
--
ALTER TABLE `logins`
  MODIFY `loginId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `paymentId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `programId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `schools`
--
ALTER TABLE `schools`
  MODIFY `schoolId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `studentGroups`
--
ALTER TABLE `studentGroups`
  MODIFY `groupId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `studentsYears`
--
ALTER TABLE `studentsYears`
  MODIFY `studentYearId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `studyYears`
--
ALTER TABLE `studyYears`
  MODIFY `studyYearId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `subjectId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `universities`
--
ALTER TABLE `universities`
  MODIFY `universityId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `years`
--
ALTER TABLE `years`
  MODIFY `yearId` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admins`
--
ALTER TABLE `admins`
  ADD CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `alerts`
--
ALTER TABLE `alerts`
  ADD CONSTRAINT `alerts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`universityId`) REFERENCES `universities` (`universityId`),
  ADD CONSTRAINT `announcements_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `announcements_ibfk_3` FOREIGN KEY (`fileId`) REFERENCES `files` (`fileId`);

--
-- Constraints for table `chats`
--
ALTER TABLE `chats`
  ADD CONSTRAINT `chats_ibfk_1` FOREIGN KEY (`userId1`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `chats_ibfk_2` FOREIGN KEY (`userId2`) REFERENCES `users` (`userId`);

--
-- Constraints for table `chatsMessages`
--
ALTER TABLE `chatsMessages`
  ADD CONSTRAINT `chatsmessages_ibfk_1` FOREIGN KEY (`chatId`) REFERENCES `chats` (`chatId`),
  ADD CONSTRAINT `chatsmessages_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `chatsmessages_ibfk_3` FOREIGN KEY (`fileId`) REFERENCES `files` (`fileId`);

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`studyYearId`) REFERENCES `studyYears` (`studyYearId`),
  ADD CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`subjectId`) REFERENCES `subjects` (`subjectId`);

--
-- Constraints for table `classesAssignments`
--
ALTER TABLE `classesAssignments`
  ADD CONSTRAINT `classesassignments_ibfk_1` FOREIGN KEY (`classId`) REFERENCES `classes` (`classId`);

--
-- Constraints for table `classesAssignmentsFiles`
--
ALTER TABLE `classesAssignmentsFiles`
  ADD CONSTRAINT `classesassignmentsfiles_ibfk_1` FOREIGN KEY (`classAssigId`) REFERENCES `classesAssignments` (`classAssigId`),
  ADD CONSTRAINT `classesassignmentsfiles_ibfk_2` FOREIGN KEY (`fileId`) REFERENCES `files` (`fileId`);

--
-- Constraints for table `classesAssignmentsGrades`
--
ALTER TABLE `classesAssignmentsGrades`
  ADD CONSTRAINT `classesassignmentsgrades_ibfk_1` FOREIGN KEY (`classAssigId`) REFERENCES `classesAssignments` (`classAssigId`),
  ADD CONSTRAINT `classesassignmentsgrades_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `classesAssignmentsUserFiles`
--
ALTER TABLE `classesAssignmentsUserFiles`
  ADD CONSTRAINT `classesassignmentsuserfiles_ibfk_1` FOREIGN KEY (`classAssigId`) REFERENCES `classesAssignments` (`classAssigId`),
  ADD CONSTRAINT `classesassignmentsuserfiles_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `classesassignmentsuserfiles_ibfk_3` FOREIGN KEY (`fileId`) REFERENCES `files` (`fileId`);

--
-- Constraints for table `classesFiles`
--
ALTER TABLE `classesFiles`
  ADD CONSTRAINT `classesfiles_ibfk_1` FOREIGN KEY (`classId`) REFERENCES `classes` (`classId`),
  ADD CONSTRAINT `classesfiles_ibfk_2` FOREIGN KEY (`fileId`) REFERENCES `files` (`fileId`);

--
-- Constraints for table `classesMembers`
--
ALTER TABLE `classesMembers`
  ADD CONSTRAINT `classesmembers_ibfk_1` FOREIGN KEY (`classId`) REFERENCES `classes` (`classId`),
  ADD CONSTRAINT `classesmembers_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `classesmembers_ibfk_3` FOREIGN KEY (`groupId`) REFERENCES `studentGroups` (`groupId`);

--
-- Constraints for table `classesMessages`
--
ALTER TABLE `classesMessages`
  ADD CONSTRAINT `classesmessages_ibfk_1` FOREIGN KEY (`classId`) REFERENCES `classes` (`classId`),
  ADD CONSTRAINT `classesmessages_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `classesmessages_ibfk_3` FOREIGN KEY (`fileId`) REFERENCES `files` (`fileId`);

--
-- Constraints for table `contactInfoEmail`
--
ALTER TABLE `contactInfoEmail`
  ADD CONSTRAINT `contactinfoemail_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `contactInfoPhone`
--
ALTER TABLE `contactInfoPhone`
  ADD CONSTRAINT `contactinfophone_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `fees`
--
ALTER TABLE `fees`
  ADD CONSTRAINT `fees_ibfk_1` FOREIGN KEY (`studyYearId`) REFERENCES `studyYears` (`studyYearId`);

--
-- Constraints for table `feesFee`
--
ALTER TABLE `feesFee`
  ADD CONSTRAINT `feesfee_ibfk_1` FOREIGN KEY (`feeId`) REFERENCES `fees` (`feeId`);

--
-- Constraints for table `feesMembers`
--
ALTER TABLE `feesMembers`
  ADD CONSTRAINT `feesmembers_ibfk_1` FOREIGN KEY (`feeId`) REFERENCES `fees` (`feeId`),
  ADD CONSTRAINT `feesmembers_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `feesmembers_ibfk_3` FOREIGN KEY (`groupId`) REFERENCES `studentGroups` (`groupId`),
  ADD CONSTRAINT `feesmembers_ibfk_4` FOREIGN KEY (`yearId`) REFERENCES `years` (`yearId`);

--
-- Constraints for table `files`
--
ALTER TABLE `files`
  ADD CONSTRAINT `files_ibfk_1` FOREIGN KEY (`lastModifiedUserId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `files_ibfk_2` FOREIGN KEY (`parentId`) REFERENCES `files` (`fileId`);

--
-- Constraints for table `filesPermissions`
--
ALTER TABLE `filesPermissions`
  ADD CONSTRAINT `filespermissions_ibfk_1` FOREIGN KEY (`fileId`) REFERENCES `files` (`fileId`),
  ADD CONSTRAINT `filespermissions_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `filespermissions_ibfk_3` FOREIGN KEY (`groupId`) REFERENCES `studentGroups` (`groupId`);

--
-- Constraints for table `finalGrades`
--
ALTER TABLE `finalGrades`
  ADD CONSTRAINT `finalgrades_ibfk_1` FOREIGN KEY (`studentYearId`) REFERENCES `studentsYears` (`studentYearId`),
  ADD CONSTRAINT `finalgrades_ibfk_2` FOREIGN KEY (`subjectId`) REFERENCES `subjects` (`subjectId`);

--
-- Constraints for table `fullAdmins`
--
ALTER TABLE `fullAdmins`
  ADD CONSTRAINT `fulladmins_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `groupsMembers`
--
ALTER TABLE `groupsMembers`
  ADD CONSTRAINT `groupsmembers_ibfk_1` FOREIGN KEY (`groupId`) REFERENCES `studentGroups` (`groupId`),
  ADD CONSTRAINT `groupsmembers_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `logins`
--
ALTER TABLE `logins`
  ADD CONSTRAINT `logins_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`feeId`) REFERENCES `fees` (`feeId`),
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `professors`
--
ALTER TABLE `professors`
  ADD CONSTRAINT `professors_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `programs`
--
ALTER TABLE `programs`
  ADD CONSTRAINT `programs_ibfk_1` FOREIGN KEY (`universityId`) REFERENCES `universities` (`universityId`);

--
-- Constraints for table `schools`
--
ALTER TABLE `schools`
  ADD CONSTRAINT `schools_ibfk_1` FOREIGN KEY (`universityId`) REFERENCES `universities` (`universityId`);

--
-- Constraints for table `studentGroups`
--
ALTER TABLE `studentGroups`
  ADD CONSTRAINT `studentgroups_ibfk_1` FOREIGN KEY (`universityId`) REFERENCES `universities` (`universityId`);

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Constraints for table `studentsYears`
--
ALTER TABLE `studentsYears`
  ADD CONSTRAINT `studentsyears_ibfk_1` FOREIGN KEY (`yearId`) REFERENCES `years` (`yearId`),
  ADD CONSTRAINT `studentsyears_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `studentsyears_ibfk_3` FOREIGN KEY (`studyYearId`) REFERENCES `studyYears` (`studyYearId`);

--
-- Constraints for table `studyYears`
--
ALTER TABLE `studyYears`
  ADD CONSTRAINT `studyyears_ibfk_1` FOREIGN KEY (`universityId`) REFERENCES `universities` (`universityId`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`universityId`) REFERENCES `universities` (`universityId`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`profileImageFileId`) REFERENCES `files` (`fileId`);

--
-- Constraints for table `years`
--
ALTER TABLE `years`
  ADD CONSTRAINT `years_ibfk_1` FOREIGN KEY (`programId`) REFERENCES `programs` (`programId`);

--
-- Constraints for table `yearsSubjects`
--
ALTER TABLE `yearsSubjects`
  ADD CONSTRAINT `yearssubjects_ibfk_1` FOREIGN KEY (`yearId`) REFERENCES `years` (`yearId`),
  ADD CONSTRAINT `yearssubjects_ibfk_2` FOREIGN KEY (`subjectId`) REFERENCES `subjects` (`subjectId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
