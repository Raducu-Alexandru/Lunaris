import { Router, Request, Response } from 'express';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';
import { DbHandler, SelectPacket } from '@raducualexandrumircea/custom-db-handler';
import { LoginMethods, LoginMethodsInterface } from '@raducualexandrumircea/lunaris-login';
import { AccountMethods } from '@raducualexandrumircea/lunaris-account';
import multer from 'multer';
import { SessionInterface } from '@raducualexandrumircea/redis-session-manager';
import { CustomResponseObject, FileAssignmentDetails } from '@raducualexandrumircea/lunaris-interfaces';
import * as path from 'path';

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

export function appRoutes(router: Router, dbConnection: DbHandler, loginMethodsObj: LoginMethods, accountMethodsObj: AccountMethods, upload: multer.Multer) {
	router.get('/', async (req: Request, res: Response) => {
		res.status(200).send(environmentParserObj.get('SERVER_NAME', 'string', false) || 'root path works');
	});

	router.get('/assignment/user/download/:fileId', async (req: Request, res: Response) => {
		var fileId: number = parseInt(req.params.fileId);
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		var fileDestailsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT classes.classId, files.storedFileName, files.fileName FROM files
INNER JOIN classesAssignmentsUserFiles ON classesAssignmentsUserFiles.fileId = files.fileId
INNER JOIN classesAssignments ON classesAssignments.classAssigId = classesAssignmentsUserFiles.classAssigId
INNER JOIN classes ON classes.classId = classesAssignments.classId
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE files.fileId = ? AND studyYears.universityId = ?`,
			[fileId, universityId]
		);
		if (fileDestailsSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Could not find assignment file',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (userRole != 3 && !(await accountMethodsObj.checkIfClassMember(fileDestailsSqlResult[0].classId, userId))) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to get this file as you are not in that class',
			};
			res.status(200).send(responseObject);
			return;
		}
		res.setHeader('Content-Disposition', 'attachment; filename=' + fileDestailsSqlResult[0].fileName);
		res.sendFile(path.join('/files', fileDestailsSqlResult[0].storedFileName));
		return;
	});

	router.post('/assignment/user/details', async (req: Request, res: Response) => {
		interface CurrentBody {
			filesIds: number[];
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		if (!('filesIds' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var filesIds: number[] = body.filesIds;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		var fileDestailsSqlResult: SelectPacket;
		var filesAssignmentDetails: FileAssignmentDetails[] = [];
		for (var fileId of filesIds) {
			fileDestailsSqlResult = await dbConnection.execute<SelectPacket>(
				`SELECT files.fileName, files.fileId, classes.classId FROM files
INNER JOIN classesAssignmentsUserFiles ON classesAssignmentsUserFiles.fileId = files.fileId
INNER JOIN classesAssignments ON classesAssignments.classAssigId = classesAssignmentsUserFiles.classAssigId
INNER JOIN classes ON classes.classId = classesAssignments.classId
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE files.fileId = ? AND studyYears.universityId = ?`,
				[fileId, universityId]
			);
			if (fileDestailsSqlResult.length != 1) {
				continue;
			}
			if (userRole != 3 && !(await accountMethodsObj.checkIfClassMember(fileDestailsSqlResult[0].classId, userId))) {
				continue;
			}
			filesAssignmentDetails.push({
				fileId: fileId,
				fileName: fileDestailsSqlResult[0].fileName,
			});
		}
		responseObject = {
			succ: true,
			data: {
				filesAssignmentDetails: filesAssignmentDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/assignment/download/:fileId', async (req: Request, res: Response) => {
		var fileId: number = parseInt(req.params.fileId);
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		var fileDestailsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT classes.classId, files.storedFileName, files.fileName FROM files
INNER JOIN classesAssignmentsFiles ON classesAssignmentsFiles.fileId = files.fileId
INNER JOIN classesAssignments ON classesAssignments.classAssigId = classesAssignmentsFiles.classAssigId
INNER JOIN classes ON classes.classId = classesAssignments.classId
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE files.fileId = ? AND studyYears.universityId = ?`,
			[fileId, universityId]
		);
		if (fileDestailsSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Could not find assignment file',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (userRole != 3 && !(await accountMethodsObj.checkIfClassMember(fileDestailsSqlResult[0].classId, userId))) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to get this file as you are not in that class',
			};
			res.status(200).send(responseObject);
			return;
		}
		res.setHeader('Content-Disposition', 'attachment; filename=' + fileDestailsSqlResult[0].fileName);
		res.sendFile(path.join('/files', fileDestailsSqlResult[0].storedFileName));
		return;
	});

	router.post('/assignment/details', async (req: Request, res: Response) => {
		interface CurrentBody {
			filesIds: number[];
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		if (!('filesIds' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var filesIds: number[] = body.filesIds;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		var fileDestailsSqlResult: SelectPacket;
		var filesAssignmentDetails: FileAssignmentDetails[] = [];
		for (var fileId of filesIds) {
			fileDestailsSqlResult = await dbConnection.execute<SelectPacket>(
				`SELECT files.fileName, files.fileId, classes.classId FROM files
INNER JOIN classesAssignmentsFiles ON classesAssignmentsFiles.fileId = files.fileId
INNER JOIN classesAssignments ON classesAssignments.classAssigId = classesAssignmentsFiles.classAssigId
INNER JOIN classes ON classes.classId = classesAssignments.classId
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE files.fileId = ? AND studyYears.universityId = ?`,
				[fileId, universityId]
			);
			if (fileDestailsSqlResult.length != 1) {
				continue;
			}
			if (userRole != 3 && !(await accountMethodsObj.checkIfClassMember(fileDestailsSqlResult[0].classId, userId))) {
				continue;
			}
			filesAssignmentDetails.push({
				fileId: fileId,
				fileName: fileDestailsSqlResult[0].fileName,
			});
		}
		responseObject = {
			succ: true,
			data: {
				filesAssignmentDetails: filesAssignmentDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});
}
