import { Router, Request, Response } from 'express';
import { DbHandler, SelectPacket } from '@raducualexandrumircea/custom-db-handler';
import { CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';
import { LoginMethods } from '@raducualexandrumircea/lunaris-login';
import { JwtMethods } from '@raducualexandrumircea/lunaris-jwt';

export function secureRoutes(secureRouter: Router, dbConnection: DbHandler, loginMethodsObj: LoginMethods, jwtMethodsObj: JwtMethods) {
	secureRouter.post('/create-jwt', async (req: Request, res: Response) => {
		interface CurrentBody {
			loginId: number;
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		if (!('loginId' in body)) {
			responseObject = {
				succ: false,
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var loginId: number = body.loginId;
		var jwt: string = jwtMethodsObj.createJwt(loginId);
		responseObject = {
			succ: true,
			data: {
				jwt: jwt,
			},
		};
		res.status(200).send(responseObject);
	});

	secureRouter.post('/check-login-id', async (req: Request, res: Response) => {
		interface CurrentBody {
			loginId: number;
			userId: number;
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		if (!('loginId' in body && 'userId' in body)) {
			responseObject = {
				succ: false,
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var loginId: number = body.loginId;
		var userId: number = body.userId;
		var selectSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT userId FROM logins WHERE loginId = ? AND userId = ?', [loginId, userId]);
		if (selectSqlResult.length != 1) {
			responseObject = {
				succ: false,
				debugMes: 'The loginId is not present in the database for the given userId',
			};
			res.status(200).send(responseObject);
			return;
		}
		responseObject = {
			succ: true,
		};
		await loginMethodsObj.updateJwtLastTimeUsed(dbConnection, loginId);
		res.status(200).send(responseObject);
		return;
	});

	secureRouter.post('/check-jwt', async (req: Request, res: Response) => {
		interface CurrentBody {
			jwt: string;
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		if (!('jwt' in body)) {
			responseObject = {
				succ: false,
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var jwt: string = body.jwt;
		var loginId: number = 0;
		var userId: number;
		var lastUsedTime: number;
		var sql: string;
		var value: any[];
		var selectSqlResult: SelectPacket;
		try {
			loginId = jwtMethodsObj.verifyJwt(jwt);
		} catch (err) {
			console.log(err);
		}
		if (loginId == 0) {
			responseObject = {
				succ: false,
				debugMes: 'The JWT is invalid',
			};
			res.status(200).send(responseObject);
			return;
		}
		sql = 'SELECT userId, lastUsedTime FROM logins WHERE loginId = ?';
		value = [loginId];
		selectSqlResult = await dbConnection.execute<SelectPacket>(sql, value);
		if (selectSqlResult.length != 1) {
			responseObject = {
				succ: false,
				debugMes: 'The JWT is not present in the database',
			};
			res.status(200).send(responseObject);
			return;
		}
		userId = selectSqlResult[0].userId;
		lastUsedTime = selectSqlResult[0].lastUsedTime.getTime();
		if (loginMethodsObj.checkIfJwtExpired(lastUsedTime)) {
			responseObject = {
				succ: false,
				debugMes: 'The JWT is expired',
			};
			res.status(200).send(responseObject);
			return;
		}
		await loginMethodsObj.updateJwtLastTimeUsed(dbConnection, loginId);
		responseObject = {
			succ: true,
			data: {
				userId: userId,
				loginId: loginId,
			},
		};
		res.status(200).send(responseObject);
	});
}
