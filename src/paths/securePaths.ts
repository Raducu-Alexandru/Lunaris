import { Router, Request, Response } from 'express';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';
import { DbHandler, NormalPacket, SelectPacket } from '@raducualexandrumircea/custom-db-handler';
import { LoginMethods } from '@raducualexandrumircea/lunaris-login';
import { AccountMethods } from '@raducualexandrumircea/lunaris-account';
import { ClassMessageDetails, CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

export function secureRoutes(router: Router, dbConnection: DbHandler, loginMethodsObj: LoginMethods, accountMethodsObj: AccountMethods) {
	router.get('/', async (req: Request, res: Response) => {
		res.status(200).send(environmentParserObj.get('SERVER_NAME', 'string', false) || 'root path works');
	});

	router.post('/create/class/message', async (req: Request, res: Response) => {
		interface CurrentBody {
			userId: number;
			classId: number;
			content: string;
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		if (!('userId' in body && 'classId' in body && 'content' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var userId: number = body.userId;
		var classId: number = body.classId;
		var content: string = body.content;
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		if (userRole != 3 && !(await accountMethodsObj.checkIfClassMember(classId, userId))) {
			responseObject = {
				succ: false,
				mes: 'You don not permissions to send a message as you are not in that class',
			};
			res.status(200).send(responseObject);
			return;
		}
		if (!content) {
			responseObject = {
				succ: false,
				mes: 'Please enter a message',
			};
			res.status(200).send(responseObject);
			return;
		}
		var messageNormalSqlResult: NormalPacket = await dbConnection.execute<NormalPacket>('INSERT INTO classesMessages (classId, userId, content) VALUES (?, ?, ?)', [classId, userId, content]);
		var fullnameSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>("SELECT CONCAT_WS(' ', users.firstName, users.lastName) as fullName FROM users WHERE users.userId = ?", [userId]);
		var socketSendObject: ClassMessageDetails = {
			userId: userId,
			classMessageId: messageNormalSqlResult.insertId,
			content: content,
			fullname: fullnameSqlResult.length == 1 ? fullnameSqlResult[0].fullName : 'No fullname found',
		};
		responseObject = {
			succ: true,
			data: {
				messageId: messageNormalSqlResult.insertId,
				socketSendObject: socketSendObject,
			},
		};
		res.status(200).send(responseObject);
		return;
	});
}
