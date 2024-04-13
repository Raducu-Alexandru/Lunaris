import { DbHandler, SelectPacket } from '@raducualexandrumircea/custom-db-handler';
import { CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';
import { LoginMethods, LoginMethodsInterface } from '@raducualexandrumircea/lunaris-login';
import { SessionInterface } from '@raducualexandrumircea/redis-session-manager';
import { NextFunction, Request, Response } from 'express';

export class AccountMethods {
	dbConnection: DbHandler;

	constructor(dbConnection: DbHandler) {
		this.dbConnection = dbConnection;
	}

	async checkIfClassMember(classId: number, userId: number): Promise<boolean> {
		var checkIfUserInClassSqlResult: SelectPacket = await this.dbConnection.execute<SelectPacket>('SELECT classMemberId FROM classesMembers WHERE classId = ? AND userId = ?', [classId, userId]);
		return checkIfUserInClassSqlResult.length == 1;
	}

	async getUserRole(userId: number): Promise<number> {
		var sqlResult: SelectPacket = await this.dbConnection.execute<SelectPacket>('SELECT role FROM users WHERE userId = ?', [userId]);
		if (sqlResult.length != 1) {
			return null;
		}
		return sqlResult[0].role;
	}

	async getUserUniveristy(userId: number): Promise<number> {
		var sqlResult: SelectPacket = await this.dbConnection.execute<SelectPacket>('SELECT universityId FROM users WHERE userId = ?', [userId]);
		if (sqlResult.length != 1) {
			return null;
		}
		return sqlResult[0].universityId;
	}

	async getUserUniveristyLongId(userId: number): Promise<string> {
		var sqlResult: SelectPacket = await this.dbConnection.execute<SelectPacket>(
			`SELECT universities.universityLongId FROM universities
INNER JOIN users ON users.universityId = universities.universityId
WHERE users.userId = ?`,
			[userId]
		);
		if (sqlResult.length != 1) {
			return null;
		}
		return sqlResult[0].universityLongId;
	}

	async checkIfUserIsDisabled(userId: number): Promise<boolean> {
		var disabledSqlResult: SelectPacket = await this.dbConnection.execute<SelectPacket>('SELECT disabled FROM users WHERE userId = ?', [userId]);
		if (disabledSqlResult.length != 1) {
			return true;
		}
		return disabledSqlResult[0].disabled;
	}
}

export function handleCheckDisabledMiddleware(dbConnection: DbHandler, loginMethodsObj: LoginMethods, accountMethodsObj: AccountMethods) {
	return async (req: Request, res: Response, next: NextFunction) => {
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		if (await accountMethodsObj.checkIfUserIsDisabled(userId)) {
			responseObject = {
				succ: false,
				disabled: true,
			};
			res.status(200).send(responseObject);
			return;
		}
		next();
	};
}

export function handleCheckAdminMiddleware(loginMethodsObj: LoginMethods, accountMethodsObj: AccountMethods) {
	return async (req: Request, res: Response, next: NextFunction) => {
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		if (userRole != 3) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong!',
				debugMes: 'Not enough permissions',
			};
			res.status(200).send(responseObject);
			return;
		}
		next();
	};
}

export function handleCheckProfessorMiddleware(loginMethodsObj: LoginMethods, accountMethodsObj: AccountMethods) {
	return async (req: Request, res: Response, next: NextFunction) => {
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		if (userRole != 2 && userRole != 3) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong!',
				debugMes: 'Not enough permissions',
			};
			res.status(200).send(responseObject);
			return;
		}
		next();
	};
}
