import { Router, Request, Response } from 'express';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';
import { DbHandler, NormalPacket, SelectPacket } from '@raducualexandrumircea/custom-db-handler';
import { LoginMethods, LoginMethodsInterface } from '@raducualexandrumircea/lunaris-login';
import { AccountMethods, handleCheckProfessorMiddleware } from '@raducualexandrumircea/lunaris-account';
import multer from 'multer';
import { SessionInterface } from '@raducualexandrumircea/redis-session-manager';
import {
	AssignmentDetails,
	AssignmentPreviewDetails,
	ClassDetails,
	ClassFinalGradeDetails,
	ClassPreviewDetails,
	ClassSubjectDropdownDetails,
	CustomResponseObject,
	FileAssignmentDetails,
	HandInAssignmentDetails,
	StudyYearStudentDetails,
	UpcommingDeadlinePreviewDetails,
	UserTableDetails,
} from '@raducualexandrumircea/lunaris-interfaces';
import { v4 as uuidv4 } from 'uuid';
import { FilesMethods } from '@raducualexandrumircea/lunaris-files';

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

export function appRoutes(router: Router, dbConnection: DbHandler, loginMethodsObj: LoginMethods, accountMethodsObj: AccountMethods, filesMethodsObj: FilesMethods, upload: multer.Multer) {
	router.get('/', async (req: Request, res: Response) => {
		res.status(200).send(environmentParserObj.get('SERVER_NAME', 'string', false) || 'root path works');
	});

	router.post('/update/assignment/:classAssigId/hand-in', async (req: Request, res: Response) => {
		interface CurrentBody {
			handIn: boolean;
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		if (!('handIn' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var classAssigId: number = parseInt(req.params.classAssigId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		var getClassIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT classId FROM classesAssignments WHERE classAssigId = ?', [classAssigId]);
		if (getClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Could not find the assignment',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (userRole != 1 || !(await accountMethodsObj.checkIfClassMember(getClassIdSqlResult[0].classId, userId))) {
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
			[getClassIdSqlResult[0].classId, universityId]
		);
		if (checkClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to edit this class as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		var handIn: boolean = body.handIn;
		var checkHandInSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT handedInDate FROM classesAssignmentsGrades WHERE classAssigId = ? AND userId = ?', [
			classAssigId,
			userId,
		]);
		var handedInDate: Date;
		if (checkHandInSqlResult.length == 0) {
			if (handIn) {
				handedInDate = new Date();
			} else {
				handedInDate = null;
			}
			await dbConnection.execute<NormalPacket>('INSERT INTO classesAssignmentsGrades (classAssigId, userId, handedInDate) VALUES (?, ?, ?)', [classAssigId, userId, handedInDate]);
		} else if (checkClassIdSqlResult.length == 1) {
			if (handIn) {
				handedInDate = new Date();
			} else {
				handedInDate = null;
			}
			await dbConnection.execute<NormalPacket>('UPDATE classesAssignmentsGrades SET handedInDate = ? WHERE classAssigId = ? AND userId = ?', [handedInDate, classAssigId, userId]);
		} else {
			responseObject = {
				succ: false,
				mes: 'Found more than one hand in',
			};
			res.status(200).send(responseObject);
			return;
		}
		responseObject = {
			succ: true,
			data: {
				handedInDate: handedInDate == null ? null : handedInDate.getTime(),
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/delete/assignment/:classAssigId/user-file/:fileId', async (req: Request, res: Response) => {
		var classAssigId: number = parseInt(req.params.classAssigId);
		var fileId: number = parseInt(req.params.fileId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		var responseObject: CustomResponseObject;
		var getClassIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT classId FROM classesAssignments WHERE classAssigId = ?', [classAssigId]);
		if (getClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Could not find the assignment',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (userRole != 1 || !(await accountMethodsObj.checkIfClassMember(getClassIdSqlResult[0].classId, userId))) {
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
			[getClassIdSqlResult[0].classId, universityId]
		);
		if (checkClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to edit this class as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		var checkHandInSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT handedInDate FROM classesAssignmentsGrades WHERE classAssigId = ? AND userId = ?', [
			classAssigId,
			userId,
		]);
		if (checkHandInSqlResult.length == 1) {
			if (checkHandInSqlResult[0].handedInDate != null) {
				responseObject = {
					succ: false,
					mes: 'Please undo the hand in then delete the file',
				};
				res.status(200).send(responseObject);
				return;
			}
		}
		var checkFileIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT fileId FROM classesAssignmentsUserFiles WHERE classAssigId = ? AND userId = ? AND fileId = ?', [
			classAssigId,
			userId,
			fileId,
		]);
		if (checkFileIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don t have permission under that file',
			};
			res.status(200).send(responseObject);
			return;
		}
		await dbConnection.execute<NormalPacket>('DELETE FROM classesAssignmentsUserFiles WHERE classAssigId = ? AND userId = ? AND fileId = ?', [classAssigId, userId, fileId]);
		await filesMethodsObj.deleteFiles([fileId]);
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.route('/upload/assignment/:classAssigId/user-file').post(upload.single('file'), async (req: Request, res: Response) => {
		var classAssigId: number = parseInt(req.params.classAssigId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		var responseObject: CustomResponseObject;
		var getClassIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT classId FROM classesAssignments WHERE classAssigId = ?', [classAssigId]);
		if (getClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Could not find the assignment',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (userRole != 1 || !(await accountMethodsObj.checkIfClassMember(getClassIdSqlResult[0].classId, userId))) {
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
			[getClassIdSqlResult[0].classId, universityId]
		);
		if (checkClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to edit this class as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		var file = (req.file as Express.Multer.File) || null;
		if (!file) {
			responseObject = {
				succ: false,
				mes: 'Please upload a file',
			};
			res.status(200).send(responseObject);
			return;
		}
		var checkHandInSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT handedInDate FROM classesAssignmentsGrades WHERE classAssigId = ? AND userId = ?', [
			classAssigId,
			userId,
		]);
		if (checkHandInSqlResult.length == 1) {
			if (checkHandInSqlResult[0].handedInDate != null) {
				responseObject = {
					succ: false,
					mes: 'Please undo the hand in then upload the file',
				};
				res.status(200).send(responseObject);
				return;
			}
		}
		var filesIds: number[] = await filesMethodsObj.sendFiles(userId, [], [file]);
		await dbConnection.execute<NormalPacket>('INSERT INTO classesAssignmentsUserFiles (classAssigId, userId, fileId) VALUES (?, ?, ?)', [classAssigId, userId, filesIds[0]]);
		var fileAssignmentDetails: FileAssignmentDetails = {
			fileId: filesIds[0],
			fileName: file.originalname,
		};
		responseObject = {
			succ: true,
			data: {
				fileAssignmentDetails: fileAssignmentDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/assignment/:classAssigId/hand-in-details', async (req: Request, res: Response) => {
		var classAssigId: number = parseInt(req.params.classAssigId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		var responseObject: CustomResponseObject;
		var getClassIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT classId FROM classesAssignments WHERE classAssigId = ?', [classAssigId]);
		if (getClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Could not find the assignment',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (userRole != 1 || !(await accountMethodsObj.checkIfClassMember(getClassIdSqlResult[0].classId, userId))) {
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
			[getClassIdSqlResult[0].classId, universityId]
		);
		if (checkClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to edit this class as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		var handedInAssignmentSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT handedInDate FROM classesAssignmentsGrades WHERE classAssigId = ? AND userId = ?', [
			classAssigId,
			userId,
		]);
		var handedInDate: number = null;
		if (handedInAssignmentSqlResult.length == 1) {
			handedInDate = handedInAssignmentSqlResult[0].handedInDate.getTime();
		}
		var fileIdsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT fileId FROM classesAssignmentsUserFiles WHERE classAssigId = ? AND userId = ?', [classAssigId, userId]);
		var handInAssignmentDetails: HandInAssignmentDetails = {
			handedInDate: handedInDate,
			filesIds: Array.from(fileIdsSqlResult, (val) => val.fileId),
		};
		responseObject = {
			succ: true,
			data: {
				handInAssignmentDetails: handInAssignmentDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/upcomming-deadlines', async (req: Request, res: Response) => {
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var responseObject: CustomResponseObject;
		var upcommingDeadlinesSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT classesAssignments.classAssigId, classesAssignments.classId, classesAssignments.classAssigName, classesAssignments.classAssigDesc, classesAssignments.dueDate FROM classesAssignments
INNER JOIN classesMembers ON classesMembers.classId = classesAssignments.classId
INNER JOIN users ON users.userId = classesMembers.userId
LEFT JOIN classesAssignmentsGrades ON classesAssignmentsGrades.classAssigId = classesAssignments.classAssigId
WHERE classesMembers.userId = ? AND users.universityId = ? AND classesAssignments.dueDate <= DATE_ADD(NOW(), INTERVAL 14 DAY) AND classesAssignments.dueDate >= DATE_SUB(NOW(), INTERVAL 14 DAY) AND classesAssignmentsGrades.handedInDate IS NULL
ORDER BY dueDate ASC`,
			[userId, universityId]
		);
		var upcommingDeadlinePreviewDetails: UpcommingDeadlinePreviewDetails[] = [];
		for (var i = 0; i < upcommingDeadlinesSqlResult.length; i++) {
			upcommingDeadlinePreviewDetails.push({
				classAssigId: upcommingDeadlinesSqlResult[i].classAssigId,
				classAssigName: upcommingDeadlinesSqlResult[i].classAssigName,
				classAssigDesc: upcommingDeadlinesSqlResult[i].classAssigDesc,
				dueDate: upcommingDeadlinesSqlResult[i].dueDate.getTime(),
				classId: upcommingDeadlinesSqlResult[i].classId,
			});
		}
		responseObject = {
			succ: true,
			data: {
				upcommingDeadlinePreviewDetails: upcommingDeadlinePreviewDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.route('/update/assignment/:classAssigId').post(upload.array('files'), handleCheckProfessorMiddleware(loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
		interface CurrentBody {
			name: string;
			dueDate: string;
			description: string;
			deletedFilesIds: string;
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		console.log('body', body);
		if (!('name' in body && 'dueDate' in body && 'description' in body && 'deletedFilesIds' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var classAssigId: number = parseInt(req.params.classAssigId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		var getClassIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT classId FROM classesAssignments WHERE classAssigId = ?', [classAssigId]);
		if (getClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Could not find the assignment',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (userRole != 3 && !(await accountMethodsObj.checkIfClassMember(getClassIdSqlResult[0].classId, userId))) {
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
			[getClassIdSqlResult[0].classId, universityId]
		);
		if (checkClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to edit this class as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		var name: string = body.name;
		var dueDate: number = parseInt(body.dueDate);
		var description: string = body.description;
		var deletedFilesIds: number[] = JSON.parse(body.deletedFilesIds);
		var files = (req.files as Express.Multer.File[]) || [];
		if (dueDate && dueDate <= new Date().getTime()) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid due date',
			};
			res.status(200).send(responseObject);
			return;
		}
		var transaction = await dbConnection.startTransaction();
		var filesIds: number[] = [];
		if (files.length > 0) {
			filesIds = await filesMethodsObj.sendFiles(userId, [], files);
		}
		try {
			if (name) {
				await dbConnection.executeInTransaction<NormalPacket>(transaction, 'UPDATE classesAssignments SET classAssigName = ? WHERE classAssigId = ?', [name, classAssigId]);
			}
			if (dueDate) {
				await dbConnection.executeInTransaction<NormalPacket>(transaction, 'UPDATE classesAssignments SET dueDate = ? WHERE classAssigId = ?', [new Date(dueDate), classAssigId]);
			}
			if (description) {
				await dbConnection.executeInTransaction<NormalPacket>(transaction, 'UPDATE classesAssignments SET classAssigDesc = ? WHERE classAssigId = ?', [description, classAssigId]);
			}
			var checkFileIdSqlResult: SelectPacket;
			for (var i = 0; i < deletedFilesIds.length; i++) {
				checkFileIdSqlResult = await dbConnection.executeInTransaction<SelectPacket>(transaction, 'SELECT fileId FROM classesAssignmentsFiles WHERE classAssigId = ? AND fileId = ?', [
					classAssigId,
					deletedFilesIds[i],
				]);
				if (checkFileIdSqlResult.length != 1) {
					await dbConnection.rollbackTransactionAndClose(transaction);
					responseObject = {
						succ: false,
						mes: 'The file you tried to delete was not found for this assignment',
					};
					res.status(200).send(responseObject);
					return;
				}
				await dbConnection.executeInTransaction<NormalPacket>(transaction, 'DELETE FROM classesAssignmentsFiles WHERE classAssigId = ? AND fileId = ?', [classAssigId, deletedFilesIds[i]]);
			}
			for (var i = 0; i < filesIds.length; i++) {
				await dbConnection.executeInTransaction<NormalPacket>(transaction, 'INSERT INTO classesAssignmentsFiles (classAssigId, fileId) VALUES (?, ?)', [classAssigId, filesIds[i]]);
			}
			await dbConnection.commitTransactionAndClose(transaction);
		} catch (err) {
			if (filesIds.length > 0) {
				await filesMethodsObj.deleteFiles(filesIds);
			}
			await dbConnection.rollbackTransactionAndClose(transaction);
			responseObject = {
				succ: false,
				mes: String(err),
			};
			res.status(200).send(responseObject);
			return;
		}
		if (deletedFilesIds.length > 0) {
			await filesMethodsObj.deleteFiles(deletedFilesIds);
		}
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/assignment/:classAssigId', async (req: Request, res: Response) => {
		var classAssigId: number = parseInt(req.params.classAssigId);
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		var getClassIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT classId FROM classesAssignments WHERE classAssigId = ?', [classAssigId]);
		if (getClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Could not find the assignment',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (userRole != 3 && !(await accountMethodsObj.checkIfClassMember(getClassIdSqlResult[0].classId, userId))) {
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
			[getClassIdSqlResult[0].classId, universityId]
		);
		if (checkClassIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to edit this class as is not under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		var assignmentSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT classAssigId, classAssigName, classAssigDesc, dueDate FROM classesAssignments WHERE classAssigId = ?', [
			classAssigId,
		]);
		var fileIdsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT fileId FROM classesAssignmentsFiles WHERE classAssigId = ?', [classAssigId]);
		var assignmentDetails: AssignmentDetails = {
			classAssigName: assignmentSqlResult[0].classAssigName,
			classAssigDesc: assignmentSqlResult[0].classAssigDesc,
			dueDate: assignmentSqlResult[0].dueDate.getTime(),
			filesIds: Array.from(fileIdsSqlResult, (val) => val.fileId),
			grade: null,
		};
		if (userRole == 1) {
			var getGradeSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT grade FROM classesAssignmentsGrades WHERE classAssigId = ? AND userId = ? AND handedInDate IS NOT NULL', [
				classAssigId,
				userId,
			]);
			if (getGradeSqlResult.length == 1) {
				assignmentDetails.grade = getGradeSqlResult[0].grade;
			}
		}
		responseObject = {
			succ: true,
			data: {
				assignmentDetails: assignmentDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.route('/create/assignment/:classId').post(upload.array('files'), handleCheckProfessorMiddleware(loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
		interface CurrentBody {
			name: string;
			dueDate: string;
			description: string;
		}
		var classId: number = parseInt(req.params.classId);
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		console.log('body', body);
		if (!('name' in body && 'dueDate' in body && 'description' in body)) {
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
		var name: string = body.name;
		var dueDate: number = parseInt(body.dueDate);
		var description: string = body.description;
		var files = (req.files as Express.Multer.File[]) || [];
		if (name == '') {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid name',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (dueDate <= new Date().getTime()) {
			responseObject = {
				succ: false,
				mes: 'Please enter a valid due date',
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
		console.log(files);
		var filesIds: number[] = [];
		if (files.length > 0) {
			filesIds = await filesMethodsObj.sendFiles(userId, [], files);
		}
		var transaction = await dbConnection.startTransaction();
		try {
			var assigInsertSqlResult: NormalPacket = await dbConnection.executeInTransaction<NormalPacket>(
				transaction,
				'INSERT INTO classesAssignments (classId, classAssigName, classAssigDesc, dueDate) VALUES (?, ?, ?, ?)',
				[classId, name, description, new Date(dueDate)]
			);
			for (var i = 0; i < filesIds.length; i++) {
				await dbConnection.executeInTransaction<NormalPacket>(transaction, 'INSERT INTO classesAssignmentsFiles (classAssigId, fileId) VALUES (?, ?)', [assigInsertSqlResult.insertId, filesIds[i]]);
			}
			await dbConnection.commitTransactionAndClose(transaction);
		} catch (err) {
			if (filesIds.length > 0) {
				await filesMethodsObj.deleteFiles(filesIds);
			}
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

	router.get('/get/class/:classId/assignments', async (req: Request, res: Response) => {
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
		var assignmentsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT classAssigId, classAssigName, classAssigDesc, dueDate FROM classesAssignments
WHERE classId = ?
ORDER BY dueDate ASC`,
			[classId]
		);
		var assignmentsPreviewDetails: AssignmentPreviewDetails[] = [];
		for (var i = 0; i < assignmentsSqlResult.length; i++) {
			assignmentsPreviewDetails.push({
				classAssigId: assignmentsSqlResult[i].classAssigId,
				classAssigName: assignmentsSqlResult[i].classAssigName,
				classAssigDesc: assignmentsSqlResult[i].classAssigDesc,
				dueDate: assignmentsSqlResult[i].dueDate.getTime(),
			});
		}
		responseObject = {
			succ: true,
			data: {
				assignmentsPreviewDetails: assignmentsPreviewDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/update/class/final-grade', handleCheckProfessorMiddleware(loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
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
		var checkIfFinalGradeExitsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT users.userId, users.email, CONCAT_WS(' ', users.firstName, users.lastName) as fullName, finalGrades.grade, studentsYears.studentYearId, yearsSubjects.subjectId FROM classesMembers
INNER JOIN users ON users.userId = classesMembers.userId
INNER JOIN classes ON classes.classId = classesMembers.classId
INNER JOIN yearsSubjects ON yearsSubjects.yearSubjectId = classes.yearSubjectId
INNER JOIN studentsYears ON studentsYears.userId = classesMembers.userId AND studentsYears.yearId = yearsSubjects.yearId AND studentsYears.studyYearId = classes.studyYearId
LEFT JOIN finalGrades ON finalGrades.studentYearId = studentsYears.studentYearId AND finalGrades.subjectId = yearsSubjects.subjectId
WHERE classes.classId = ? AND users.role = 1 AND users.universityId = ? AND users.userId = ?`,
			[classId, universityId, studentUserId]
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
				checkIfFinalGradeExitsSqlResult[0].subjectId,
			]);
		} else {
			var getSubjectCreditsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT credits FROM subjects WHERE subjectId = ?', [checkIfFinalGradeExitsSqlResult[0].subjectId]);
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
				checkIfFinalGradeExitsSqlResult[0].subjectId,
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

	router.get('/get/class/:classId/final-grades', handleCheckProfessorMiddleware(loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
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
		var getFinalGradesSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT users.userId, users.email, CONCAT_WS(' ', users.firstName, users.lastName) as fullName, finalGrades.grade FROM classesMembers
INNER JOIN users ON users.userId = classesMembers.userId
INNER JOIN classes ON classes.classId = classesMembers.classId
INNER JOIN yearsSubjects ON yearsSubjects.yearSubjectId = classes.yearSubjectId
INNER JOIN studentsYears ON studentsYears.userId = classesMembers.userId AND studentsYears.yearId = yearsSubjects.yearId AND studentsYears.studyYearId = classes.studyYearId
LEFT JOIN finalGrades ON finalGrades.studentYearId = studentsYears.studentYearId AND finalGrades.subjectId = yearsSubjects.subjectId
WHERE classes.classId = ?`,
			[classId]
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

	router.get('/get/class/:classId/year-subject-id', async (req: Request, res: Response) => {
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
		var classYearSubjectIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT classes.yearSubjectId FROM classes
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE classes.classId = ? AND studyYears.universityId = ?`,
			[classId, universityId]
		);
		if (classYearSubjectIdSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Can not find the class year subject id',
			};
			res.status(200).send(responseObject);
			return;
		}
		responseObject = {
			succ: true,
			data: {
				yearSubjectId: classYearSubjectIdSqlResult[0].yearSubjectId,
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
			`SELECT classes.classPrefix, classes.classSuffix, classes.className, subjects.subjectName, subjects.credits, classes.classDescription, subjects.subjectId, classes.studyYearId, yearsSubjects.yearId FROM classes
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
LEFT JOIN yearsSubjects ON yearsSubjects.yearSubjectId = classes.yearSubjectId
LEFT JOIN subjects ON subjects.subjectId = yearsSubjects.subjectId
WHERE classes.classId = ? AND studyYears.universityId = ?`,
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
		var finalGrade: number = null;
		if (classDetailsSqlResult[0].subjectId && userRole == 1) {
			var studentYearIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT studentYearId FROM studentsYears WHERE studyYearId = ? AND yearId = ? AND userId = ?', [
				classDetailsSqlResult[0].studyYearId,
				classDetailsSqlResult[0].yearId,
				userId,
			]);
			if (studentYearIdSqlResult.length == 1) {
				var finalGradeSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT grade FROM finalGrades WHERE studentYearId = ? AND subjectId = ?', [
					studentYearIdSqlResult[0].studentYearId,
					classDetailsSqlResult[0].subjectId,
				]);
				if (finalGradeSqlResult.length == 1) {
					finalGrade = finalGradeSqlResult[0].grade;
				}
			}
		}
		var classDetails: ClassDetails = {
			className: classDetailsSqlResult[0].subjectId
				? classDetailsSqlResult[0].classPrefix + ' ' + classDetailsSqlResult[0].subjectName + ' ' + classDetailsSqlResult[0].classSuffix
				: classDetailsSqlResult[0].className,
			classDescription: classDetailsSqlResult[0].classDescription,
			classCredits: classDetailsSqlResult[0].credits,
			classFinalGrade: finalGrade,
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

	router.post('/add/members', handleCheckProfessorMiddleware(loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
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

	router.post('/delete/member', handleCheckProfessorMiddleware(loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
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

	router.post('/create/class', handleCheckProfessorMiddleware(loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
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
		if (yearSubjectId != null) {
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
				if (yearSubjectId != null) {
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

	router.post('/get/user-id/from/email', handleCheckProfessorMiddleware(loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
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
			if (classId != null || (yearSubjectId != null && studyYearId != null)) {
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

	router.get('/get/class-subjects/:isArchived?', handleCheckProfessorMiddleware(loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
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
		var classesSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT classes.classId, classes.classPrefix, classes.classSuffix, classes.className, classes.classLongId, subjects.subjectName, subjects.credits, subjects.subjectId FROM classes
INNER JOIN yearsSubjects ON yearsSubjects.yearSubjectId = classes.yearSubjectId
INNER JOIN subjects ON subjects.subjectId = yearsSubjects.subjectId
INNER JOIN classesMembers ON classesMembers.classId = classes.classId
WHERE classes.studyYearId = ? AND yearsSubjects.yearId = ? AND subjects.universityId = ? AND classesMembers.userId = ?`,
			[getYearIdAndStudyYearIdSqlResult[0].studyYearId, getYearIdAndStudyYearIdSqlResult[0].yearId, universityId, userId]
		);
		var finalGradeSqlResult: SelectPacket;
		var classesPreviewDetails: ClassPreviewDetails[] = [];
		var className: string = '';
		for (var i = 0; i < classesSqlResult.length; i++) {
			if (classesSqlResult[i].subjectName) {
				className = classesSqlResult[i].classPrefix + ' ' + classesSqlResult[i].subjectName + ' ' + classesSqlResult[i].classSuffix;
			} else {
				className = classesSqlResult[i].className;
			}
			finalGradeSqlResult = await dbConnection.execute<SelectPacket>('SELECT grade FROM finalGrades WHERE studentYearId = ? AND subjectId = ?', [studentYearId, classesSqlResult[i].subjectId]);
			classesPreviewDetails.push({
				classId: classesSqlResult[i].classId,
				classLongId: classesSqlResult[i].classLongId,
				className: className,
				classCredits: classesSqlResult[i].credits,
				classFinalGrade: finalGradeSqlResult.length == 1 ? finalGradeSqlResult[0].grade : null,
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
		var classesSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT classes.classId, classes.classPrefix, classes.classSuffix, classes.className, classes.classLongId, subjects.subjectName, subjects.credits FROM classes
LEFT JOIN yearsSubjects ON yearsSubjects.yearSubjectId = classes.yearSubjectId
LEFT JOIN subjects ON subjects.subjectId = yearsSubjects.subjectId
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE studyYears.universityId = ? AND studyYears.studyYearId = ?`,
			[universityId, studyYearId]
		);
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
				classFinalGrade: null,
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
