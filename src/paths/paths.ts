import { Router, Request, Response } from 'express';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';
import { DbHandler, NormalPacket, SelectPacket } from '@raducualexandrumircea/custom-db-handler';
import { LoginMethods, LoginMethodsInterface } from '@raducualexandrumircea/lunaris-login';
import { AccountMethods, handleCheckProfessorMiddleware } from '@raducualexandrumircea/lunaris-account';
import multer from 'multer';
import { SessionInterface } from '@raducualexandrumircea/redis-session-manager';
import {
	ClassDetails,
	ClassFinalGradeDetails,
	ClassPreviewDetails,
	ClassSubjectDropdownDetails,
	CustomResponseObject,
	StudyYearStudentDetails,
	SubjectPreviewDetails,
	UserTableDetails,
} from '@raducualexandrumircea/lunaris-interfaces';
import { v4 as uuidv4 } from 'uuid';

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

export function appRoutes(router: Router, dbConnection: DbHandler, loginMethodsObj: LoginMethods, accountMethodsObj: AccountMethods, upload: multer.Multer) {
	router.get('/', async (req: Request, res: Response) => {
		res.status(200).send(environmentParserObj.get('SERVER_NAME', 'string', false) || 'root path works');
	});

	router.post('/update/class/final-grade', handleCheckProfessorMiddleware(dbConnection, loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
		interface CurrentBody {
			classId: number;
			grade: number;
			studentUserId: number;
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		if (!('classId' in body && 'grade' in body && 'studentUserId' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var classId: number = body.classId;
		var grade: number = body.grade;
		var studentUserId: number = body.studentUserId;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		if (userRole != 3 && !(await accountMethodsObj.checkIfClassMember(classId, userId))) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to get the class details as you are not in that class',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (grade > 10 || grade == 0) {
			responseObject = {
				succ: false,
				mes: 'Can not have a grade bigger than 10 or equal to 0',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (String(grade).includes('.') && grade * 100 != parseInt(String(grade).replaceAll('.', ''))) {
			responseObject = {
				succ: false,
				mes: 'Can not have a grade with more than 2 decimal points',
			};
			res.status(200).send(responseObject);
			return;
		}
		var checkClassIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT classes.classId FROM classes
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE classes.classId = ? AND studyYears.universityId = ?`,
			[classId, universityId]
		);
		if (checkClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to edit this class as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		var getClassGradeDetailsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT yearsSubjects.yearId, classes.studyYearId, yearsSubjects.subjectId FROM classes
INNER JOIN yearsSubjects ON yearsSubjects.yearSubjectId = classes.yearSubjectId
WHERE classes.classId = ?`,
			[classId]
		);
		if (getClassGradeDetailsSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Could not find the year id and study year id for this class',
			};
			res.status(200).send(responseObject);
			return;
		}
		var checkIfFinalGradeExitsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT studentsYears.studentYearId, finalGrades.grade FROM classesMembers
INNER JOIN users ON users.userId = classesMembers.userId
INNER JOIN studentsYears ON studentsYears.userId = classesMembers.userId
LEFT JOIN finalGrades ON finalGrades.studentYearId = studentsYears.studentYearId AND finalGrades.subjectId = ?
WHERE studentsYears.studyYearId = ? AND studentsYears.yearId = ? AND users.role = 1 AND users.universityId = ? AND users.userId = ?`,
			[getClassGradeDetailsSqlResult[0].subjectId, getClassGradeDetailsSqlResult[0].studyYearId, getClassGradeDetailsSqlResult[0].yearId, universityId, studentUserId]
		);
		if (checkIfFinalGradeExitsSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Could not find the student year id coresponding to this grade update',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (checkIfFinalGradeExitsSqlResult[0].grade != null) {
			await dbConnection.execute<NormalPacket>('UPDATE finalGrades SET grade = ? WHERE studentYearId = ? AND subjectId = ?', [
				grade,
				checkIfFinalGradeExitsSqlResult[0].studentYearId,
				getClassGradeDetailsSqlResult[0].subjectId,
			]);
		} else {
			var getSubjectCreditsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT credits FROM subjects WHERE subjectId = ?', [getClassGradeDetailsSqlResult[0].subjectId]);
			if (getSubjectCreditsSqlResult.length != 1) {
				responseObject = {
					succ: false,
					mes: 'Could not find the subject credits',
				};
				res.status(200).send(responseObject);
				return;
			}
			await dbConnection.execute<NormalPacket>('INSERT INTO finalGrades (studentYearId, subjectId, grade, credits) VALUES (?, ?, ?, ?)', [
				checkIfFinalGradeExitsSqlResult[0].studentYearId,
				getClassGradeDetailsSqlResult[0].subjectId,
				grade,
				getSubjectCreditsSqlResult[0].credits,
			]);
		}
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/class/:classId/final-grades', handleCheckProfessorMiddleware(dbConnection, loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
		var classId: number = parseInt(req.params.classId);
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		if (userRole != 3 && !(await accountMethodsObj.checkIfClassMember(classId, userId))) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to get the class details as you are not in that class',
			};
			res.status(200).send(responseObject);
			return;
		}
		var checkClassIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT classes.classId FROM classes
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE classes.classId = ? AND studyYears.universityId = ?`,
			[classId, universityId]
		);
		if (checkClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to edit this class as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		var getClassGradeDetailsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT yearsSubjects.yearId, classes.studyYearId, yearsSubjects.subjectId FROM classes
INNER JOIN yearsSubjects ON yearsSubjects.yearSubjectId = classes.yearSubjectId
WHERE classes.classId = ?`,
			[classId]
		);
		if (getClassGradeDetailsSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Could not find the year id and study year id for this class',
			};
			res.status(200).send(responseObject);
			return;
		}
		var getFinalGradesSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT users.userId, users.email, CONCAT_WS(' ', users.firstName, users.lastName) as fullName, finalGrades.grade FROM classesMembers
INNER JOIN users ON users.userId = classesMembers.userId
INNER JOIN studentsYears ON studentsYears.userId = classesMembers.userId
LEFT JOIN finalGrades ON finalGrades.studentYearId = studentsYears.studentYearId AND finalGrades.subjectId = ?
WHERE studentsYears.studyYearId = ? AND studentsYears.yearId = ?`,
			[getClassGradeDetailsSqlResult[0].subjectId, getClassGradeDetailsSqlResult[0].studyYearId, getClassGradeDetailsSqlResult[0].yearId]
		);
		var classFinalGradesDetails: ClassFinalGradeDetails[] = [];
		for (var i = 0; i < getFinalGradesSqlResult.length; i++) {
			classFinalGradesDetails.push({
				email: getFinalGradesSqlResult[i].email,
				fullname: getFinalGradesSqlResult[i].fullName,
				userId: getFinalGradesSqlResult[i].userId,
				grade: getFinalGradesSqlResult[i].grade,
			});
		}
		responseObject = {
			succ: true,
			data: {
				classFinalGradesDetails: classFinalGradesDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/class/:classId/details', async (req: Request, res: Response) => {
		var classId: number = parseInt(req.params.classId);
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		if (userRole != 3 && !(await accountMethodsObj.checkIfClassMember(classId, userId))) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to get the class details as you are not in that class',
			};
			res.status(200).send(responseObject);
			return;
		}
		var classDetailsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT subjects.subjectName, subjects.credits, classes.classDescription FROM classes
INNER JOIN yearsSubjects ON yearsSubjects.yearSubjectId = classes.yearSubjectId
INNER JOIN subjects ON subjects.subjectId = yearsSubjects.subjectId
WHERE classes.classId = ? AND subjects.universityId = ?`,
			[classId, universityId]
		);
		if (classDetailsSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Can not find the class details',
			};
			res.status(200).send(responseObject);
			return;
		}
		var classDetails: ClassDetails = {
			className: classDetailsSqlResult[0].subjectName,
			classDescription: classDetailsSqlResult[0].classDescription,
			classCredits: classDetailsSqlResult[0].credits,
		};
		responseObject = {
			succ: true,
			data: {
				classDetails: classDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/add/members', handleCheckProfessorMiddleware(dbConnection, loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
		interface CurrentBody {
			classId: number;
			usersIds: number[];
		}
		var body: CurrentBody = req.body;
		var responseObject: CustomResponseObject;
		if (!('classId' in body && 'usersIds' in body)) {
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
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		var classId: number = body.classId;
		var usersIds: number[] = body.usersIds;
		if (usersIds.length == 0) {
			responseObject = {
				succ: false,
				mes: 'Please add at least one member',
			};
			res.status(200).send(responseObject);
			return;
		}
		var checkClassIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT classes.classId FROM classes
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE classes.classId = ? AND studyYears.universityId = ?`,
			[classId, universityId]
		);
		if (checkClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to edit this class as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (userRole == 2 && !(await accountMethodsObj.checkIfClassMember(classId, userId))) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to delete this member as you are not in that class',
			};
			res.status(200).send(responseObject);
			return;
		}
		var getYearSubjectIdAndStudyYearIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT yearSubjectId, studyYearId FROM classes WHERE classId = ?', [classId]);
		if (getYearSubjectIdAndStudyYearIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Could not find that class id',
			};
			res.status(200).send(responseObject);
			return;
		}
		var studyYearId: number = getYearSubjectIdAndStudyYearIdSqlResult[0].studyYearId;
		var yearSubjectId: number = getYearSubjectIdAndStudyYearIdSqlResult[0].yearSubjectId;
		var transaction = await dbConnection.startTransaction();
		try {
			var checkUserIdSqlResult: SelectPacket;
			var checkUserIdClassMembersSqlResult: SelectPacket;
			var checkStudentSubjectSqlResult: SelectPacket;
			var insertClassMembersSql: string = 'INSERT INTO classesMembers (classId, userId) VALUES (?, ?)';
			for (var i = 0; i < usersIds.length; i++) {
				checkUserIdSqlResult = await dbConnection.executeInTransaction<SelectPacket>(transaction, 'SELECT userId FROM users WHERE userId = ? AND universityId = ?', [usersIds[i], universityId]);
				if (checkUserIdSqlResult.length != 1) {
					await dbConnection.rollbackTransactionAndClose(transaction);
					responseObject = {
						succ: false,
						mes: 'Can not find user with that id under your university',
					};
					res.status(200).send(responseObject);
					return;
				}
				checkUserIdClassMembersSqlResult = await dbConnection.executeInTransaction<SelectPacket>(transaction, 'SELECT userId FROM classesMembers WHERE userId = ?', [usersIds[i]]);
				if (checkUserIdClassMembersSqlResult.length != 0) {
					await dbConnection.rollbackTransactionAndClose(transaction);
					responseObject = {
						succ: false,
						mes: 'Can not add the same user twice',
					};
					res.status(200).send(responseObject);
					return;
				}
				checkStudentSubjectSqlResult = await dbConnection.execute<SelectPacket>(
					`SELECT studentsYears.userId FROM studentsYears
INNER JOIN yearsSubjects ON yearsSubjects.yearId = studentsYears.yearId
WHERE studentsYears.userId = ? AND studentsYears.studyYearId = ? AND yearsSubjects.yearSubjectId = ?`,
					[usersIds[i], studyYearId, yearSubjectId]
				);
				if (checkStudentSubjectSqlResult.length != 1) {
					await dbConnection.rollbackTransactionAndClose(transaction);
					responseObject = {
						succ: false,
						mes: 'There is no user with that email has the selected subject',
					};
					res.status(200).send(responseObject);
					return;
				}
				await dbConnection.executeInTransaction<NormalPacket>(transaction, insertClassMembersSql, [classId, usersIds[i]]);
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
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/delete/member', handleCheckProfessorMiddleware(dbConnection, loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
		interface CurrentBody {
			classId: number;
			memberUserId: number;
		}
		var body: CurrentBody = req.body;
		var responseObject: CustomResponseObject;
		if (!('classId' in body && 'memberUserId' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var classId: number = body.classId;
		var memberUserId: number = body.memberUserId;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		var checkClassMemberIdAndClassIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT classesMembers.classMemberId FROM classesMembers
INNER JOIN classes ON classes.classId = classesMembers.classId
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE classesMembers.userId = ? AND classesMembers.classId = ? AND studyYears.universityId = ?`,
			[memberUserId, classId, universityId]
		);
		if (checkClassMemberIdAndClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to delete this member as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (userRole == 2 && !(await accountMethodsObj.checkIfClassMember(classId, userId))) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to delete this member as you are not in that class',
			};
			res.status(200).send(responseObject);
			return;
		}
		await dbConnection.execute<NormalPacket>('DELETE FROM classesMembers WHERE userId = ? AND classId = ?', [memberUserId, classId]);
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/members/:classId', async (req: Request, res: Response) => {
		var classId: number = parseInt(req.params.classId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		if (userRole != 3 && !(await accountMethodsObj.checkIfClassMember(classId, userId))) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to get the members as you are not in that class',
			};
			res.status(200).send(responseObject);
			return;
		}
		var classMembersSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT users.userId, users.email, CONCAT_WS(' ', users.firstName, users.lastName) as fullName FROM classesMembers
INNER JOIN users ON users.userId = classesMembers.userId
INNER JOIN classes ON classes.classId = classesMembers.classId
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE classes.classId = ? AND studyYears.universityId = ?`,
			[classId, universityId]
		);
		var classMembersDetails: UserTableDetails[] = [];
		var currentUserIndex: number = null;
		for (var i = 0; i < classMembersSqlResult.length; i++) {
			if (classMembersSqlResult[i].userId == userId) {
				currentUserIndex = i;
				continue;
			}
			classMembersDetails.push({
				userId: classMembersSqlResult[i].userId,
				fullname: classMembersSqlResult[i].fullName,
				email: classMembersSqlResult[i].email,
			});
		}
		if (currentUserIndex != null) {
			classMembersDetails.unshift({
				userId: classMembersSqlResult[currentUserIndex].userId,
				fullname: classMembersSqlResult[currentUserIndex].fullName + ' (You)',
				email: classMembersSqlResult[currentUserIndex].email,
			});
		}
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				classMembersDetails: classMembersDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/create/class', handleCheckProfessorMiddleware(dbConnection, loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
		interface CurrentBody {
			studyYearId: number;
			classSuffix: string;
			classPrefix: string;
			className: string;
			yearSubjectId: number;
			description: string;
			usersIds: number[];
		}
		var body: CurrentBody = req.body;
		var responseObject: CustomResponseObject;
		if (!('studyYearId' in body && 'classSuffix' in body && 'classPrefix' in body && 'className' in body && 'yearSubjectId' in body && 'description' in body && 'usersIds' in body)) {
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
		var studyYearId: number = body.studyYearId;
		var classSuffix: string = body.classSuffix;
		var classPrefix: string = body.classPrefix;
		var className: string = body.className || null;
		var yearSubjectId: number = body.yearSubjectId || null;
		var description: string = body.description;
		var usersIds: number[] = body.usersIds;
		var checkStudyYearIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT studyYearId FROM studyYears WHERE universityId = ? AND studyYearId = ?', [
			universityId,
			studyYearId,
		]);
		if (checkStudyYearIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to use this study year as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (yearSubjectId) {
			var checkYearSubjectIdIdSqlResult = await dbConnection.execute<SelectPacket>(
				`SELECT yearsSubjects.yearSubjectId FROM yearsSubjects
INNER JOIN subjects ON subjects.subjectId = yearsSubjects.subjectId
WHERE subjects.universityId = ? AND yearsSubjects.yearSubjectId = ?`,
				[universityId, yearSubjectId]
			);
			if (checkYearSubjectIdIdSqlResult.length != 1) {
				responseObject = {
					succ: false,
					mes: 'You don not permissions to use this year subject as is not under your university',
				};
				res.status(200).send(responseObject);
				return;
			}
		}
		var classLongId: string = uuidv4();
		var transaction = await dbConnection.startTransaction();
		try {
			var classInserSqlResult: NormalPacket = await dbConnection.executeInTransaction<NormalPacket>(
				transaction,
				'INSERT INTO classes (studyYearId, yearSubjectId, classLongId, className, classPrefix, classSuffix, classDescription) VALUES (?, ?, ?, ?, ?, ?, ?)',
				[studyYearId, yearSubjectId, classLongId, className, classPrefix, classSuffix, description]
			);
			var checkUserIdSqlResult: SelectPacket;
			var checkStudentSubjectSqlResult: SelectPacket;
			var insertClassMembersSql: string = 'INSERT INTO classesMembers (classId, userId) VALUES (?, ?)';
			await dbConnection.executeInTransaction<NormalPacket>(transaction, insertClassMembersSql, [classInserSqlResult.insertId, userId]);
			for (var i = 0; i < usersIds.length; i++) {
				checkUserIdSqlResult = await dbConnection.executeInTransaction<SelectPacket>(transaction, 'SELECT userId FROM users WHERE userId = ? AND universityId = ?', [usersIds[i], universityId]);
				if (checkUserIdSqlResult.length != 1) {
					await dbConnection.rollbackTransactionAndClose(transaction);
					responseObject = {
						succ: false,
						mes: 'Can not find user with that id under your university',
					};
					res.status(200).send(responseObject);
					return;
				}
				checkStudentSubjectSqlResult = await dbConnection.execute<SelectPacket>(
					`SELECT studentsYears.userId FROM studentsYears
INNER JOIN yearsSubjects ON yearsSubjects.yearId = studentsYears.yearId
WHERE studentsYears.userId = ? AND studentsYears.studyYearId = ? AND yearsSubjects.yearSubjectId = ?`,
					[usersIds[i], studyYearId, yearSubjectId]
				);
				if (checkStudentSubjectSqlResult.length != 1) {
					await dbConnection.rollbackTransactionAndClose(transaction);
					responseObject = {
						succ: false,
						mes: 'There is no user with that email has the selected subject',
					};
					res.status(200).send(responseObject);
					return;
				}
				await dbConnection.executeInTransaction<NormalPacket>(transaction, insertClassMembersSql, [classInserSqlResult.insertId, usersIds[i]]);
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
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/get/user-id/from/email', handleCheckProfessorMiddleware(dbConnection, loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
		interface CurrentBody {
			email: string;
			yearSubjectId?: number;
			studyYearId?: number;
			classId?: number;
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
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		if (userRole != 3 && !(await accountMethodsObj.checkIfClassMember(classId, userId))) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to get the class details as you are not in that class',
			};
			res.status(200).send(responseObject);
			return;
		}
		var email: string = body.email;
		var yearSubjectId: number = body.yearSubjectId || null;
		var studyYearId: number = body.studyYearId || null;
		var classId: number = body.classId || null;
		var getUserIdFromEmailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT userId, role, disabled FROM users WHERE email = ? AND universityId = ?', [email, universityId]);
		var displayText: string = email;
		if (getUserIdFromEmailSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'There is no user with that email under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (getUserIdFromEmailSqlResult[0].disabled) {
			responseObject = {
				succ: false,
				mes: 'The user is disabled',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (getUserIdFromEmailSqlResult[0].role == 1) {
			if (classId != null && yearSubjectId == null && studyYearId == null) {
				var checkClassIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
					`SELECT classes.classId FROM classes
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE classes.classId = ? AND studyYears.universityId = ?`,
					[classId, universityId]
				);
				if (checkClassIdSqlResult.length != 1) {
					responseObject = {
						succ: false,
						mes: 'You don not permissions to edit this class as is not under your university',
					};
					res.status(200).send(responseObject);
					return;
				}
				var getYearSubjectIdAndStudyYearIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT yearSubjectId, studyYearId FROM classes WHERE classId = ?', [classId]);
				if (getYearSubjectIdAndStudyYearIdSqlResult.length != 1) {
					responseObject = {
						succ: false,
						mes: 'Could not find that class id',
					};
					res.status(200).send(responseObject);
					return;
				}
				studyYearId = getYearSubjectIdAndStudyYearIdSqlResult[0].studyYearId;
				yearSubjectId = getYearSubjectIdAndStudyYearIdSqlResult[0].yearSubjectId;
			}
			var checkStudentSubjectSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
				`SELECT studentsYears.userId FROM studentsYears
INNER JOIN yearsSubjects ON yearsSubjects.yearId = studentsYears.yearId
WHERE studentsYears.userId = ? AND studentsYears.studyYearId = ? AND yearsSubjects.yearSubjectId = ?`,
				[getUserIdFromEmailSqlResult[0].userId, studyYearId, yearSubjectId]
			);
			if (checkStudentSubjectSqlResult.length != 1) {
				responseObject = {
					succ: false,
					mes: 'There is no user with that email has the selected subject',
				};
				res.status(200).send(responseObject);
				return;
			}
		} else if (getUserIdFromEmailSqlResult[0].role == 2) {
			displayText += ' (Professor)';
		} else if (getUserIdFromEmailSqlResult[0].role == 3) {
			displayText += ' (Admin)';
		}
		var studyYearStudentDetails: StudyYearStudentDetails = {
			userId: getUserIdFromEmailSqlResult[0].userId,
			email: displayText,
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

	router.get('/get/class-subjects/:isArchived?', handleCheckProfessorMiddleware(dbConnection, loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
		var isArchived: boolean = parseInt(req.params.isArchived) == 1 ? true : parseInt(req.params.isArchived) == 0 ? false : null;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var subjectsSqlResult: SelectPacket;
		if (isArchived != null) {
			subjectsSqlResult = await dbConnection.execute<SelectPacket>(
				`SELECT yearsSubjects.yearSubjectId, subjects.subjectName, programs.programShortName, yearsSubjects.semesterIndex, years.yearIndex FROM yearsSubjects
INNER JOIN subjects ON subjects.subjectId = yearsSubjects.subjectId
INNER JOIN years ON years.yearId = yearsSubjects.yearId
INNER JOIN programs ON programs.programId = years.programId
WHERE subjects.universityId = ? AND subjects.archived = ?
ORDER BY programs.createdDate, years.yearIndex, yearsSubjects.semesterIndex ASC`,
				[universityId, isArchived]
			);
		} else {
			subjectsSqlResult = await dbConnection.execute<SelectPacket>(
				`SELECT yearsSubjects.yearSubjectId, subjects.subjectName, programs.programShortName, yearsSubjects.semesterIndex, years.yearIndex FROM yearsSubjects
INNER JOIN subjects ON subjects.subjectId = yearsSubjects.subjectId
INNER JOIN years ON years.yearId = yearsSubjects.yearId
INNER JOIN programs ON programs.programId = years.programId
WHERE subjects.universityId = ?
ORDER BY programs.createdDate, years.yearIndex, yearsSubjects.semesterIndex ASC`,
				[universityId]
			);
		}
		var classSubjectsDropdownDetails: ClassSubjectDropdownDetails[] = [];
		for (var i = 0; i < subjectsSqlResult.length; i++) {
			classSubjectsDropdownDetails.push({
				yearSubjectId: subjectsSqlResult[i].yearSubjectId,
				name: `${subjectsSqlResult[i].programShortName} - Year ${subjectsSqlResult[i].yearIndex} - Sem ${subjectsSqlResult[i].semesterIndex} - ${subjectsSqlResult[i].subjectName}`,
			});
		}
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				classSubjectsDropdownDetails: classSubjectsDropdownDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/classes/student-year-id/:studentYearId', async (req: Request, res: Response) => {
		var studentYearId: number = parseInt(req.params.studentYearId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		var responseObject: CustomResponseObject;
		var getYearIdAndStudyYearIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT yearId, studyYearId FROM studentsYears WHERE studentYearId = ?', [studentYearId]);
		if (getYearIdAndStudyYearIdSqlResult.length != 1) {
			responseObject = {
				succ: true,
				data: {
					classesPreviewDetails: [],
				},
			};
			res.status(200).send(responseObject);
			return;
		}
		var classesSqlResult: SelectPacket;
		if (userRole == 3) {
			classesSqlResult = await dbConnection.execute<SelectPacket>(
				`SELECT classes.classId, classes.classPrefix, classes.classSuffix, classes.className, classes.classLongId, subjects.subjectName, subjects.credits FROM classes
INNER JOIN yearsSubjects ON yearsSubjects.yearSubjectId = classes.yearSubjectId
INNER JOIN subjects ON subjects.subjectId = yearsSubjects.subjectId
WHERE classes.studyYearId = ? AND yearsSubjects.yearId = ? AND subjects.universityId = ?`,
				[getYearIdAndStudyYearIdSqlResult[0].studyYearId, getYearIdAndStudyYearIdSqlResult[0].yearId, universityId]
			);
		} else {
			classesSqlResult = await dbConnection.execute<SelectPacket>(
				`SELECT classes.classId, classes.classPrefix, classes.classSuffix, classes.className, classes.classLongId, subjects.subjectName, subjects.credits FROM classes
INNER JOIN yearsSubjects ON yearsSubjects.yearSubjectId = classes.yearSubjectId
INNER JOIN subjects ON subjects.subjectId = yearsSubjects.subjectId
INNER JOIN classesMembers ON classesMembers.classId = classes.classId
WHERE classes.studyYearId = ? AND yearsSubjects.yearId = ? AND subjects.universityId = ? AND classesMembers.userId = ?`,
				[getYearIdAndStudyYearIdSqlResult[0].studyYearId, getYearIdAndStudyYearIdSqlResult[0].yearId, universityId, userId]
			);
		}
		var classesPreviewDetails: ClassPreviewDetails[] = [];
		var className: string = '';
		for (var i = 0; i < classesSqlResult.length; i++) {
			if (classesSqlResult[i].subjectName) {
				className = classesSqlResult[i].classPrefix + ' ' + classesSqlResult[i].subjectName + ' ' + classesSqlResult[i].classSuffix;
			} else {
				className = classesSqlResult[i].className;
			}
			classesPreviewDetails.push({
				classId: classesSqlResult[i].classId,
				classLongId: classesSqlResult[i].classLongId,
				className: className,
				classCredits: classesSqlResult[i].credits,
			});
		}
		responseObject = {
			succ: true,
			data: {
				classesPreviewDetails: classesPreviewDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/classes/study-year-id/:studyYearId', async (req: Request, res: Response) => {
		var studyYearId: number = parseInt(req.params.studyYearId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		var classesSqlResult: SelectPacket;
		if (userRole == 3) {
			classesSqlResult = await dbConnection.execute<SelectPacket>(
				`SELECT classes.classId, classes.classPrefix, classes.classSuffix, classes.className, classes.classLongId, subjects.subjectName, subjects.credits FROM classes
INNER JOIN yearsSubjects ON yearsSubjects.yearSubjectId = classes.yearSubjectId
INNER JOIN subjects ON subjects.subjectId = yearsSubjects.subjectId
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE studyYears.universityId = ? AND studyYears.studyYearId = ?`,
				[universityId, studyYearId]
			);
		} else {
			classesSqlResult = await dbConnection.execute<SelectPacket>(
				`SELECT classes.classId, classes.classPrefix, classes.classSuffix, classes.className, classes.classLongId, subjects.subjectName, subjects.credits FROM classes
INNER JOIN yearsSubjects ON yearsSubjects.yearSubjectId = classes.yearSubjectId
INNER JOIN subjects ON subjects.subjectId = yearsSubjects.subjectId
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
INNER JOIN classesMembers ON classesMembers.classId = classes.classId
WHERE studyYears.universityId = ? AND studyYears.studyYearId = ? AND classesMembers.userId = ?`,
				[universityId, studyYearId, userId]
			);
		}
		var classesPreviewDetails: ClassPreviewDetails[] = [];
		var className: string = '';
		for (var i = 0; i < classesSqlResult.length; i++) {
			if (classesSqlResult[i].subjectName) {
				className = classesSqlResult[i].classPrefix + ' ' + classesSqlResult[i].subjectName + ' ' + classesSqlResult[i].classSuffix;
			} else {
				className = classesSqlResult[i].className;
			}
			classesPreviewDetails.push({
				classId: classesSqlResult[i].classId,
				classLongId: classesSqlResult[i].classLongId,
				className: className,
				classCredits: classesSqlResult[i].credits,
			});
		}
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				classesPreviewDetails: classesPreviewDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});
}
