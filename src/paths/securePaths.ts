import { Router, Request, Response } from 'express';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';
import { CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';
import { SocketManager } from '@raducualexandrumircea/redis-socket-manager';

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

export function secureRoutes(router: Router, socketManagerObj: SocketManager) {
	router.get('/', async (req: Request, res: Response) => {
		res
			.status(200)
			.send(environmentParserObj.get('SERVER_NAME', 'string', false) || 'root path works');
	});

	router.post('/disconnect-sessions-sockets', async (req: Request, res: Response) => {
		interface CurrentBody {
			sessionId: string;
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req['reqPayload'];
		if (!('sessionId' in body)) {
			responseObject = {
				succ: false,
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var sessionId: string = body.sessionId;
		var sessionSockets: string[] = await socketManagerObj.getRoomSocketIds(sessionId);
		console.log(sessionSockets);
		if (sessionSockets != undefined) {
			for (var i = 0; i < sessionSockets.length; i++) {
				await socketManagerObj.deleteUser(sessionSockets[i]);
				await socketManagerObj.disconnectUser(sessionSockets[i]);
			}
		}
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});
}
