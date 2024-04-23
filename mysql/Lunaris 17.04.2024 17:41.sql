-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql-service.lunaris-databases:3306
-- Generation Time: Apr 23, 2024 at 01:57 PM
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
CREATE DATABASE IF NOT EXISTS `Lunaris` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs;
USE `Lunaris`;

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

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`announcementId`, `universityId`, `userId`, `fileId`, `content`, `pinnedDate`, `editedDate`, `createdDate`) VALUES
(5, 1, 1, NULL, 'sdsdfsdf', NULL, NULL, '2024-03-26 16:14:09');

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
  `yearSubjectId` int DEFAULT NULL,
  `classLongId` varchar(36) COLLATE utf8mb4_0900_as_cs NOT NULL,
  `className` longtext COLLATE utf8mb4_0900_as_cs,
  `classPrefix` longtext COLLATE utf8mb4_0900_as_cs,
  `classSuffix` longtext COLLATE utf8mb4_0900_as_cs,
  `classDescription` longtext COLLATE utf8mb4_0900_as_cs,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`classId`, `studyYearId`, `yearSubjectId`, `classLongId`, `className`, `classPrefix`, `classSuffix`, `classDescription`, `createdDate`) VALUES
(12, 16, 6, '901ac7be-896d-4810-8aff-6c1adcf65ded', NULL, 'test', 'ana are mere', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut interdum nec nisl laoreet pharetra. Nam facilisis ullamcorper est ut facilisis. Maecenas sit amet consequat turpis. Aliquam sagittis purus et massa vestibulum tincidunt. Etiam est erat, condimentum ut tortor sed, vulputate varius erat. Quisque nec pharetra lectus. In eu turpis mi. Proin id massa et lacus consectetur sagittis. Aenean rhoncus a eros sit amet consectetur. Nullam aliquam tristique tortor, pharetra sodales sapien iaculis sed. Ut mattis nisl vitae nisl molestie tincidunt.', '2024-04-13 12:51:22'),
(14, 16, NULL, 'effcc9fe-d91e-4a3b-a74a-01f28967b728', 'jdhuidsuihus', '', '', 'huiadhidfavuivufvh', '2024-04-23 09:56:39');

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

--
-- Dumping data for table `classesAssignments`
--

INSERT INTO `classesAssignments` (`classAssigId`, `classId`, `classAssigName`, `classAssigDesc`, `dueDate`, `createdDate`) VALUES
(1, 12, 'Test Assig', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut interdum nec nisl laoreet pharetra. Nam facilisis ullamcorper est ut facilisis. Maecenas sit amet consequat turpis. Aliquam sagittis purus et massa vestibulum tincidunt. Etiam est erat, condimentum ut tortor sed, vulputate varius erat. Quisque nec pharetra lectus. In eu turpis mi. Proin id massa et lacus consectetur sagittis. Aenean rhoncus a eros sit amet consectetur. Nullam aliquam tristique tortor, pharetra sodales sapien iaculis sed. Ut mattis nisl vitae nisl molestie tincidunt.', '2024-04-16 09:07:14', '2024-04-16 09:07:14'),
(2, 12, 'Test Assig12', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut interdum nec nisl laoreet pharetra. Nam facilisis ullamcorper est ut facilisis. Maecenas sit amet consequat turpis. Aliquam sagittis purus et massa vestibulum tincidunt. Etiam est erat, condimentum ut tortor sed, vulputate varius erat. Quisque nec pharetra lectus. In eu turpis mi. Proin id massa et lacus consectetur sagittis. Aenean rhoncus a eros sit amet consectetur. Nullam aliquam tristique tortor, pharetra sodales sapien iaculis sed. Ut mattis nisl vitae nisl molestie tincidunt.', '2024-04-23 09:12:52', '2024-04-16 09:07:14'),
(3, 12, 'test12122125', 'asdsadasdLorem ipsum dolor sit amet, consectetur adipiscing elit. Ut interdum nec nisl laoreet pharetra. Nam facilisis ullamcorper est ut facilisis. Maecenas sit amet consequat turpis. Aliquam sagittis purus et massa vestibulum tincidunt. Etiam est erat, condimentum ut tortor sed, vulputate varius erat. Quisque nec pharetra lectus. In eu turpis mi. Proin id massa et lacus consectetur sagittis. Aenean rhoncus a eros sit amet consectetur. Nullam aliquam tristique tortor, pharetra sodales sapien iaculis sed. Ut mattis nisl vitae nisl molestie tincidunt.', '2024-05-23 13:25:35', '2024-04-17 13:15:55'),
(4, 14, 'Test new', 'vijfaerwfi;huvfbiwjovfuabjieowjvadiefjowpivafj', '2024-05-01 10:54:03', '2024-04-23 10:54:28');

-- --------------------------------------------------------

--
-- Table structure for table `classesAssignmentsFiles`
--

CREATE TABLE `classesAssignmentsFiles` (
  `classAssigId` int NOT NULL,
  `fileId` int NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

--
-- Dumping data for table `classesAssignmentsFiles`
--

INSERT INTO `classesAssignmentsFiles` (`classAssigId`, `fileId`, `createdDate`) VALUES
(3, 4, '2024-04-22 11:19:49'),
(3, 5, '2024-04-22 11:21:33'),
(3, 6, '2024-04-22 11:21:33'),
(4, 7, '2024-04-23 10:54:28');

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

--
-- Dumping data for table `classesAssignmentsGrades`
--

INSERT INTO `classesAssignmentsGrades` (`classAssigId`, `userId`, `grade`, `handedInDate`, `createdDate`) VALUES
(3, 6, NULL, '2024-04-23 13:50:44', '2024-04-23 13:47:35');

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

--
-- Dumping data for table `classesAssignmentsUserFiles`
--

INSERT INTO `classesAssignmentsUserFiles` (`classAssigId`, `userId`, `fileId`, `createdDate`) VALUES
(3, 6, 11, '2024-04-23 13:32:54');

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

--
-- Dumping data for table `classesMembers`
--

INSERT INTO `classesMembers` (`classMemberId`, `classId`, `userId`, `groupId`, `createdDate`) VALUES
(9, 12, 1, NULL, '2024-04-13 12:51:22'),
(11, 12, 3, NULL, '2024-04-13 12:51:22'),
(12, 12, 2, NULL, '2024-04-14 12:43:26'),
(14, 12, 6, NULL, '2024-04-14 14:23:53'),
(16, 14, 1, NULL, '2024-04-23 09:56:39'),
(17, 14, 6, NULL, '2024-04-23 09:56:39'),
(18, 14, 2, NULL, '2024-04-23 09:56:39'),
(19, 14, 3, NULL, '2024-04-23 09:56:39');

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

--
-- Dumping data for table `classesMessages`
--

INSERT INTO `classesMessages` (`classMessageId`, `classId`, `userId`, `fileId`, `content`, `pinnedDate`, `editedDate`, `createdDate`) VALUES
(1, 12, 2, NULL, 'test', NULL, NULL, '2024-04-14 14:06:30'),
(2, 12, 2, NULL, 'ana', NULL, NULL, '2024-04-14 14:06:55'),
(3, 12, 1, NULL, 'test12', NULL, NULL, '2024-04-14 14:07:00'),
(4, 12, 1, NULL, 'asassa', NULL, NULL, '2024-04-22 16:45:37'),
(5, 12, 6, NULL, 'gggggg', NULL, NULL, '2024-04-22 16:46:08'),
(6, 12, 1, NULL, 'qqqqq', NULL, NULL, '2024-04-22 16:46:19'),
(7, 12, 1, NULL, 'asasa', NULL, NULL, '2024-04-22 16:48:06'),
(8, 12, 6, NULL, 'aaaaa', NULL, NULL, '2024-04-22 16:51:59'),
(9, 12, 6, NULL, 'aaaaaaaaaaa', NULL, NULL, '2024-04-22 16:52:29'),
(10, 12, 6, NULL, 'bbbbb', NULL, NULL, '2024-04-22 16:52:57'),
(11, 12, 6, NULL, 'cccccccccc', NULL, NULL, '2024-04-22 16:53:41'),
(12, 12, 6, NULL, 'aaaa', NULL, NULL, '2024-04-22 16:54:51'),
(13, 12, 6, NULL, 'bbbbbbb', NULL, NULL, '2024-04-22 16:58:36'),
(14, 12, 6, NULL, 'bbbbb', NULL, NULL, '2024-04-22 16:58:39'),
(15, 12, 6, NULL, 'aasaas', NULL, NULL, '2024-04-22 16:58:42'),
(16, 12, 6, NULL, 'bbbbb', NULL, NULL, '2024-04-22 17:01:14'),
(17, 12, 6, NULL, 'cccccc', NULL, NULL, '2024-04-22 17:01:25'),
(18, 12, 6, NULL, 'aaaaa', NULL, NULL, '2024-04-22 17:01:29'),
(19, 12, 6, NULL, 'vvvvvv', NULL, NULL, '2024-04-22 17:04:49'),
(20, 12, 6, NULL, 'aaaaa', NULL, NULL, '2024-04-22 17:05:27'),
(21, 12, 6, NULL, 'bbbb', NULL, NULL, '2024-04-22 17:07:12'),
(22, 12, 6, NULL, 'aaaa', NULL, NULL, '2024-04-22 17:07:37'),
(23, 12, 6, NULL, 'bbb', NULL, NULL, '2024-04-22 17:07:47'),
(24, 12, 6, NULL, 'aaaa', NULL, NULL, '2024-04-22 17:08:01'),
(25, 12, 1, NULL, 'bbbb', NULL, NULL, '2024-04-22 17:17:03'),
(26, 12, 1, NULL, 'cccc', NULL, NULL, '2024-04-22 17:17:12'),
(27, 12, 1, NULL, 'aaaa', NULL, NULL, '2024-04-22 17:17:19'),
(28, 12, 1, NULL, 'bbbb', NULL, NULL, '2024-04-22 17:17:21'),
(29, 12, 1, NULL, 'aaaa', NULL, NULL, '2024-04-22 17:19:05'),
(30, 12, 1, NULL, 'bbb', NULL, NULL, '2024-04-22 17:19:49'),
(31, 12, 1, NULL, 'cccc', NULL, NULL, '2024-04-22 17:19:52'),
(32, 12, 1, NULL, 'aaa', NULL, NULL, '2024-04-22 17:19:56'),
(33, 12, 6, NULL, 'ddd', NULL, NULL, '2024-04-22 17:20:01'),
(34, 14, 6, NULL, 'test', NULL, NULL, '2024-04-23 10:21:23');

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
  `lastModifiedDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fileType` tinyint NOT NULL,
  `parentId` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

--
-- Dumping data for table `files`
--

INSERT INTO `files` (`fileId`, `fileName`, `storedFileName`, `createdDate`, `lastModifiedUserId`, `lastModifiedDate`, `fileType`, `parentId`) VALUES
(4, 'IMG_0438-removebg.png', '1ee1ed3d-03bf-4790-8c1a-cf98bf582a95.png', '2024-04-22 11:19:49', 1, '2024-04-22 11:19:49', 2, NULL),
(5, '2.docx', '2d1880c2-6566-40f2-a4d8-81f5e70f649a.docx', '2024-04-22 11:21:33', 1, '2024-04-22 11:21:33', 2, NULL),
(6, '2.docx', '7a14b083-d051-4848-ad27-9850bf5e1aad.docx', '2024-04-22 11:21:33', 1, '2024-04-22 11:21:33', 2, NULL),
(7, 'IMG_0439.PNG', '21100245-4026-402f-bc81-5a826a30f657.png', '2024-04-23 10:54:28', 1, '2024-04-23 10:54:28', 2, NULL),
(11, 'IMG_0438-removebg12.png', '42a76326-b103-4b66-809f-87ab721f1e8c.png', '2024-04-23 13:32:54', 6, '2024-04-23 13:32:54', 2, NULL);

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

--
-- Dumping data for table `finalGrades`
--

INSERT INTO `finalGrades` (`studentYearId`, `subjectId`, `grade`, `credits`, `createdDate`) VALUES
(3, 1, 5, 10, '2024-04-04 14:46:39'),
(4, 1, 9.67, 10, '2024-04-04 18:42:16'),
(14, 1, 6.78, 10, '2024-04-14 13:59:29'),
(16, 1, 7.79, 10, '2024-04-19 17:54:19');

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
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `lastUsedTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deviceType` tinytext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `deviceToken` longtext COLLATE utf8mb4_0900_as_cs
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

--
-- Dumping data for table `logins`
--

INSERT INTO `logins` (`loginId`, `userId`, `createdDate`, `lastUsedTime`, `deviceType`, `deviceToken`) VALUES
(8, 1, '2024-03-24 19:24:48', '2024-03-24 19:24:48', 'web', NULL),
(9, 1, '2024-03-24 19:28:58', '2024-03-25 14:17:10', 'web', NULL),
(10, 1, '2024-03-25 14:18:28', '2024-03-25 14:18:28', 'web', NULL),
(11, 1, '2024-03-25 14:22:06', '2024-03-25 14:22:06', 'web', NULL),
(12, 1, '2024-03-25 14:23:37', '2024-03-25 14:23:37', 'web', NULL),
(13, 1, '2024-03-25 14:26:20', '2024-03-25 15:21:46', 'web', NULL),
(14, 1, '2024-03-25 15:25:53', '2024-03-25 19:11:35', 'web', NULL),
(15, 2, '2024-03-25 19:15:21', '2024-03-25 19:16:17', 'web', NULL),
(16, 1, '2024-03-25 19:16:23', '2024-03-25 19:16:23', 'web', NULL),
(17, 1, '2024-03-25 19:16:44', '2024-03-25 19:16:44', 'web', NULL),
(18, 2, '2024-03-25 19:16:52', '2024-03-25 19:16:52', 'web', NULL),
(19, 1, '2024-03-25 19:17:16', '2024-03-25 19:17:25', 'web', NULL),
(20, 2, '2024-03-25 19:17:31', '2024-03-25 19:21:40', 'web', NULL),
(21, 1, '2024-03-25 19:22:00', '2024-03-25 19:22:00', 'web', NULL),
(22, 2, '2024-03-25 19:22:12', '2024-03-26 08:56:47', 'web', NULL),
(23, 1, '2024-03-26 08:59:26', '2024-03-26 16:14:43', 'web', NULL),
(24, 2, '2024-03-26 16:14:50', '2024-03-26 17:19:20', 'web', NULL),
(25, 1, '2024-03-26 17:19:27', '2024-03-27 17:27:39', 'web', NULL),
(26, 3, '2024-03-27 17:28:05', '2024-03-27 17:28:10', 'web', NULL),
(27, 1, '2024-03-27 17:28:15', '2024-03-27 17:30:23', 'web', NULL),
(28, 1, '2024-03-27 17:30:43', '2024-03-27 17:43:08', 'web', NULL),
(29, 5, '2024-03-27 17:43:20', '2024-03-27 17:43:26', 'web', NULL),
(30, 1, '2024-03-27 17:43:32', '2024-04-07 10:28:10', 'web', NULL),
(31, 1, '2024-04-07 10:32:10', '2024-04-08 08:09:35', 'web', NULL),
(32, 1, '2024-04-08 08:16:55', '2024-04-10 12:45:53', 'web', NULL),
(33, 2, '2024-04-10 12:45:59', '2024-04-10 12:48:23', 'web', NULL),
(34, 1, '2024-04-10 12:48:33', '2024-04-10 15:29:04', 'web', NULL),
(35, 2, '2024-04-10 15:29:19', '2024-04-10 15:29:22', 'web', NULL),
(36, 6, '2024-04-10 15:29:39', '2024-04-10 15:29:41', 'web', NULL),
(37, 1, '2024-04-10 15:29:50', '2024-04-10 15:29:51', 'web', NULL),
(38, 6, '2024-04-10 15:29:57', '2024-04-10 15:29:57', 'web', NULL),
(39, 1, '2024-04-10 15:30:08', '2024-04-13 12:59:47', 'web', NULL),
(40, 2, '2024-04-12 14:01:17', '2024-04-12 14:35:50', 'web', NULL),
(41, 2, '2024-04-12 15:47:01', '2024-04-12 15:55:58', 'web', NULL),
(42, 2, '2024-04-13 12:44:50', '2024-04-13 12:52:09', 'web', NULL),
(43, 1, '2024-04-13 13:00:17', '2024-04-16 14:42:07', 'web', NULL),
(44, 2, '2024-04-14 14:03:01', '2024-04-14 14:49:26', 'web', NULL),
(45, 1, '2024-04-16 14:42:15', '2024-04-19 17:55:50', 'web', NULL),
(46, 6, '2024-04-19 17:58:28', '2024-04-19 18:12:48', 'web', NULL),
(47, 1, '2024-04-19 18:15:23', '2024-04-22 17:25:42', 'web', NULL),
(48, 6, '2024-04-22 16:45:56', '2024-04-22 17:20:39', 'web', NULL),
(49, 6, '2024-04-22 17:33:35', '2024-04-22 17:42:02', 'web', NULL),
(50, 1, '2024-04-22 17:42:16', '2024-04-22 17:42:26', 'web', NULL),
(51, 3, '2024-04-22 17:42:34', '2024-04-22 17:42:37', 'web', NULL),
(52, 6, '2024-04-22 17:42:46', '2024-04-22 17:58:01', 'web', NULL),
(53, 1, '2024-04-22 17:58:15', '2024-04-22 17:58:25', 'web', NULL),
(54, 6, '2024-04-22 17:58:31', '2024-04-22 17:58:33', 'web', NULL),
(55, 1, '2024-04-22 17:58:39', '2024-04-23 10:06:50', 'web', NULL),
(56, 6, '2024-04-23 10:07:36', '2024-04-23 10:31:46', 'web', NULL),
(57, 1, '2024-04-23 10:31:55', '2024-04-23 10:54:52', 'web', NULL),
(58, 6, '2024-04-23 10:54:59', '2024-04-23 13:50:44', 'web', NULL);

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
  `programType` tinytext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `programName` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `programShortName` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT '0',
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `schoolId` int NOT NULL
) ;

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`programId`, `programType`, `programName`, `programShortName`, `archived`, `createdDate`, `schoolId`) VALUES
(2, 'Bachelor', 'Computer Science for Economics1212', 'CSE12', 0, '2024-03-27 18:30:26', 2),
(4, 'Bachelor', 'Test', 'TST', 0, '2024-03-31 11:53:26', 1),
(5, 'Bachelor', 'Test4', 'tst4', 0, '2024-03-31 11:55:31', 3),
(6, 'Master', 'asdasd', 's', 0, '2024-03-31 11:58:43', 1);

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

--
-- Dumping data for table `schools`
--

INSERT INTO `schools` (`schoolId`, `universityId`, `schoolName`, `createdDate`) VALUES
(1, 1, 'Computer Science for Business', '2024-03-27 18:29:31'),
(2, 2, 'Computer Science for Business1212', '2024-03-27 18:29:31'),
(3, 1, 'Test', '2024-03-28 09:08:30'),
(4, 1, 'Test212', '2024-03-28 09:14:10');

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

--
-- Dumping data for table `studentsYears`
--

INSERT INTO `studentsYears` (`studentYearId`, `yearId`, `userId`, `studyYearId`, `createdDate`) VALUES
(1, 3, 2, 2, '2024-04-01 17:19:59'),
(3, 5, 2, 1, '2024-04-04 11:53:19'),
(4, 4, 2, 1, '2024-04-01 17:19:59'),
(5, 2, 2, 1, '2024-04-06 14:15:28'),
(6, 2, 6, 1, '2024-04-06 14:54:57'),
(7, 7, 7, 1, '2024-04-08 08:31:53'),
(14, 7, 2, 16, '2024-04-08 09:14:07'),
(15, 8, 7, 16, '2024-04-08 09:14:07'),
(16, 7, 6, 16, '2024-04-14 14:08:51');

-- --------------------------------------------------------

--
-- Table structure for table `studyYears`
--

CREATE TABLE `studyYears` (
  `studyYearId` int NOT NULL,
  `universityId` int NOT NULL,
  `fromYear` smallint NOT NULL,
  `toYear` smallint NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

--
-- Dumping data for table `studyYears`
--

INSERT INTO `studyYears` (`studyYearId`, `universityId`, `fromYear`, `toYear`, `createdDate`) VALUES
(1, 1, 2023, 2024, '2024-04-01 17:19:19'),
(2, 1, 2022, 2023, '2024-04-01 17:19:18'),
(16, 1, 2024, 2025, '2024-04-08 09:14:07');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `subjectId` int NOT NULL,
  `subjectName` longtext COLLATE utf8mb4_0900_as_cs NOT NULL,
  `credits` int NOT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT '0',
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `universityId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`subjectId`, `subjectName`, `credits`, `archived`, `createdDate`, `universityId`) VALUES
(1, 'Testefdef', 10, 0, '2024-03-28 12:52:23', 1),
(2, 'Test1212', 100, 0, '2024-03-28 13:00:22', 1);

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

--
-- Dumping data for table `universities`
--

INSERT INTO `universities` (`universityId`, `universityName`, `universityLongId`, `stripePubKey`, `stripePrivKey`, `createdDate`) VALUES
(1, 'Romanian-American University', '88fe381b-3679-40a8-9ce3-923f1f8556a3', '1', '1', '2024-03-24 10:27:07'),
(2, 'Romanian-American University12', '88fe381b-3679-40a8-9ce3-923f1f8556a4', '1', '1', '2024-03-24 10:27:07');

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
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs,
  `website` longtext COLLATE utf8mb4_0900_as_cs,
  `publicEmail` longtext COLLATE utf8mb4_0900_as_cs,
  `profileImageFileId` int DEFAULT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `disabled` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userId`, `universityId`, `email`, `hashedPassword`, `role`, `firstName`, `lastName`, `description`, `website`, `publicEmail`, `profileImageFileId`, `createdDate`, `disabled`) VALUES
(1, 1, 'axel.mircea@gmail.com', '1g4fbe652af1d56e1e97b321c41a99abe776e56ca9cf5ef1fec25df2338eb6b9601e6c7b99cf765a2bed1f86a5d44bb18d7212d96504e9cdaecc40549684a11c4b403223c12a9dc58976cbd908d412dafe', 3, 'Alexandru Mircea', 'Raducu', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut interdum nec nisl laoreet pharetra. Nam facilisis ullamcorper est ut facilisis. Maecenas sit amet consequat turpis. Aliquam sagittis purus et massa vestibulum tincidunt. Etiam est erat, condimentum ut tortor sed, vulputate varius erat. Quisque nec pharetra lectus. In eu turpis mi. Proin id massa et lacus consectetur sagittis. Aenean rhoncus a eros sit amet consectetur. Nullam aliquam tristique tortor, pharetra sodales sapien iaculis sed. Ut mattis nisl vitae nisl molestie tincidunt.', 'https://alxraducu.com', 'axel.mircea@gmail.com', NULL, '2024-03-24 10:30:52', 0),
(2, 1, 'axel.mircea1@gmail.com', '76l672085f92346a544b072c078ed9520742370c7f7aa31569006bf9fe0b439d09aa2b67e83e673426389a6fe15d2c65f3a28c057bac9e7d7a9f08287e7ee1cc3c1ad37f0a675396ee89538ea8c8b862fb4', 1, 'Alexandru Mircea123', 'Raducu12', NULL, NULL, NULL, NULL, '2024-03-24 10:30:52', 0),
(3, 1, 'axel.mircea3@gmail.com', '78h26d777dd4df0692b166c3c0513a56fff531b3b6e77aa7bbec77fc266d863b4775962f9a19135df7e60befae706ece00f12721ea107ebb904e83ce6a50f6a13d1448f2c7854873f0331b5cf877e2c7a62', 2, 'Alexandru Mircea12345', 'Raducu1235', NULL, NULL, NULL, NULL, '2024-03-24 10:30:52', 0),
(4, 1, 'axel.mircea4@gmail.com', '34t5c148e2a26edf441f91bbecf6dfa23db2793987237361fa5a61ae31cf582fd968aa990b923a678191ba8b17d527ae5274232be03ad2c41bb5160edcea8648a26ecdd507c1cfdeff76f3ec69be41fde2e', 2, 'Diana', 'Virginia', NULL, NULL, NULL, NULL, '2024-03-27 17:40:36', 1),
(5, 1, 'axel.mircea5@gmail.com', '61m063959501e309eb29c44884503f10873eef17bb5abae87d21b7c01dbdad9a64fa8e5b272548f3f06abb39826a099bab7478ad406ceb6329285594462a8f79c9a1c17590389656624a5687a72f97cdba3', 3, 'Alexandru', 'Alexandru', NULL, NULL, NULL, NULL, '2024-03-27 17:43:08', 0),
(6, 1, 'mircea.axel@gmail.com', '80w40a912e3d6db68c716b0da2fb033777e234e6b687a7958998c5086a3658683dc56eda08aec72211027a189e99e4125ccd61562f40f7399146cddf5992c6f4853ad08792c04159f44fc0a9002d2628003', 1, 'Test', 'Test1231', NULL, NULL, NULL, NULL, '2024-04-06 14:54:57', 0),
(7, 1, 'axel.mircea12@gmail.com', '115s6d284c18147f8ed1a7ebd1a279e833e4fd4db0715ef6591c28290bb3468d120f8eab6a870e7cdb4655db4dd55f8981a9e186e535bb19bd5c56567cffdc3fd86a92a8b3bed37e7fec5123ebe74174e572', 1, 'Diana', 'Virginia', NULL, NULL, NULL, NULL, '2024-04-08 08:31:53', 0);

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

--
-- Dumping data for table `years`
--

INSERT INTO `years` (`yearId`, `programId`, `yearIndex`, `createdDate`) VALUES
(2, 4, 1, '2024-03-31 11:53:26'),
(3, 5, 1, '2024-03-31 11:55:31'),
(4, 5, 2, '2024-03-31 11:55:31'),
(5, 6, 1, '2024-03-31 11:58:43'),
(7, 5, 3, '2024-04-01 09:51:41'),
(8, 5, 4, '2024-04-01 09:51:57');

-- --------------------------------------------------------

--
-- Table structure for table `yearsSubjects`
--

CREATE TABLE `yearsSubjects` (
  `yearId` int NOT NULL,
  `subjectId` int NOT NULL,
  `semesterIndex` tinyint NOT NULL,
  `createdDate` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `yearSubjectId` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_cs;

--
-- Dumping data for table `yearsSubjects`
--

INSERT INTO `yearsSubjects` (`yearId`, `subjectId`, `semesterIndex`, `createdDate`, `yearSubjectId`) VALUES
(2, 1, 1, '2024-03-31 11:53:26', 1),
(3, 1, 1, '2024-03-31 11:55:31', 2),
(3, 2, 2, '2024-03-31 11:55:31', 3),
(4, 1, 1, '2024-03-31 11:55:31', 4),
(5, 1, 1, '2024-03-31 11:58:43', 5),
(7, 1, 1, '2024-04-01 09:51:41', 6),
(8, 1, 1, '2024-04-01 09:51:57', 7);

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
  ADD KEY `classes_ibfk_2` (`yearSubjectId`);

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
  ADD KEY `schoolId` (`schoolId`);

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
  ADD PRIMARY KEY (`subjectId`),
  ADD KEY `universityId` (`universityId`);

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
  ADD PRIMARY KEY (`yearSubjectId`);

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
  MODIFY `announcementId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
  MODIFY `classId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `classesAssignments`
--
ALTER TABLE `classesAssignments`
  MODIFY `classAssigId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `classesMembers`
--
ALTER TABLE `classesMembers`
  MODIFY `classMemberId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `classesMessages`
--
ALTER TABLE `classesMessages`
  MODIFY `classMessageId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

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
  MODIFY `fileId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `filesPermissions`
--
ALTER TABLE `filesPermissions`
  MODIFY `filePermissionId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `logins`
--
ALTER TABLE `logins`
  MODIFY `loginId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

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
  MODIFY `schoolId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `studentGroups`
--
ALTER TABLE `studentGroups`
  MODIFY `groupId` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `studentsYears`
--
ALTER TABLE `studentsYears`
  MODIFY `studentYearId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `studyYears`
--
ALTER TABLE `studyYears`
  MODIFY `studyYearId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `subjectId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `universities`
--
ALTER TABLE `universities`
  MODIFY `universityId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `years`
--
ALTER TABLE `years`
  MODIFY `yearId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `yearsSubjects`
--
ALTER TABLE `yearsSubjects`
  MODIFY `yearSubjectId` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  ADD CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`yearSubjectId`) REFERENCES `yearsSubjects` (`yearSubjectId`) ON DELETE RESTRICT ON UPDATE RESTRICT;

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
  ADD CONSTRAINT `programs_ibfk_1` FOREIGN KEY (`schoolId`) REFERENCES `schools` (`schoolId`);

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
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`universityId`) REFERENCES `universities` (`universityId`);

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
