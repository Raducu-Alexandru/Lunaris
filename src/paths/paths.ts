import { Router, Request, Response } from 'express';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';
import { DbHandler, NormalPacket, SelectPacket } from '@raducualexandrumircea/custom-db-handler';
import { LoginMethods, LoginMethodsInterface } from '@raducualexandrumircea/lunaris-login';
import { AccountMethods } from '@raducualexandrumircea/lunaris-account';
import { SessionInterface } from '@raducualexandrumircea/redis-session-manager';
import {
	AdminEventDetails,
	CustomResponseObject,
	ProgamPreviewDetails,
	ProgramEditDetails,
	ProgramYearEditDetails,
	SchoolEditDetails,
	SchoolPreviewDetails,
	StudentProgramPreviewDetails,
	StudentYearsDetails,
	StudyYearDetails,
	StudyYearStudentDetails,
	SubjectEditDetails,
	SubjectPreviewDetails,
	SubjectScholarSituation,
	UserEditDetails,
	UserTableDetails,
	YearEditDetails,
	YearPreviewDetails,
} from '@raducualexandrumircea/lunaris-interfaces';
import multer from 'multer';
import { saveImage } from '@raducualexandrumircea/lunaris-file';
import { checkIfEmailIsValid } from '@raducualexandrumircea/lunaris-regex-checks';
import { LoginAuthenticate } from '@raducualexandrumircea/login-authenticate';
import * as xl from 'excel4node';
import { formatDate, handleEventManagerMiddleware } from '@raducualexandrumircea/lunaris-general';

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

export function appRoutes(router: Router, dbConnection: DbHandler, loginMethodsObj: LoginMethods, accountMethodsObj: AccountMethods, upload: multer.Multer) {
	router.get('/', async (req: Request, res: Response) => {
		res.status(200).send(environmentParserObj.get('SERVER_NAME', 'string', false) || 'root path works');
	});

	router.get('/get/admin-events', async (req: Request, res: Response) => {
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var adminEventsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT adminEvents.adminEventId, adminEvents.message, adminEvents.createdDate, users.role, users.email FROM adminEvents
INNER JOIN users ON users.userId = adminEvents.userId
WHERE users.universityId = ?
ORDER BY adminEvents.createdDate DESC`,
			[universityId]
		);
		var adminEventsDetails: AdminEventDetails[] = [];
		for (var i = 0; i < adminEventsSqlResult.length; i++) {
			adminEventsDetails.push({
				adminEventId: adminEventsSqlResult[i].adminEventId,
				createdDate: adminEventsSqlResult[i].createdDate.getTime(),
				email: adminEventsSqlResult[i].email,
				role: adminEventsSqlResult[i].role == 3 ? 'Admin' : adminEventsSqlResult[i].role == 2 ? 'Professor' : adminEventsSqlResult[i].role == 1 ? 'Student' : 'No role',
				message: adminEventsSqlResult[i].message,
			});
		}
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				adminEventsDetails: adminEventsDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/excel/student/scholar-situation/:studentYearId', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		var studentYearId: number = parseInt(req.params.studentYearId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var excelSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT programs.programShortName, years.yearIndex, users.email, CONCAT_WS(' ', users.firstName, users.lastName) as fullName, yearsSubjects.subjectId, finalGrades.grade, finalGrades.credits as finalGradesCredits, subjects.credits as subjectsCredits, subjects.subjectName, yearsSubjects.semesterIndex FROM yearsSubjects
INNER JOIN years ON years.yearId = yearsSubjects.yearId
INNER JOIN programs ON programs.programId = years.programId
INNER JOIN studentsYears ON studentsYears.yearId = years.yearId
INNER JOIN subjects ON subjects.subjectId = yearsSubjects.subjectId
INNER JOIN users ON users.userId = studentsYears.userId
LEFT JOIN finalGrades ON finalGrades.studentYearId = studentsYears.studentYearId
WHERE users.universityId = ? AND studentsYears.studentYearId = ?
ORDER BY yearsSubjects.semesterIndex ASC`,
			[universityId, studentYearId]
		);
		var wb = new xl.Workbook();
		var mainSheet = wb.addWorksheet("Student's Grades");
		mainSheet.cell(1, 1).string('SubjectId');
		mainSheet.cell(1, 2).string('SubjectName');
		mainSheet.cell(1, 3).string('SemesterIndex');
		mainSheet.cell(1, 4).string('Grade');
		mainSheet.cell(1, 5).string('Credits');
		var leftAlignStyle = wb.createStyle({
			alignment: {
				horizontal: 'left',
			},
		});
		for (var i = 0; i < excelSqlResult.length; i++) {
			mainSheet
				.cell(i + 2, 1)
				.number(excelSqlResult[i].subjectId)
				.style(leftAlignStyle);
			mainSheet.cell(i + 2, 2).string(excelSqlResult[i].subjectName);
			mainSheet
				.cell(i + 2, 3)
				.number(excelSqlResult[i].semesterIndex)
				.style(leftAlignStyle);
			mainSheet
				.cell(i + 2, 4)
				.number(excelSqlResult[i].grade || 0)
				.style(leftAlignStyle);
			mainSheet
				.cell(i + 2, 5)
				.number(excelSqlResult[i].finalGradesCredits || excelSqlResult[i].subjectsCredits)
				.style(leftAlignStyle);
		}
		mainSheet.column(1).setWidth(10);
		mainSheet.column(2).setWidth(50);
		mainSheet.column(3).setWidth(10);
		mainSheet.column(4).setWidth(10);
		mainSheet.column(4).setWidth(10);
		var buffer: Buffer = await wb.writeToBuffer();
		res['adminEventDataObj'] = {
			userId: userId,
			message: `Downloaded Excel Grades for Student ${excelSqlResult[0].email} Year ${excelSqlResult[0].yearIndex} ${excelSqlResult[0].programShortName}`,
		};
		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader(
			'Content-Disposition',
			'attachment; filename=' +
				`Student ${excelSqlResult[0].fullName} (${excelSqlResult[0].email}) Year ${excelSqlResult[0].yearIndex} ${excelSqlResult[0].programShortName} Grades (${formatDate(new Date())}).xlsx`
		);
		res.status(200);
		res.end(buffer);
		return;
	});

	router.post('/create/study-year', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			fromYear: number;
			toYear: number;
			selectMode: number;
			studentUserIds: number[];
		}
		var body: CurrentBody = req.body;
		var responseObject: CustomResponseObject;
		if (!('selectMode' in body && 'studentUserIds' in body && 'fromYear' in body && 'toYear' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var fromYear: number = body.fromYear;
		var toYear: number = body.toYear;
		var selectMode: number = body.selectMode;
		var studentUserIds: number[] = body.studentUserIds;
		if (fromYear >= toYear || fromYear < new Date().getFullYear()) {
			responseObject = {
				succ: false,
				mes: 'Please select a valid from year and to year',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (selectMode != 0 && selectMode != 1) {
			responseObject = {
				succ: false,
				mes: 'Please select a valid select mode',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (selectMode == 1 && studentUserIds.length == 0) {
			responseObject = {
				succ: false,
				mes: 'Please enter at least one student to be transferred',
			};
			res.status(200).send(responseObject);
			return;
		}
		var transaction = await dbConnection.startTransaction();
		try {
			var studyYearNormalSqlResult: NormalPacket = await dbConnection.executeInTransaction<NormalPacket>(transaction, 'INSERT INTO studyYears (universityId, fromYear, toYear) VALUES (?, ?, ?)', [
				universityId,
				fromYear,
				toYear,
			]);
			var studentsSql: string = `SELECT studentsYears.userId, MAX(years.yearIndex) AS maxYearIndex, years.programId FROM studentsYears
INNER JOIN years ON years.yearId = studentsYears.yearId
INNER JOIN users ON users.userId = studentsYears.userId
WHERE users.universityId = ? AND users.role = 1 AND users.disabled = ?`;
			for (var _ of studentUserIds) {
				if (selectMode == 0) {
					studentsSql += ' AND studentsYears.userId != ?';
				} else if (selectMode == 1) {
					studentsSql += ' OR studentsYears.userId = ?';
				}
			}
			studentsSql += '\nGROUP BY years.programId, users.userId';
			var studentsSqlResult: SelectPacket = await dbConnection.executeInTransaction<SelectPacket>(transaction, studentsSql, [universityId, false].concat(studentUserIds));
			console.log(studentsSqlResult);
			if (studentsSqlResult.length == 0) {
				await dbConnection.rollbackTransactionAndClose(transaction);
				responseObject = {
					succ: false,
					mes: 'After applying the filter there were no students',
				};
				res.status(200).send(responseObject);
				return;
			}
			var nextYearSqlResult: SelectPacket;
			for (var i = 0; i < studentsSqlResult.length; i++) {
				nextYearSqlResult = await dbConnection.executeInTransaction<SelectPacket>(transaction, 'SELECT years.yearId FROM years WHERE years.programId = ? AND years.yearIndex = ?', [
					studentsSqlResult[i].programId,
					studentsSqlResult[i].maxYearIndex + 1,
				]);
				if (nextYearSqlResult.length != 1) {
					continue;
				}
				await dbConnection.executeInTransaction<NormalPacket>(transaction, 'INSERT INTO studentsYears (yearId, userId, studyYearId) VALUES (?, ?, ?)', [
					nextYearSqlResult[0].yearId,
					studentsSqlResult[i].userId,
					studyYearNormalSqlResult.insertId,
				]);
			}
			await dbConnection.commitTransactionAndClose(transaction);
		} catch (err) {
			await dbConnection.rollbackTransactionAndClose(transaction);
			responseObject = {
				succ: false,
				mes: String(err),
			};
			res.status(200).send(responseObject);
			return;
		}
		res['adminEventDataObj'] = {
			userId: userId,
			message: 'Created a new study year',
		};
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/get/student-id/from/email', async (req: Request, res: Response) => {
		interface CurrentBody {
			email: string;
		}
		var body: CurrentBody = req.body;
		var responseObject: CustomResponseObject;
		if (!('email' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var email: string = body.email;
		var studentEmailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT userId, disabled FROM users WHERE email = ? AND universityId = ? AND role = 1', [email, universityId]);
		if (studentEmailSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'There is no student with that email under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (studentEmailSqlResult[0].disabled) {
			responseObject = {
				succ: false,
				mes: 'The student is disabled',
			};
			res.status(200).send(responseObject);
			return;
		}
		var studyYearStudentDetails: StudyYearStudentDetails = {
			userId: studentEmailSqlResult[0].userId,
			email: email,
		};
		responseObject = {
			succ: true,
			data: {
				studyYearStudentDetails: studyYearStudentDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/study-year/:studyYearId?', async (req: Request, res: Response) => {
		var studyYearId: number = parseInt(req.params.studyYearId) || null;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var responseObject: CustomResponseObject;
		var studyYearSqlResult: SelectPacket;
		if (studyYearId) {
			studyYearSqlResult = await dbConnection.execute<SelectPacket>('SELECT studyYearId, fromYear, toYear FROM studyYears WHERE universityId = ? AND studyYearId = ?', [universityId, studyYearId]);
		} else {
			studyYearSqlResult = await dbConnection.execute<SelectPacket>('SELECT studyYearId, fromYear, toYear FROM studyYears WHERE universityId = ? ORDER BY createdDate DESC LIMIT 1', [universityId]);
		}
		if (studyYearSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'There is no study year created',
			};
			res.status(200).send(responseObject);
			return;
		}
		var studyYearDetails: StudyYearDetails = {
			studyYearId: studyYearSqlResult[0].studyYearId,
			fromYear: studyYearSqlResult[0].fromYear,
			toYear: studyYearSqlResult[0].toYear,
		};
		responseObject = {
			succ: true,
			data: {
				studyYearDetails: studyYearDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/create/student', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			firstName: string;
			lastName: string;
			email: string;
			password: string;
			yearIds: number[];
		}
		var body: CurrentBody = req.body;
		var responseObject: CustomResponseObject;
		if (!('firstName' in body && 'lastName' in body && 'email' in body && 'password' in body && 'yearIds' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var firstName: string = body.firstName;
		var lastName: string = body.lastName;
		var email: string = body.email;
		var password: string = body.password;
		var yearIds: number[] = body.yearIds;
		if (!firstName) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid firstname',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!lastName) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid lastname',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!checkIfEmailIsValid(email)) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid email',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!password) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid password',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (yearIds.length == 0) {
			responseObject = {
				succ: false,
				mes: 'Please select at least one program',
			};
			res.status(200).send(responseObject);
			return;
		}
		var emailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT userId FROM users WHERE email = ?', [email]);
		if (emailSqlResult.length != 0) {
			responseObject = {
				succ: false,
				mes: 'This email is already in use',
			};
			res.status(200).send(responseObject);
			return;
		}
		var getLastStudyYearIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT studyYearId FROM studyYears WHERE universityId = ? ORDER BY createdDate DESC LIMIT 1', [
			universityId,
		]);
		if (getLastStudyYearIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'There is no study year created',
			};
			res.status(200).send(responseObject);
			return;
		}
		var transaction = await dbConnection.startTransaction();
		try {
			var loginAuthenticateObj: LoginAuthenticate = new LoginAuthenticate();
			var hashedPassword: string = loginAuthenticateObj.hashPassword(password);
			var insertUserNormalPacket = await dbConnection.executeInTransaction<NormalPacket>(
				transaction,
				'INSERT INTO users (universityId, email, hashedPassword, role, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?)',
				[universityId, email, hashedPassword, 1, firstName, lastName]
			);
			var checkYearIdSqlResult: SelectPacket;
			for (var i = 0; i < yearIds.length; i++) {
				checkYearIdSqlResult = await dbConnection.executeInTransaction<SelectPacket>(
					transaction,
					`SELECT years.yearId FROM years
INNER JOIN programs ON years.programId = programs.programId
INNER JOIN schools ON programs.schoolId = schools.schoolId
WHERE years.yearId = ? AND schools.universityId = ?`,
					[yearIds[i], universityId]
				);
				if (checkYearIdSqlResult.length != 1) {
					await dbConnection.rollbackTransactionAndClose(transaction);
					responseObject = {
						succ: false,
						mes: 'You don not permissions to use this year as is not under your university',
					};
					res.status(200).send(responseObject);
					return;
				}
				await dbConnection.executeInTransaction<NormalPacket>(transaction, 'INSERT INTO studentsYears (yearId, userId, studyYearId) VALUES (?, ?, ?)', [
					yearIds[i],
					insertUserNormalPacket.insertId,
					getLastStudyYearIdSqlResult[0].studyYearId,
				]);
			}
			await dbConnection.commitTransactionAndClose(transaction);
		} catch (err) {
			await dbConnection.rollbackTransactionAndClose(transaction);
			responseObject = {
				succ: false,
				mes: String(err),
			};
			res.status(200).send(responseObject);
			return;
		}
		res['adminEventDataObj'] = {
			userId: userId,
			message: `Create a new student ${firstName} ${lastName}`,
		};
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/update/scholar-situation', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			studentYearId: number;
			subjectId: number;
			grade: number;
			isInserting: boolean;
		}
		var body: CurrentBody = req.body;
		var responseObject: CustomResponseObject;
		if (!('studentYearId' in body && 'subjectId' in body && 'isInserting' in body && 'grade' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var studentYearId: number = body.studentYearId;
		var subjectId: number = body.subjectId;
		var isInserting: boolean = body.isInserting;
		var grade: number = body.grade;
		var checkStudentYearIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT studentsYears.userId, CONCAT_WS(' ', users.firstName, users.lastName) as fullName FROM studentsYears
INNER JOIN users ON users.userId = studentsYears.userId
WHERE users.universityId = ? AND studentsYears.studentYearId = ?`,
			[universityId, studentYearId]
		);
		if (checkStudentYearIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to use this student year as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		var checkSubjectIdSqlResult = await dbConnection.execute<SelectPacket>('SELECT subjectName, subjectId FROM subjects WHERE universityId = ? AND subjectId = ?', [universityId, subjectId]);
		if (checkSubjectIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to use this subject as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (isInserting) {
			var getSubjectCreditsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT credits FROM subjects WHERE subjectId = ?', [subjectId]);
			if (getSubjectCreditsSqlResult.length != 1) {
				responseObject = {
					succ: false,
					mes: 'Could not get credits for this subject',
				};
				res.status(200).send(responseObject);
				return;
			}
			await dbConnection.execute<NormalPacket>('INSERT INTO finalGrades (studentYearId, subjectId, grade, credits) VALUES (?, ?, ?, ?)', [
				studentYearId,
				subjectId,
				grade,
				getSubjectCreditsSqlResult[0].credits,
			]);
			res['adminEventDataObj'] = {
				userId: userId,
				message: `Set a new grade ${grade} for ${checkStudentYearIdSqlResult[0].fullName}, subject ${checkSubjectIdSqlResult[0].subjectName}`,
			};
		} else {
			await dbConnection.execute<NormalPacket>('UPDATE finalGrades SET grade = ? WHERE studentYearId = ? AND subjectId = ?', [grade, studentYearId, subjectId]);
			res['adminEventDataObj'] = {
				userId: userId,
				message: `Updated a grade ${grade} for ${checkStudentYearIdSqlResult[0].fullName}, subject ${checkSubjectIdSqlResult[0].subjectName}`,
			};
		}
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/scholar-situation/:studentYearId', async (req: Request, res: Response) => {
		var studentYearId: number = parseInt(req.params.studentYearId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var scholarSituationSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT yearsSubjects.subjectId, finalGrades.grade, finalGrades.credits as finalGradesCredits, subjects.credits as subjectsCredits, subjects.subjectName, yearsSubjects.semesterIndex FROM yearsSubjects
INNER JOIN years ON years.yearId = yearsSubjects.yearId
INNER JOIN studentsYears ON studentsYears.yearId = years.yearId
INNER JOIN subjects ON subjects.subjectId = yearsSubjects.subjectId
INNER JOIN users ON users.userId = studentsYears.userId
LEFT JOIN finalGrades ON finalGrades.studentYearId = studentsYears.studentYearId
WHERE users.universityId = ? AND studentsYears.studentYearId = ?
ORDER BY yearsSubjects.semesterIndex ASC`,
			[universityId, studentYearId]
		);
		var subjectsScholarSituation: SubjectScholarSituation[] = [];
		var media: number = 0;
		var mediaCount: number = 0;
		var totalCredits: number = 0;
		var outOfCredits: number = 0;
		for (var i = 0; i < scholarSituationSqlResult.length; i++) {
			subjectsScholarSituation.push({
				subjectId: scholarSituationSqlResult[i].subjectId,
				subjectName: scholarSituationSqlResult[i].subjectName,
				semesterIndex: scholarSituationSqlResult[i].semesterIndex,
				grade: scholarSituationSqlResult[i].grade,
				credits: scholarSituationSqlResult[i].finalGradesCredits || scholarSituationSqlResult[i].subjectsCredits,
			});
			if (scholarSituationSqlResult[i].finalGradesCredits) {
				totalCredits += scholarSituationSqlResult[i].finalGradesCredits;
				outOfCredits += scholarSituationSqlResult[i].finalGradesCredits;
			} else {
				outOfCredits += scholarSituationSqlResult[i].subjectsCredits;
			}
			if (scholarSituationSqlResult[i].grade) {
				media += scholarSituationSqlResult[i].grade;
				mediaCount++;
			}
		}
		media /= mediaCount;
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				totalCredits: totalCredits,
				outOfCredits: outOfCredits,
				media: media,
				subjectsScholarSituation: subjectsScholarSituation,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/student/:studentUserId/student-years', async (req: Request, res: Response) => {
		var studentUserId: number = parseInt(req.params.studentUserId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var studentYearsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT studentsYears.studentYearId, studyYears.fromYear, studyYears.toYear, years.yearIndex, programs.programShortName FROM studentsYears
INNER JOIN studyYears ON studyYears.studyYearId = studentsYears.studyYearId
INNER JOIN years ON years.yearId = studentsYears.yearId
INNER JOIN users ON users.userId = studentsYears.userId
INNER JOIN programs ON programs.programId = years.programId
WHERE users.universityId = ? AND studentsYears.userId = ?
ORDER BY studyYears.createdDate DESC`,
			[universityId, studentUserId]
		);
		var studentYearsDetails: StudentYearsDetails[] = [];
		for (var i = 0; i < studentYearsSqlResult.length; i++) {
			studentYearsDetails.push({
				studentYearId: studentYearsSqlResult[i].studentYearId,
				fromYear: studentYearsSqlResult[i].fromYear,
				toYear: studentYearsSqlResult[i].toYear,
				yearIndex: studentYearsSqlResult[i].yearIndex,
				programShortName: studentYearsSqlResult[i].programShortName,
			});
		}
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				studentYearsDetails: studentYearsDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/create/student/program', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			yearId: number;
			studentUserId: number;
		}
		var body: CurrentBody = req.body;
		var responseObject: CustomResponseObject;
		if (!('yearId' in body && 'studentUserId' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var yearId: number = body.yearId;
		var studentUserId: number = body.studentUserId;
		var checkYearIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT years.yearId, years.yearIndex, programs.programName FROM years
INNER JOIN programs ON years.programId = programs.programId
INNER JOIN schools ON programs.schoolId = schools.schoolId
WHERE years.yearId = ? AND schools.universityId = ?`,
			[yearId, universityId]
		);
		if (checkYearIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to use this year as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		var checkStudentUserIdUniversitySqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			"SELECT userId, CONCAT_WS(' ', users.firstName, users.lastName) as fullName FROM users WHERE userId = ? AND universityId = ? AND role = 1",
			[studentUserId, universityId]
		);
		if (checkStudentUserIdUniversitySqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to edit this student as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		var getLastStudyYearIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT studyYearId FROM studyYears WHERE universityId = ? ORDER BY createdDate DESC LIMIT 1', [
			universityId,
		]);
		if (getLastStudyYearIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'There is no study year created',
			};
			res.status(200).send(responseObject);
			return;
		}
		await dbConnection.execute<NormalPacket>('INSERT INTO studentsYears (yearId, userId, studyYearId) VALUES (?, ?, ?)', [yearId, studentUserId, getLastStudyYearIdSqlResult[0].studyYearId]);
		res['adminEventDataObj'] = {
			userId: userId,
			message: `Added the program ${checkYearIdSqlResult[0].programName} year ${checkYearIdSqlResult[0].yearIndex} to the student ${checkStudentUserIdUniversitySqlResult[0].fullName}`,
		};
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/student/:studentUserId/programs', async (req: Request, res: Response) => {
		var studentUserId: number = parseInt(req.params.studentUserId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var studentProgramsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT programs.programId, programs.programName, years.yearIndex FROM studentsYears
INNER JOIN years ON studentsYears.yearId = years.yearId
INNER JOIN programs ON years.programId = programs.programId
INNER JOIN users ON studentsYears.userId = users.userId
WHERE studentsYears.userId = ? AND users.universityId = ?`,
			[studentUserId, universityId]
		);
		var studentProgramsPreviewDetails: StudentProgramPreviewDetails[] = [];
		for (var i = 0; i < studentProgramsSqlResult.length; i++) {
			studentProgramsPreviewDetails.push({
				programId: studentProgramsSqlResult[i].programId,
				programName: studentProgramsSqlResult[i].programName,
				yearIndex: studentProgramsSqlResult[i].yearIndex,
			});
		}
		const highestYearIndexPrograms = studentProgramsPreviewDetails.reduce((acc: { [key: string]: StudentProgramPreviewDetails }, program) => {
			const existing = acc[program.programId];
			if (!existing || program.yearIndex > existing.yearIndex) {
				acc[program.programId] = program;
			}
			return acc;
		}, {});
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				studentProgramsPreviewDetails: Object.values(highestYearIndexPrograms),
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/update/student/platform-info', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			firstName: string;
			lastName: string;
			email: string;
			password: string;
			disabled: boolean;
			studentUserId: number;
		}
		var body: CurrentBody = req.body;
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		if (!('studentUserId' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var firstName: string = body.firstName;
		var lastName: string = body.lastName;
		var email: string = body.email;
		var password: string = body.password;
		var disabled: boolean = body.disabled;
		var studentUserId: number = body.studentUserId;
		var getStudentEmailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT email FROM users WHERE userId = ? AND universityId = ? AND role = 1', [studentUserId, universityId]);
		if (getStudentEmailSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'The student does not exist',
			};
			res.status(200).send(responseObject);
			return;
		}
		var adminEventMessage: string = `Changed student ${getStudentEmailSqlResult[0].email} platform info`;
		if (email) {
			if (!checkIfEmailIsValid(email)) {
				responseObject = {
					succ: false,
					mes: 'Please enter a valid email',
				};
				res.status(200).send(responseObject);
				return;
			}
			var emailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT userId FROM users WHERE email = ?', [email]);
			if (emailSqlResult.length != 0) {
				responseObject = {
					succ: false,
					mes: 'This email is already in use',
				};
				res.status(200).send(responseObject);
				return;
			}
		}
		if (firstName) {
			await dbConnection.execute<NormalPacket>('UPDATE users SET firstName = ? WHERE userId = ? AND universityId = ?', [firstName, studentUserId, universityId]);
		}
		if (lastName) {
			await dbConnection.execute<NormalPacket>('UPDATE users SET lastName = ? WHERE userId = ? AND universityId = ?', [lastName, studentUserId, universityId]);
		}
		if (email) {
			await dbConnection.execute<NormalPacket>('UPDATE users SET email = ? WHERE userId = ? AND universityId = ?', [email, studentUserId, universityId]);
			adminEventMessage += ` email to ${email}`;
		}
		if (password) {
			var loginAuthenticateObj: LoginAuthenticate = new LoginAuthenticate();
			var hashedPassword: string = loginAuthenticateObj.hashPassword(password);
			await dbConnection.execute<NormalPacket>('UPDATE users SET hashedPassword = ? WHERE userId = ? AND universityId = ?', [hashedPassword, studentUserId, universityId]);
		}
		if (disabled != undefined) {
			await dbConnection.execute<NormalPacket>('UPDATE users SET disabled = ? WHERE userId = ? AND universityId = ?', [disabled, studentUserId, universityId]);
		}
		res['adminEventDataObj'] = {
			userId: userId,
			message: adminEventMessage,
		};
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/student/:studentUserId/platform-info', async (req: Request, res: Response) => {
		var studentUserId: number = parseInt(req.params.studentUserId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var studentSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT email, firstName, lastName, disabled FROM users WHERE universityId = ? AND role = 1 AND userId = ?', [
			universityId,
			studentUserId,
		]);
		if (studentSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Found more than one student with that id',
			};
			res.status(200).send(responseObject);
			return;
		}
		var studentEditDetails: UserEditDetails = {
			email: studentSqlResult[0].email,
			firstName: studentSqlResult[0].firstName,
			lastName: studentSqlResult[0].lastName,
			disabled: studentSqlResult[0].disabled,
		};
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				studentEditDetails: studentEditDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/students', async (req: Request, res: Response) => {
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var studentsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			"SELECT userId, email, CONCAT_WS(' ', firstName, lastName) as fullName FROM users WHERE universityId = ? AND role = 1",
			[universityId]
		);
		var studentsTableDetails: UserTableDetails[] = [];
		for (var i = 0; i < studentsSqlResult.length; i++) {
			studentsTableDetails.push({
				userId: studentsSqlResult[i].userId,
				email: studentsSqlResult[i].email,
				fullname: studentsSqlResult[i].fullName,
			});
		}
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				studentsTableDetails: studentsTableDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/update/year', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			yearId: number;
			year: YearEditDetails[];
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		if (!('yearId' in body && 'year' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var yearId: number = body.yearId;
		var year: YearEditDetails[] = body.year;
		var checkYearIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT years.yearId, programs.programName, years.yearIndex FROM years
INNER JOIN programs ON years.programId = programs.programId
INNER JOIN schools ON programs.schoolId = schools.schoolId
WHERE years.yearId = ? AND schools.universityId = ?`,
			[yearId, universityId]
		);
		if (checkYearIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to edit this year as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		var transaction = await dbConnection.startTransaction();
		try {
			var checkSubjectIdSqlResult: SelectPacket;
			for (var yearSubject of year) {
				if (yearSubject.semesterIndex && yearSubject.subjectId) {
					checkSubjectIdSqlResult = await dbConnection.execute<SelectPacket>('SELECT subjectId FROM subjects WHERE universityId = ? AND subjectId = ?', [universityId, yearSubject.subjectId]);
					if (checkSubjectIdSqlResult.length != 1) {
						await dbConnection.rollbackTransactionAndClose(transaction);
						responseObject = {
							succ: false,
							mes: 'You don not permissions to use this subject as is not under your university',
						};
						res.status(200).send(responseObject);
						return;
					}
					await dbConnection.executeInTransaction<NormalPacket>(transaction, 'UPDATE yearsSubjects SET semesterIndex = ? WHERE subjectId = ? AND yearId = ?', [
						yearSubject.semesterIndex,
						yearSubject.subjectId,
						yearId,
					]);
				}
			}
			await dbConnection.commitTransactionAndClose(transaction);
		} catch (err) {
			await dbConnection.rollbackTransactionAndClose(transaction);
			responseObject = {
				succ: false,
				mes: String(err),
			};
			res.status(200).send(responseObject);
			return;
		}
		res['adminEventDataObj'] = {
			userId: userId,
			message: `Updated the program ${checkYearIdSqlResult[0].programName} year ${checkYearIdSqlResult[0].yearIndex}`,
		};
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/year/:yearId', async (req: Request, res: Response) => {
		var yearId: number = parseInt(req.params.yearId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var checkYearIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT years.yearId FROM years
INNER JOIN programs ON years.programId = programs.programId
INNER JOIN schools ON programs.schoolId = schools.schoolId
WHERE years.yearId = ? AND schools.universityId = ?`,
			[yearId, universityId]
		);
		if (checkYearIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to edit this year as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		var yearSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT yearsSubjects.subjectId, yearsSubjects.semesterIndex, subjects.subjectName FROM yearsSubjects
INNER JOIN subjects ON yearsSubjects.subjectId = subjects.subjectId
WHERE yearsSubjects.yearId = ?`,
			[yearId]
		);
		if (yearSqlResult.length == 0) {
			responseObject = {
				succ: false,
				mes: 'There is no year with that yearId',
			};
			res.status(200).send(responseObject);
			return;
		}
		var yearEditDetails: YearEditDetails[] = [];
		for (var i = 0; i < yearSqlResult.length; i++) {
			yearEditDetails.push({
				subjectId: yearSqlResult[i].subjectId,
				subjectName: yearSqlResult[i].subjectName,
				semesterIndex: yearSqlResult[i].semesterIndex,
			});
		}
		var yearIndexSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT yearIndex FROM years WHERE yearId = ?', [yearId]);
		if (yearIndexSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Found more than one year index with that yearId',
			};
			res.status(200).send(responseObject);
			return;
		}
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				yearEditDetails: yearEditDetails,
				yearIndex: yearIndexSqlResult[0].yearIndex,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/years/:programId', async (req: Request, res: Response) => {
		var programId: number = parseInt(req.params.programId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var checkProgramIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT programs.programId FROM programs
INNER JOIN schools ON programs.schoolId = schools.schoolId
WHERE programs.programId = ? AND schools.universityId = ?`,
			[programId, universityId]
		);
		if (checkProgramIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to edit this program as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		var yearsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT years.yearIndex, years.yearId, COUNT(yearsSubjects.yearId) AS noSubjects FROM years
INNER JOIN yearsSubjects ON yearsSubjects.yearId = years.yearId
WHERE years.programId = ?
GROUP BY years.yearId`,
			[programId]
		);
		var yearsPreviewDetails: YearPreviewDetails[] = [];
		for (var i = 0; i < yearsSqlResult.length; i++) {
			yearsPreviewDetails.push({
				yearId: yearsSqlResult[i].yearId,
				noSubjects: yearsSqlResult[i].noSubjects,
				yearIndex: yearsSqlResult[i].yearIndex,
			});
		}
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				yearsPreviewDetails: yearsPreviewDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/update/program', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			programId: number;
			programName: string;
			programShortName: string;
			programType: string;
			archived: boolean;
			years: ProgramYearEditDetails[];
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		if (!('programId' in body && 'programName' in body && 'programShortName' in body && 'programType' in body && 'years' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var programId: number = body.programId;
		var programName: string = body.programName;
		var programShortName: string = body.programShortName;
		var programType: string = body.programType;
		var archived: boolean = body.archived;
		var years: ProgramYearEditDetails[] = body.years;
		var checkProgramIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT programs.programId, programs.programName FROM programs
INNER JOIN schools ON programs.schoolId = schools.schoolId
WHERE programs.programId = ? AND schools.universityId = ?`,
			[programId, universityId]
		);
		if (checkProgramIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to edit this program as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!programName) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid program name',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!programShortName) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid program short name',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!programType || !['Bachelor', 'Master'].includes(programType)) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid program type',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (programName) {
			await dbConnection.execute<SelectPacket>('UPDATE programs SET programName = ? WHERE programId = ?', [programName, programId]);
		}
		if (programShortName) {
			await dbConnection.execute<SelectPacket>('UPDATE programs SET programShortName = ? WHERE programId = ?', [programShortName, programId]);
		}
		if (programType) {
			await dbConnection.execute<SelectPacket>('UPDATE programs SET programType = ? WHERE programId = ?', [programType, programId]);
		}
		if (archived != undefined) {
			await dbConnection.execute<SelectPacket>('UPDATE programs SET archived = ? WHERE programId = ?', [archived, programId]);
		}
		if (years.length > 0) {
			var transaction = await dbConnection.startTransaction();
			try {
				var yearNormalSqlResult: NormalPacket;
				var lastYearIndexSqlResult: SelectPacket;
				var checkSubjectIdSqlResult: SelectPacket;
				for (var i = 0; i < years.length; i++) {
					if (!lastYearIndexSqlResult) {
						lastYearIndexSqlResult = await dbConnection.executeInTransaction<SelectPacket>(transaction, 'SELECT yearIndex FROM years WHERE programId = ? ORDER BY yearIndex DESC LIMIT 1', [programId]);
						console.log(lastYearIndexSqlResult);
						if (lastYearIndexSqlResult.length != 1) {
							responseObject = {
								succ: false,
								mes: 'Could not find the program last year index',
							};
							res.status(200).send(responseObject);
							return;
						}
					}
					yearNormalSqlResult = await dbConnection.executeInTransaction<NormalPacket>(transaction, 'INSERT INTO years (programId, yearIndex) VALUES (?, ?)', [
						programId,
						lastYearIndexSqlResult[0].yearIndex + i + 1,
					]);
					if (years[i].length == 0) {
						await dbConnection.rollbackTransactionAndClose(transaction);
						responseObject = {
							succ: false,
							mes: 'The program should have at least one subject per year',
						};
						res.status(200).send(responseObject);
						return;
					}
					for (var subject of years[i]) {
						checkSubjectIdSqlResult = await dbConnection.execute<SelectPacket>('SELECT subjectId FROM subjects WHERE universityId = ? AND subjectId = ?', [universityId, subject.subjectId]);
						if (checkSubjectIdSqlResult.length != 1) {
							await dbConnection.rollbackTransactionAndClose(transaction);
							responseObject = {
								succ: false,
								mes: 'You don not permissions to use this subject as is not under your university',
							};
							res.status(200).send(responseObject);
							return;
						}
						await dbConnection.executeInTransaction<NormalPacket>(transaction, 'INSERT INTO yearsSubjects (yearId, subjectId, semesterIndex) VALUES (?, ?, ?)', [
							yearNormalSqlResult.insertId,
							subject.subjectId,
							subject.semesterIndex,
						]);
					}
				}
				await dbConnection.commitTransactionAndClose(transaction);
			} catch (err) {
				await dbConnection.rollbackTransactionAndClose(transaction);
				responseObject = {
					succ: false,
					mes: String(err),
				};
				res.status(200).send(responseObject);
				return;
			}
		}
		res['adminEventDataObj'] = {
			userId: userId,
			message: `Edited the program ${checkProgramIdSqlResult[0].programName}`,
		};
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/program/:programId', async (req: Request, res: Response) => {
		var programId: number = parseInt(req.params.programId);
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var programSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT programs.schoolId, programs.programName, programs.programType, programs.programShortName, programs.archived FROM programs
INNER JOIN schools ON programs.schoolId = schools.schoolId
WHERE programs.programId = ? AND schools.universityId = ?`,
			[programId, universityId]
		);
		if (programSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Found more than one program',
			};
			res.status(200).send(responseObject);
			return;
		}
		var programEditDetails: ProgramEditDetails = {
			programName: programSqlResult[0].programName,
			programType: programSqlResult[0].programType,
			programShortName: programSqlResult[0].programShortName,
			archived: programSqlResult[0].archived,
			schoolId: programSqlResult[0].schoolId,
		};
		responseObject = {
			succ: true,
			data: {
				programEditDetails: programEditDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/programs/:schoolId?', async (req: Request, res: Response) => {
		var schoolId: number = parseInt(req.params.schoolId) || null;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var programsSqlResult: SelectPacket;
		if (schoolId) {
			programsSqlResult = await dbConnection.execute<SelectPacket>(
				`SELECT programId, programName, programType, archived FROM programs
INNER JOIN schools ON programs.schoolId = schools.schoolId
WHERE schools.universityId = ? AND programs.schoolId = ?`,
				[universityId, schoolId]
			);
		} else {
			programsSqlResult = await dbConnection.execute<SelectPacket>(
				`SELECT programId, programName, programType, archived FROM programs
INNER JOIN schools ON programs.schoolId = schools.schoolId
WHERE schools.universityId = ?`,
				[universityId]
			);
		}
		var progamsPreviewDetails: ProgamPreviewDetails[] = [];
		for (var i = 0; i < programsSqlResult.length; i++) {
			progamsPreviewDetails.push({
				programId: programsSqlResult[i].programId,
				programName: programsSqlResult[i].programName,
				programType: programsSqlResult[i].programArchived ? programsSqlResult[i].programType + ' (Archived)' : programsSqlResult[i].programType,
			});
		}
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				progamsPreviewDetails: progamsPreviewDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/create/program', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			programName: string;
			programShortName: string;
			programType: string;
			schoolId: number;
			years: ProgramYearEditDetails[];
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		if (!('programName' in body && 'programShortName' in body && 'programType' in body && 'schoolId' in body && 'years' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var programName: string = body.programName;
		var programShortName: string = body.programShortName;
		var programType: string = body.programType;
		var schoolId: number = body.schoolId;
		var years: ProgramYearEditDetails[] = body.years;
		if (!programName) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid program name',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!programShortName) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid program short name',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!programType || !['Bachelor', 'Master'].includes(programType)) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid program type',
			};
			res.status(200).send(responseObject);
			return;
		}
		var checkSchoolIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT schoolId FROM schools WHERE universityId = ? AND schoolId = ?', [universityId, schoolId]);
		if (checkSchoolIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'The school you selected is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (years.length == 0) {
			responseObject = {
				succ: false,
				mes: 'The program should have at least one year',
			};
			res.status(200).send(responseObject);
			return;
		}
		var transaction = await dbConnection.startTransaction();
		try {
			var yearNormalSqlResult: NormalPacket;
			var checkSubjectIdSqlResult: SelectPacket;
			var programNormalSqlResutl: NormalPacket = await dbConnection.executeInTransaction<NormalPacket>(
				transaction,
				'INSERT INTO programs (programType, programName, programShortName, schoolId) VALUES (?, ?, ?, ?)',
				[programType, programName, programShortName, schoolId]
			);
			for (var i = 0; i < years.length; i++) {
				yearNormalSqlResult = await dbConnection.executeInTransaction<NormalPacket>(transaction, 'INSERT INTO years (programId, yearIndex) VALUES (?, ?)', [programNormalSqlResutl.insertId, i + 1]);
				if (years[i].length == 0) {
					await dbConnection.rollbackTransactionAndClose(transaction);
					responseObject = {
						succ: false,
						mes: 'The program should have at least one subject per year',
					};
					res.status(200).send(responseObject);
					return;
				}
				for (var subject of years[i]) {
					checkSubjectIdSqlResult = await dbConnection.execute<SelectPacket>('SELECT subjectId FROM subjects WHERE universityId = ? AND subjectId = ?', [universityId, subject.subjectId]);
					if (checkSubjectIdSqlResult.length != 1) {
						await dbConnection.rollbackTransactionAndClose(transaction);
						responseObject = {
							succ: false,
							mes: 'You don not permissions to use this subject as is not under your university',
						};
						res.status(200).send(responseObject);
						return;
					}
					await dbConnection.executeInTransaction<NormalPacket>(transaction, 'INSERT INTO yearsSubjects (yearId, subjectId, semesterIndex) VALUES (?, ?, ?)', [
						yearNormalSqlResult.insertId,
						subject.subjectId,
						subject.semesterIndex,
					]);
				}
			}
			await dbConnection.commitTransactionAndClose(transaction);
		} catch (err) {
			await dbConnection.rollbackTransactionAndClose(transaction);
			responseObject = {
				succ: false,
				mes: String(err),
			};
			res.status(200).send(responseObject);
			return;
		}
		res['adminEventDataObj'] = {
			userId: userId,
			message: `Created a new program ${programName}`,
		};
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/update/subject', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			subjectId: number;
			subjectName: string;
			subjectCredits: number;
			archived: boolean;
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		if (!('subjectName' in body && 'subjectCredits' in body && 'subjectId' in body && 'archived' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var subjectName: string = body.subjectName;
		var subjectCredits: number = body.subjectCredits;
		var archived: boolean = body.archived;
		var subjectId: number = body.subjectId;
		var getSubjectNameSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT subjectName FROM subjects WHERE subjectId = ? AND universityId = ?', [subjectId, universityId]);
		if (getSubjectNameSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Subject does not exist',
			};
			res.status(200).send(responseObject);
			return;
		}
		var adminEventMessage: string = `Changed subject ${getSubjectNameSqlResult[0].subjectName}`;
		if (subjectCredits != undefined) {
			if (subjectCredits == 0 || parseInt(String(subjectCredits)) != subjectCredits) {
				responseObject = {
					succ: false,
					mes: 'Please enter a valid credit integer number',
				};
				res.status(200).send(responseObject);
				return;
			}
		}
		if (subjectName) {
			await dbConnection.execute<NormalPacket>('UPDATE subjects SET subjectName = ? WHERE subjectId = ? AND universityId = ?', [subjectName, subjectId, universityId]);
			adminEventMessage += ` to ${subjectName}`;
		}
		if (subjectCredits) {
			await dbConnection.execute<NormalPacket>('UPDATE subjects SET credits = ? WHERE subjectId = ? AND universityId = ?', [subjectCredits, subjectId, universityId]);
		}
		if (subjectCredits) {
			await dbConnection.execute<NormalPacket>('UPDATE subjects SET credits = ? WHERE subjectId = ? AND universityId = ?', [subjectCredits, subjectId, universityId]);
		}
		if (archived != undefined) {
			await dbConnection.execute<NormalPacket>('UPDATE subjects SET archived = ? WHERE subjectId = ? AND universityId = ?', [archived, subjectId, universityId]);
		}
		res['adminEventDataObj'] = {
			userId: userId,
			message: adminEventMessage,
		};
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/create/subject', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			subjectName: string;
			subjectCredits: number;
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		if (!('subjectName' in body && 'subjectCredits' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var subjectName: string = body.subjectName;
		var subjectCredits: number = body.subjectCredits;
		if (!subjectName) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid subject name',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!subjectCredits || parseInt(String(subjectCredits)) != subjectCredits) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid credit integer number',
			};
			res.status(200).send(responseObject);
			return;
		}
		await dbConnection.execute<NormalPacket>('INSERT INTO subjects (universityId, subjectName, credits) VALUES (?, ?, ?)', [universityId, subjectName, subjectCredits]);
		res['adminEventDataObj'] = {
			userId: userId,
			message: `Created the subject ${subjectName}`,
		};
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/subject/:subjectId', async (req: Request, res: Response) => {
		var subjectId: number = parseInt(req.params.subjectId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var subjectSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT subjectName, credits, archived FROM subjects WHERE subjectId = ? AND universityId = ?', [
			subjectId,
			universityId,
		]);
		var responseObject: CustomResponseObject;
		if (subjectSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Found more than one school',
			};
			res.status(200).send(responseObject);
			return;
		}
		var subjectEditDetails: SubjectEditDetails = {
			subjectName: subjectSqlResult[0].subjectName,
			subjectCredits: subjectSqlResult[0].credits,
			archived: subjectSqlResult[0].archived,
		};
		responseObject = {
			succ: true,
			data: {
				subjectEditDetails: subjectEditDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/subjects/:isArchived?', async (req: Request, res: Response) => {
		var isArchived: boolean = parseInt(req.params.isArchived) == 1 ? true : parseInt(req.params.isArchived) == 0 ? false : null;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var subjectsSqlResult: SelectPacket;
		if (isArchived != null) {
			subjectsSqlResult = await dbConnection.execute<SelectPacket>('SELECT subjectId, subjectName, credits, archived FROM subjects WHERE universityId = ? AND archived = ?', [
				universityId,
				isArchived,
			]);
		} else {
			subjectsSqlResult = await dbConnection.execute<SelectPacket>('SELECT subjectId, subjectName, credits, archived FROM subjects WHERE universityId = ?', [universityId]);
		}
		var subjectsPreviewDetails: SubjectPreviewDetails[] = [];
		for (var i = 0; i < subjectsSqlResult.length; i++) {
			subjectsPreviewDetails.push({
				subjectId: subjectsSqlResult[i].subjectId,
				subjectName: subjectsSqlResult[i].subjectName,
				subjectCredits: subjectsSqlResult[i].archived ? subjectsSqlResult[i].credits + ' (Archived)' : subjectsSqlResult[i].credits,
			});
		}
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				subjectsPreviewDetails: subjectsPreviewDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/school/:schoolId', async (req: Request, res: Response) => {
		var schoolId: number = parseInt(req.params.schoolId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var schoolSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT schoolName FROM schools WHERE schoolId = ? AND universityId = ?', [schoolId, universityId]);
		var responseObject: CustomResponseObject;
		if (schoolSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Found more than one school',
			};
			res.status(200).send(responseObject);
			return;
		}
		var schoolEditDetails: SchoolEditDetails = {
			schoolName: schoolSqlResult[0].schoolName,
		};
		responseObject = {
			succ: true,
			data: {
				schoolEditDetails: schoolEditDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/create/school', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			schoolName: string;
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		if (!('schoolName' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var schoolName: string = body.schoolName;
		if (!schoolName) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid school name',
			};
			res.status(200).send(responseObject);
			return;
		}
		await dbConnection.execute<NormalPacket>('INSERT INTO schools (universityId, schoolName) VALUES (?, ?)', [universityId, schoolName]);
		responseObject = {
			succ: true,
		};
		res['adminEventDataObj'] = {
			userId: userId,
			message: `Created the school ${schoolName}`,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/update/school', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			schoolName: string;
			schoolId: number;
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		if (!('schoolName' in body && 'schoolId' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var schoolName: string = body.schoolName;
		var schoolId: number = body.schoolId;
		var getSchoolNameSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT schoolName FROM schools WHERE schoolId = ? AND universityId = ?', [schoolId, universityId]);
		if (getSchoolNameSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'The school does not exist',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (schoolName) {
			await dbConnection.execute<NormalPacket>('UPDATE schools SET schoolName = ? WHERE universityId = ? AND schoolId = ?', [schoolName, universityId, schoolId]);
			res['adminEventDataObj'] = {
				userId: userId,
				message: `Updated school name ${getSchoolNameSqlResult[0].schoolName} to ${schoolName}`,
			};
		}
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/schools', async (req: Request, res: Response) => {
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var schoolsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT schoolId, schoolName FROM schools WHERE universityId = ?', [universityId]);
		var noProgramsSqlResult: SelectPacket;
		var schoolsPreviewDetails: SchoolPreviewDetails[] = [];
		for (var i = 0; i < schoolsSqlResult.length; i++) {
			noProgramsSqlResult = await dbConnection.execute<SelectPacket>('SELECT COUNT(programId) as totalPrograms FROM programs WHERE schoolId = ?', [schoolsSqlResult[i].schoolId]);
			schoolsPreviewDetails.push({
				schoolId: schoolsSqlResult[i].schoolId,
				schoolName: schoolsSqlResult[i].schoolName,
				noPrograms: noProgramsSqlResult[0].totalPrograms,
			});
		}
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				schoolsPreviewDetails: schoolsPreviewDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/admin/:adminUserId', async (req: Request, res: Response) => {
		var adminUserId: number = parseInt(req.params.adminUserId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var adminSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT email, firstName, lastName, disabled FROM users WHERE universityId = ? AND role = 3 AND userId = ?', [
			universityId,
			adminUserId,
		]);
		if (adminSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Found more than one admin with that id',
			};
			res.status(200).send(responseObject);
			return;
		}
		var adminEditDetails: UserEditDetails = {
			email: adminSqlResult[0].email,
			firstName: adminSqlResult[0].firstName,
			lastName: adminSqlResult[0].lastName,
			disabled: adminSqlResult[0].disabled,
		};
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				adminEditDetails: adminEditDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/admins', async (req: Request, res: Response) => {
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var adminsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			"SELECT userId, email, CONCAT_WS(' ', firstName, lastName) as fullName FROM users WHERE universityId = ? AND role = 3",
			[universityId]
		);
		var adminsTableDetails: UserTableDetails[] = [];
		for (var i = 0; i < adminsSqlResult.length; i++) {
			adminsTableDetails.push({
				userId: adminsSqlResult[i].userId,
				email: adminsSqlResult[i].email,
				fullname: adminsSqlResult[i].fullName,
			});
		}
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				adminsTableDetails: adminsTableDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/create/admin', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			firstName: string;
			lastName: string;
			email: string;
			password: string;
		}
		var body: CurrentBody = req.body;
		var responseObject: CustomResponseObject;
		if (!('firstName' in body && 'lastName' in body && 'email' in body && 'password' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var firstName: string = body.firstName;
		var lastName: string = body.lastName;
		var email: string = body.email;
		var password: string = body.password;
		if (!firstName) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid firstname',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!lastName) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid lastname',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!checkIfEmailIsValid(email)) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid email',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!password) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid password',
			};
			res.status(200).send(responseObject);
			return;
		}
		var emailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT userId FROM users WHERE email = ?', [email]);
		if (emailSqlResult.length != 0) {
			responseObject = {
				succ: false,
				mes: 'This email is already in use',
			};
			res.status(200).send(responseObject);
			return;
		}
		var loginAuthenticateObj: LoginAuthenticate = new LoginAuthenticate();
		var hashedPassword: string = loginAuthenticateObj.hashPassword(password);
		await dbConnection.execute<NormalPacket>('INSERT INTO users (universityId, email, hashedPassword, role, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?)', [
			universityId,
			email,
			hashedPassword,
			3,
			firstName,
			lastName,
		]);
		res['adminEventDataObj'] = {
			userId: userId,
			message: `Created an admin ${firstName} ${lastName}`,
		};
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/update/admin', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			firstName: string;
			lastName: string;
			email: string;
			password: string;
			disabled: boolean;
			adminUserId: number;
		}
		var body: CurrentBody = req.body;
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		if (!('adminUserId' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var firstName: string = body.firstName;
		var lastName: string = body.lastName;
		var email: string = body.email;
		var password: string = body.password;
		var disabled: boolean = body.disabled;
		var adminUserId: number = body.adminUserId;
		var getAdminEmailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT email FROM users WHERE userId = ? AND universityId = ? AND role = 3', [adminUserId, universityId]);
		if (getAdminEmailSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'The admin does not exist',
			};
			res.status(200).send(responseObject);
			return;
		}
		var adminEventMessage: string = `Changed admin ${getAdminEmailSqlResult[0].email} platform info`;
		if (email) {
			if (!checkIfEmailIsValid(email)) {
				responseObject = {
					succ: false,
					mes: 'Please enter a valid email',
				};
				res.status(200).send(responseObject);
				return;
			}
			var emailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT userId FROM users WHERE email = ?', [email]);
			if (emailSqlResult.length != 0) {
				responseObject = {
					succ: false,
					mes: 'This email is already in use',
				};
				res.status(200).send(responseObject);
				return;
			}
		}
		if (firstName) {
			await dbConnection.execute<NormalPacket>('UPDATE users SET firstName = ? WHERE userId = ? AND universityId = ?', [firstName, adminUserId, universityId]);
		}
		if (lastName) {
			await dbConnection.execute<NormalPacket>('UPDATE users SET lastName = ? WHERE userId = ? AND universityId = ?', [lastName, adminUserId, universityId]);
		}
		if (email) {
			await dbConnection.execute<NormalPacket>('UPDATE users SET email = ? WHERE userId = ? AND universityId = ?', [email, adminUserId, universityId]);
			adminEventMessage += ` email to ${email}`;
		}
		if (password) {
			var loginAuthenticateObj: LoginAuthenticate = new LoginAuthenticate();
			var hashedPassword: string = loginAuthenticateObj.hashPassword(password);
			await dbConnection.execute<NormalPacket>('UPDATE users SET hashedPassword = ? WHERE userId = ? AND universityId = ?', [hashedPassword, adminUserId, universityId]);
		}
		if (disabled != undefined) {
			await dbConnection.execute<NormalPacket>('UPDATE users SET disabled = ? WHERE userId = ? AND universityId = ?', [disabled, adminUserId, universityId]);
		}
		res['adminEventDataObj'] = {
			userId: userId,
			message: adminEventMessage,
		};
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/professor/:professorUserId', async (req: Request, res: Response) => {
		var professorUserId: number = parseInt(req.params.professorUserId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var professorSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT email, firstName, lastName, disabled FROM users WHERE universityId = ? AND role = 2 AND userId = ?', [
			universityId,
			professorUserId,
		]);
		if (professorSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Found more than one professor with that id',
			};
			res.status(200).send(responseObject);
			return;
		}
		var professorEditDetails: UserEditDetails = {
			email: professorSqlResult[0].email,
			firstName: professorSqlResult[0].firstName,
			lastName: professorSqlResult[0].lastName,
			disabled: professorSqlResult[0].disabled,
		};
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				professorEditDetails: professorEditDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/professors', async (req: Request, res: Response) => {
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var professorsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			"SELECT userId, email, CONCAT_WS(' ', firstName, lastName) as fullName FROM users WHERE universityId = ? AND role = 2",
			[universityId]
		);
		var professorsTableDetails: UserTableDetails[] = [];
		for (var i = 0; i < professorsSqlResult.length; i++) {
			professorsTableDetails.push({
				userId: professorsSqlResult[i].userId,
				email: professorsSqlResult[i].email,
				fullname: professorsSqlResult[i].fullName,
			});
		}
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				professorsTableDetails: professorsTableDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/create/professor', handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			firstName: string;
			lastName: string;
			email: string;
			password: string;
		}
		var body: CurrentBody = req.body;
		var responseObject: CustomResponseObject;
		if (!('firstName' in body && 'lastName' in body && 'email' in body && 'password' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var firstName: string = body.firstName;
		var lastName: string = body.lastName;
		var email: string = body.email;
		var password: string = body.password;
		if (!firstName) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid firstname',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!lastName) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid lastname',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!checkIfEmailIsValid(email)) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid email',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!password) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid password',
			};
			res.status(200).send(responseObject);
			return;
		}
		var emailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT userId FROM users WHERE email = ?', [email]);
		if (emailSqlResult.length != 0) {
			responseObject = {
				succ: false,
				mes: 'This email is already in use',
			};
			res.status(200).send(responseObject);
			return;
		}
		var loginAuthenticateObj: LoginAuthenticate = new LoginAuthenticate();
		var hashedPassword: string = loginAuthenticateObj.hashPassword(password);
		await dbConnection.execute<NormalPacket>('INSERT INTO users (universityId, email, hashedPassword, role, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?)', [
			universityId,
			email,
			hashedPassword,
			2,
			firstName,
			lastName,
		]);
		res['adminEventDataObj'] = {
			userId: userId,
			message: `Created a professor ${firstName} ${lastName}`,
		};
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/update/professor', async (req: Request, res: Response) => {
		interface CurrentBody {
			firstName: string;
			lastName: string;
			email: string;
			password: string;
			disabled: boolean;
			professorUserId: number;
		}
		var body: CurrentBody = req.body;
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		if (!('professorUserId' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var firstName: string = body.firstName;
		var lastName: string = body.lastName;
		var email: string = body.email;
		var password: string = body.password;
		var disabled: boolean = body.disabled;
		var professorUserId: number = body.professorUserId;
		var getProfessorEmailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT email FROM users WHERE userId = ? AND universityId = ? AND role = 2', [
			professorUserId,
			universityId,
		]);
		if (getProfessorEmailSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'The professor does not exist',
			};
			res.status(200).send(responseObject);
			return;
		}
		var adminEventMessage: string = `Changed professor ${getProfessorEmailSqlResult[0].email} platform info`;
		if (email) {
			if (!checkIfEmailIsValid(email)) {
				responseObject = {
					succ: false,
					mes: 'Please enter a valid email',
				};
				res.status(200).send(responseObject);
				return;
			}
			var emailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT userId FROM users WHERE email = ?', [email]);
			if (emailSqlResult.length != 0) {
				responseObject = {
					succ: false,
					mes: 'This email is already in use',
				};
				res.status(200).send(responseObject);
				return;
			}
		}
		if (firstName) {
			await dbConnection.execute<NormalPacket>('UPDATE users SET firstName = ? WHERE userId = ? AND universityId = ?', [firstName, professorUserId, universityId]);
		}
		if (lastName) {
			await dbConnection.execute<NormalPacket>('UPDATE users SET lastName = ? WHERE userId = ? AND universityId = ?', [lastName, professorUserId, universityId]);
		}
		if (email) {
			await dbConnection.execute<NormalPacket>('UPDATE users SET email = ? WHERE userId = ? AND universityId = ?', [email, professorUserId, universityId]);
			adminEventMessage += ` email to ${email}`;
		}
		if (password) {
			var loginAuthenticateObj: LoginAuthenticate = new LoginAuthenticate();
			var hashedPassword: string = loginAuthenticateObj.hashPassword(password);
			await dbConnection.execute<NormalPacket>('UPDATE users SET hashedPassword = ? WHERE userId = ? AND universityId = ?', [hashedPassword, professorUserId, universityId]);
		}
		if (disabled != undefined) {
			await dbConnection.execute<NormalPacket>('UPDATE users SET disabled = ? WHERE userId = ? AND universityId = ?', [disabled, professorUserId, universityId]);
		}
		res['adminEventDataObj'] = {
			userId: userId,
			message: adminEventMessage,
		};
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/university-name', async (req: Request, res: Response) => {
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var universityNameSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT universityName FROM universities WHERE universityId = ?', [universityId]);
		var responseObject: CustomResponseObject;
		if (universityNameSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Found more than one university name',
			};
			res.status(200).send(responseObject);
			return;
		}
		responseObject = {
			succ: true,
			data: {
				universityName: universityNameSqlResult[0].universityName,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/university-long-id', async (req: Request, res: Response) => {
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityLongId: string = await accountMethodsObj.getUserUniveristyLongId(userId);
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				universityLongId: universityLongId,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.route('/update/university-settings').post(upload.single('universityLogo'), handleEventManagerMiddleware(dbConnection), async (req: Request, res: Response) => {
		interface CurrentBody {
			universityName: string;
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var universityName: string = JSON.parse(body.universityName) || null;
		var universityLogo = (req.file as Express.Multer.File) || null;
		var staticPath: string = environmentParserObj.get('STATIC_FOLDER_PATH', 'string', true);
		if (universityName) {
			await dbConnection.execute<NormalPacket>('UPDATE universities SET universityName = ? WHERE universityId = ?', [universityName, universityId]);
		}
		if (universityLogo) {
			var universityLongId: string = await accountMethodsObj.getUserUniveristyLongId(userId);
			await saveImage(universityLogo.buffer, staticPath + '/universities-images', `${universityLongId}.png`);
		}
		res['adminEventDataObj'] = {
			userId: userId,
			message: 'Updated the University Settings',
		};
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});
}
