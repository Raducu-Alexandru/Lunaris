-- 1. Subjects
CREATE TABLE subjects (
    subjectId INT AUTO_INCREMENT PRIMARY KEY, subjectName LONGTEXT NOT NULL, credits INT NOT NULL, archived BOOLEAN NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 2. Universities
CREATE TABLE universities (
    universityId INT AUTO_INCREMENT PRIMARY KEY, universityName LONGTEXT NOT NULL, universityLongId VARCHAR(36) NOT NULL, stripePubKey VARCHAR(107) NOT NULL, stripePrivKey VARCHAR(107) NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 3. Schools
CREATE TABLE schools (
    schoolId INT AUTO_INCREMENT PRIMARY KEY, universityId INT NOT NULL, schoolName LONGTEXT NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 4. Announcements
CREATE TABLE announcements (
    announcementId INT AUTO_INCREMENT PRIMARY KEY, universityId INT NOT NULL, userId INT NOT NULL, fileId INT, content LONGTEXT NOT NULL, pinnedDate TIMESTAMP, editedDate TIMESTAMP, createdDate TIMESTAMP NOT NULL
);

-- 5. Programs
CREATE TABLE programs (
    programId INT AUTO_INCREMENT PRIMARY KEY, universityId INT NOT NULL, programType TINYTEXT NOT NULL CHECK (
        programType IN ('Bachelor', 'Master')
    ), programName LONGTEXT NOT NULL, programShortName LONGTEXT NOT NULL, archived BOOLEAN NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 6. Years
CREATE TABLE years (
    yearId INT AUTO_INCREMENT PRIMARY KEY, programId INT NOT NULL, yearIndex TINYINT NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 7. YearsSubjects
CREATE TABLE yearsSubjects (
    yearId INT NOT NULL, subjectId INT NOT NULL, semesterIndex TINYINT NOT NULL, createdDate TIMESTAMP NOT NULL, PRIMARY KEY (yearId, subjectId)
);

-- 8. Fees
CREATE TABLE fees (
    feeId INT AUTO_INCREMENT PRIMARY KEY, studyYearId INT NOT NULL, feeName LONGTEXT NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 9. FeesMembers
CREATE TABLE feesMembers (
    feeMemberId INT AUTO_INCREMENT PRIMARY KEY, feeId INT NOT NULL, userId INT, groupId INT, yearId INT NOT NULL, UNIQUE (
        feeId, userId, groupId, yearId
    ), createdDate TIMESTAMP NOT NULL
);

-- 10. StudentsYears
CREATE TABLE studentsYears (
    studentYearId INT AUTO_INCREMENT PRIMARY KEY, yearId INT NOT NULL, userId INT NOT NULL, studyYearId INT NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 11. Students (Note: The specifics for "other student personal details" are omitted for brevity)
CREATE TABLE students (
    userId INT PRIMARY KEY,
    -- Other student specific fields...
    createdDate TIMESTAMP NOT NULL
);

-- 12. FinalGrades
CREATE TABLE finalGrades (
    studentYearId INT NOT NULL, subjectId INT NOT NULL, grade FLOAT NOT NULL, credits INT NOT NULL, createdDate TIMESTAMP NOT NULL, PRIMARY KEY (studentYearId, subjectId)
);

-- 13. StudyYears
CREATE TABLE studyYears (
    studyYearId INT AUTO_INCREMENT PRIMARY KEY, universityId INT NOT NULL, fromYear TINYINT NOT NULL, toYear TINYINT NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 14. Classes
CREATE TABLE classes (
    classId INT AUTO_INCREMENT PRIMARY KEY, studyYearId INT NOT NULL, subjectId INT, classLongId VARCHAR(36) NOT NULL, className LONGTEXT, classPrefix LONGTEXT, classSuffix LONGTEXT, classDescription LONGTEXT, createdDate TIMESTAMP NOT NULL
);

-- 15. ClassesMembers
CREATE TABLE classesMembers (
    classMemberId INT AUTO_INCREMENT PRIMARY KEY, classId INT NOT NULL, userId INT, groupId INT, UNIQUE (classId, userId, groupId), createdDate TIMESTAMP NOT NULL
);

-- 16. ClassesMessages
CREATE TABLE classesMessages (
    classMessageId INT AUTO_INCREMENT PRIMARY KEY, classId INT NOT NULL, userId INT NOT NULL, fileId INT, content LONGTEXT NOT NULL, pinnedDate TIMESTAMP, editedDate TIMESTAMP, createdDate TIMESTAMP NOT NULL
);

-- 17. ClassesAssignments
CREATE TABLE classesAssignments (
    classAssigId INT AUTO_INCREMENT PRIMARY KEY, classId INT NOT NULL, classAssigName LONGTEXT NOT NULL, classAssigDesc LONGTEXT NOT NULL, dueDate TIMESTAMP NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 18. ClassesFiles
CREATE TABLE classesFiles (
    classId INT NOT NULL, fileId INT NOT NULL, createdDate TIMESTAMP NOT NULL, PRIMARY KEY (classId, fileId)
);

-- 19. ClassesAssignmentsGrades
CREATE TABLE classesAssignmentsGrades (
    classAssigId INT NOT NULL, userId INT NOT NULL, grade FLOAT, handedInDate TIMESTAMP, createdDate TIMESTAMP NOT NULL, PRIMARY KEY (classAssigId, userId)
);

-- 20. ClassesAssignmentsFiles
CREATE TABLE classesAssignmentsFiles (
    classAssigId INT NOT NULL, fileId INT NOT NULL, createdDate TIMESTAMP NOT NULL, PRIMARY KEY (classAssigId, fileId)
);

-- 21. ClassesAssignmentsUserFiles
CREATE TABLE classesAssignmentsUserFiles (
    classAssigId INT NOT NULL, userId INT NOT NULL, fileId INT NOT NULL, createdDate TIMESTAMP NOT NULL, PRIMARY KEY (classAssigId, userId, fileId)
);

-- 22. Payments
CREATE TABLE payments (
    paymentId INT AUTO_INCREMENT PRIMARY KEY, feeId INT NOT NULL, userId INT NOT NULL, amount FLOAT NOT NULL, clientSecret VARCHAR(60) NOT NULL, purchaseStatus TINYINT NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 23. FeesFee
CREATE TABLE feesFee (
    feesFeeId INT AUTO_INCREMENT PRIMARY KEY, feeId INT NOT NULL, fromDate TIMESTAMP NOT NULL, toDate TIMESTAMP NOT NULL, amount FLOAT NOT NULL, isoCurrency TINYTEXT NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 24. Groups
CREATE TABLE studentGroups (
    groupId INT AUTO_INCREMENT PRIMARY KEY, universityId INT NOT NULL, groupName LONGTEXT NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 25. Admins (Assuming details similar to users)
CREATE TABLE admins (
    userId INT PRIMARY KEY,
    -- Other admin specific fields...
    createdDate TIMESTAMP NOT NULL
);

-- 26. FullAdmins (Assuming details similar to users)
CREATE TABLE fullAdmins (
    userId INT PRIMARY KEY,
    -- Other full-admin specific fields...
    createdDate TIMESTAMP NOT NULL
);

-- 27. GroupsMembers
CREATE TABLE groupsMembers (
    groupId INT NOT NULL, userId INT NOT NULL, createdDate TIMESTAMP NOT NULL, PRIMARY KEY (groupId, userId)
);

-- 28. Professors (Assuming details similar to users)
CREATE TABLE professors (
    userId INT PRIMARY KEY,
    -- Other professor specific fields...
    createdDate TIMESTAMP NOT NULL
);

-- 29. Users
CREATE TABLE users (
    userId INT AUTO_INCREMENT PRIMARY KEY, universityId INT NOT NULL, email VARCHAR(64) NOT NULL UNIQUE, hashedPassword LONGTEXT NOT NULL, role TINYINT NOT NULL, firstName LONGTEXT NOT NULL, lastName LONGTEXT NOT NULL, `desc` LONGTEXT, website LONGTEXT, publicEmail LONGTEXT, profileImageFileId INT, createdDate TIMESTAMP NOT NULL, disabled BOOLEAN NOT NULL
);

-- 30. ContactInfoPhone
CREATE TABLE contactInfoPhone (
    userId INT PRIMARY KEY, phone LONGTEXT NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 31. ContactInfoEmail
CREATE TABLE contactInfoEmail (
    userId INT PRIMARY KEY, email LONGTEXT NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 32. Alerts
CREATE TABLE alerts (
    alertId INT AUTO_INCREMENT PRIMARY KEY, userId INT NOT NULL, content LONGTEXT NOT NULL, createdDate TIMESTAMP NOT NULL, untilDate TIMESTAMP NOT NULL
);

-- 33. Logins
CREATE TABLE logins (
    loginId INT AUTO_INCREMENT PRIMARY KEY, userId INT NOT NULL, expDate TIMESTAMP NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 34. Files
CREATE TABLE files (
    fileId INT AUTO_INCREMENT PRIMARY KEY, fileName LONGTEXT NOT NULL, storedFileName LONGTEXT NOT NULL, createdDate TIMESTAMP NOT NULL, lastModifiedUserId INT NOT NULL, lastModifiedDate TIMESTAMP NOT NULL, fileType TINYINT NOT NULL, parentId INT
);

-- 35. FilesPermissions
CREATE TABLE filesPermissions (
    filePermissionId INT AUTO_INCREMENT PRIMARY KEY, fileId INT NOT NULL, userId INT, groupId INT, permissionType INT NOT NULL, createdDate TIMESTAMP NOT NULL
    -- Note: Consider adding UNIQUE constraints to ensure that combinations of fileId, userId, and groupId are unique.
);

-- 36. Chats
CREATE TABLE chats (
    chatId INT AUTO_INCREMENT PRIMARY KEY, userId1 INT NOT NULL, userId2 INT NOT NULL, createdDate TIMESTAMP NOT NULL
);

-- 37. ChatsMessages
CREATE TABLE chatsMessages (
    chatMessageId INT AUTO_INCREMENT PRIMARY KEY, chatId INT NOT NULL, userId INT NOT NULL, fileId INT, content LONGTEXT NOT NULL, delivered BOOLEAN NOT NULL, seen BOOLEAN NOT NULL, createdDate TIMESTAMP NOT NULL
);

ALTER TABLE students
ADD COLUMN personalNumericCode LONGTEXT,
ADD COLUMN dateOfBirth DATE NOT NULL,
ADD COLUMN seriesAndCINumber LONGTEXT,
ADD COLUMN ciIssueDate DATE,
ADD COLUMN ciExpiryDate DATE,
ADD COLUMN gender LONGTEXT NOT NULL,
ADD COLUMN birthCountry LONGTEXT NOT NULL,
ADD COLUMN birthCity LONGTEXT NOT NULL,
ADD COLUMN maritalStatus LONGTEXT NOT NULL,
ADD COLUMN fatherFirstName LONGTEXT,
ADD COLUMN motherFirstName LONGTEXT,
ADD COLUMN citizenship LONGTEXT NOT NULL,
ADD COLUMN ethnicity LONGTEXT,
ADD COLUMN ppSeriesAndNumber LONGTEXT,
ADD COLUMN ppIssueDate DATE,
ADD COLUMN ppExpiryDate DATE,
ADD COLUMN nationality LONGTEXT NOT NULL,
ADD COLUMN highSchoolGraduate LONGTEXT NOT NULL,
ADD COLUMN graduationYear INT NOT NULL,
ADD COLUMN graduationCity LONGTEXT NOT NULL,
ADD COLUMN preUniversityCountry LONGTEXT NOT NULL,
ADD COLUMN preUniversityCounty LONGTEXT NOT NULL,
ADD COLUMN preUniversityBranch LONGTEXT NOT NULL,
ADD COLUMN specialization LONGTEXT NOT NULL,
ADD COLUMN educationForm LONGTEXT NOT NULL,
ADD COLUMN profile LONGTEXT NOT NULL,
ADD COLUMN diplomaType LONGTEXT NOT NULL,
ADD COLUMN diplomaSeriesAndNumber LONGTEXT NOT NULL,
ADD COLUMN diplomaIssuer LONGTEXT NOT NULL,
ADD COLUMN linguisticCertificate LONGTEXT,
ADD COLUMN preUniversityMedia FLOAT,
ADD COLUMN universitySchoolGraduate LONGTEXT,
ADD COLUMN universityGraduationYear INT,
ADD COLUMN universityCountry LONGTEXT,
ADD COLUMN universityCounty LONGTEXT,
ADD COLUMN universityCity LONGTEXT,
ADD COLUMN universityBranch LONGTEXT,
ADD COLUMN universityProgram LONGTEXT,
ADD COLUMN universityDiplomaIssuer LONGTEXT,
ADD COLUMN universityDiplomaType LONGTEXT,
ADD COLUMN universityDiplomaSeriesAndNumber LONGTEXT,
ADD COLUMN universityDiplomaIssueYear INT,
ADD COLUMN universityMedia FLOAT;

ALTER TABLE subjects
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE universities
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE schools
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE announcements
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE programs
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE years MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE yearsSubjects
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE fees MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE feesMembers
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE studentsYears
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE students
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE finalGrades
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE studyYears
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE classes
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE classesMembers
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE classesMessages
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE classesAssignments
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE classesFiles
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE classesAssignmentsGrades
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE classesAssignmentsFiles
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE classesAssignmentsUserFiles
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE payments
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE feesFee
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE studentGroups
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE admins MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE fullAdmins
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE groupsMembers
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE professors
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE users MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE contactInfoPhone
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE contactInfoEmail
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE alerts MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE logins MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE files MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE filesPermissions
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE chats MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE chatsMessages
MODIFY COLUMN createdDate TIMESTAMP DEFAULT NOW();

ALTER TABLE schools
ADD CONSTRAINT FOREIGN KEY (universityId) REFERENCES universities (universityId);

ALTER TABLE announcements
ADD CONSTRAINT FOREIGN KEY (universityId) REFERENCES universities (universityId);

ALTER TABLE announcements
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE announcements
ADD CONSTRAINT FOREIGN KEY (fileId) REFERENCES files (fileId);

ALTER TABLE programs
ADD CONSTRAINT FOREIGN KEY (universityId) REFERENCES universities (universityId);

ALTER TABLE years
ADD CONSTRAINT FOREIGN KEY (programId) REFERENCES programs (programId);

ALTER TABLE yearsSubjects
ADD CONSTRAINT FOREIGN KEY (yearId) REFERENCES years (yearId);

ALTER TABLE yearsSubjects
ADD CONSTRAINT FOREIGN KEY (subjectId) REFERENCES subjects (subjectId);

ALTER TABLE fees
ADD CONSTRAINT FOREIGN KEY (studyYearId) REFERENCES studyYears (studyYearId);

ALTER TABLE feesMembers
ADD CONSTRAINT FOREIGN KEY (feeId) REFERENCES fees (feeId);

ALTER TABLE feesMembers
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE feesMembers
ADD CONSTRAINT FOREIGN KEY (groupId) REFERENCES studentGroups (groupId);

ALTER TABLE feesMembers
ADD CONSTRAINT FOREIGN KEY (yearId) REFERENCES years (yearId);

ALTER TABLE studentsYears
ADD CONSTRAINT FOREIGN KEY (yearId) REFERENCES years (yearId);

ALTER TABLE studentsYears
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE studentsYears
ADD CONSTRAINT FOREIGN KEY (studyYearId) REFERENCES studyYears (studyYearId);

ALTER TABLE students
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE finalGrades
ADD CONSTRAINT FOREIGN KEY (studentYearId) REFERENCES studentsYears (studentYearId);

ALTER TABLE finalGrades
ADD CONSTRAINT FOREIGN KEY (subjectId) REFERENCES subjects (subjectId);

ALTER TABLE studyYears
ADD CONSTRAINT FOREIGN KEY (universityId) REFERENCES universities (universityId);

ALTER TABLE classes
ADD CONSTRAINT FOREIGN KEY (studyYearId) REFERENCES studyYears (studyYearId);

ALTER TABLE classes
ADD CONSTRAINT FOREIGN KEY (subjectId) REFERENCES subjects (subjectId);

ALTER TABLE classesMembers
ADD CONSTRAINT FOREIGN KEY (classId) REFERENCES classes (classId);

ALTER TABLE classesMembers
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE classesMembers
ADD CONSTRAINT FOREIGN KEY (groupId) REFERENCES studentGroups (groupId);

ALTER TABLE classesMessages
ADD CONSTRAINT FOREIGN KEY (classId) REFERENCES classes (classId);

ALTER TABLE classesMessages
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE classesMessages
ADD CONSTRAINT FOREIGN KEY (fileId) REFERENCES files (fileId);

ALTER TABLE classesAssignments
ADD CONSTRAINT FOREIGN KEY (classId) REFERENCES classes (classId);

ALTER TABLE classesFiles
ADD CONSTRAINT FOREIGN KEY (classId) REFERENCES classes (classId);

ALTER TABLE classesFiles
ADD CONSTRAINT FOREIGN KEY (fileId) REFERENCES files (fileId);

ALTER TABLE classesAssignmentsGrades
ADD CONSTRAINT FOREIGN KEY (classAssigId) REFERENCES classesAssignments (classAssigId);

ALTER TABLE classesAssignmentsGrades
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE classesAssignmentsFiles
ADD CONSTRAINT FOREIGN KEY (classAssigId) REFERENCES classesAssignments (classAssigId);

ALTER TABLE classesAssignmentsFiles
ADD CONSTRAINT FOREIGN KEY (fileId) REFERENCES files (fileId);

ALTER TABLE classesAssignmentsUserFiles
ADD CONSTRAINT FOREIGN KEY (classAssigId) REFERENCES classesAssignments (classAssigId);

ALTER TABLE classesAssignmentsUserFiles
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE classesAssignmentsUserFiles
ADD CONSTRAINT FOREIGN KEY (fileId) REFERENCES files (fileId);

ALTER TABLE payments
ADD CONSTRAINT FOREIGN KEY (feeId) REFERENCES fees (feeId);

ALTER TABLE payments
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE feesFee
ADD CONSTRAINT FOREIGN KEY (feeId) REFERENCES fees (feeId);

ALTER TABLE studentGroups
ADD CONSTRAINT FOREIGN KEY (universityId) REFERENCES universities (universityId);

ALTER TABLE admins
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE fullAdmins
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE groupsMembers
ADD CONSTRAINT FOREIGN KEY (groupId) REFERENCES studentGroups (groupId);

ALTER TABLE groupsMembers
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE professors
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE users
ADD CONSTRAINT FOREIGN KEY (universityId) REFERENCES universities (universityId);

ALTER TABLE users
ADD CONSTRAINT FOREIGN KEY (profileImageFileId) REFERENCES files (fileId);

ALTER TABLE contactInfoPhone
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE contactInfoEmail
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE alerts
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE logins
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE files
ADD CONSTRAINT FOREIGN KEY (lastModifiedUserId) REFERENCES users (userId);

ALTER TABLE files
ADD CONSTRAINT FOREIGN KEY (parentId) REFERENCES files (fileId);

ALTER TABLE filesPermissions
ADD CONSTRAINT FOREIGN KEY (fileId) REFERENCES files (fileId);

ALTER TABLE filesPermissions
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE filesPermissions
ADD CONSTRAINT FOREIGN KEY (groupId) REFERENCES studentGroups (groupId);

ALTER TABLE chats
ADD CONSTRAINT FOREIGN KEY (userId1) REFERENCES users (userId);

ALTER TABLE chats
ADD CONSTRAINT FOREIGN KEY (userId2) REFERENCES users (userId);

ALTER TABLE chatsMessages
ADD CONSTRAINT FOREIGN KEY (chatId) REFERENCES chats (chatId);

ALTER TABLE chatsMessages
ADD CONSTRAINT FOREIGN KEY (userId) REFERENCES users (userId);

ALTER TABLE chatsMessages
ADD CONSTRAINT FOREIGN KEY (fileId) REFERENCES files (fileId);