import express, { NextFunction } from 'express';
import { Router, Express } from 'express';
import { Server, Socket } from 'socket.io';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';
import { SessionInterface, SessionManager, handleSessionManagementMiddleware, handleSessionManagementSocketMiddleware } from '@raducualexandrumircea/redis-session-manager';
import { RedisConnectionRelation } from '@raducualexandrumircea/redis-connection';
import { healthRoutes } from '@raducualexandrumircea/lunaris-health-paths';
import { DbHandler } from '@raducualexandrumircea/custom-db-handler';
import { ServerCommunication, secureRoutesMiddleware } from '@raducualexandrumircea/lunaris-server-communication';
import { LoginMethods, LoginMethodsInterface, handleCheckLoginMiddleware } from '@raducualexandrumircea/lunaris-login';
import { getCorsOptions } from '@raducualexandrumircea/lunaris-general';
import { SocketMethods } from '@raducualexandrumircea/lunaris-socket-methods';
import { AccountMethods, handleCheckDisabledMiddleware } from '@raducualexandrumircea/lunaris-account';
import { secureRoutes } from './paths/securePaths';
import { socketRoutes } from './paths/socketPaths';
import { SocketInterface, SocketManager, handleSocketManagementMiddleware } from '@raducualexandrumircea/redis-socket-manager';
import { SharedSocketServer } from '@raducualexandrumircea/shared-socket-server';

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

const appUrl: string = environmentParserObj.get('APP_URL', 'string', true);
const websiteUrl: string = environmentParserObj.get('WEBSITE_URL', 'string', true);

const socketPort: number = environmentParserObj.get('SOCKET_PORT', 'number', true);

const apiVersion: string = environmentParserObj.get('API_VERSION', 'string', true);
const serverPort: number = environmentParserObj.get('SERVER_PORT', 'number', true);
const pathPrefix: string = environmentParserObj.get('PATH_PREFIX', 'string', true);

const redisSocketUrl: string = environmentParserObj.get('REDIS_SOCKET_URL', 'string', true);

const redisSessionUrls: string[] = environmentParserObj.get('SESSION_REDIS_URLS', 'array', true);

const sessionManagerPrefix: string = environmentParserObj.get('SESSION_MANAGER_PREFIX', 'string', true);
const sessionManagerParser: string = environmentParserObj.get('SESSION_MANAGER_PARSER', 'string', true);
const sessionManagerSessionExpSec: number = environmentParserObj.get('SESSION_MANAGER_SESSION_EXP_SEC', 'number', true);
const sessionManagerCookieName: string = environmentParserObj.get('SESSION_MANAGER_COOKIE_NAME', 'string', true);
const sessionManagerCookieDomain: string = environmentParserObj.get('SESSION_MANAGER_COOKIE_DOMAIN', 'string', true);
const sessionManagerCookieExpSec: number = environmentParserObj.get('SESSION_MANAGER_COOKIE_EXP_SEC', 'number', true);

const loginCookieExpInDays: number = environmentParserObj.get('LOGIN_COOKIE_EXP_DAYS', 'number', true);
const loginSessionExpInMin: number = environmentParserObj.get('LOGIN_SESSION_EXP_MIN', 'number', true);
const loginCookieName: string = environmentParserObj.get('LOGIN_COOKIE_NAME', 'string', true);
const loginCookieDomain: string = environmentParserObj.get('LOGIN_COOKIE_DOMAIN', 'string', true);

const namespace: string = environmentParserObj.get('NAMESPACE', 'string', true);
const serverCommunicationKey: string = environmentParserObj.get('SERVER_COMMUNICATION_KEY', 'string', true);

/* const smtpHost: string = environmentParserObj.get('SMTP_HOST', 'string', true);
const smtpPort: number = environmentParserObj.get('SMTP_PORT', 'number', true);
const noReplyEmail: string = environmentParserObj.get('NO_REPLY_EMAIL', 'string', true);
const noReplyPassword: string = environmentParserObj.get('NO_REPLY_PASSWORD', 'string', true);
const emailTemplatesFolder: string = environmentParserObj.get('EMAIL_TEMPLATES_FOLDER', 'string', true); */

const sharedSocketServerEmitChannelName: string = environmentParserObj.get('SHARED_SOCKET_SERVER_EMIT_CHANNEL_NAME', 'string', true);
const sharedSocketServerOnChannelName: string = environmentParserObj.get('SHARED_SOCKET_SERVER_ON_CHANNEL_NAME', 'string', true);
const sharedSocketServerConnectedChannelName: string = environmentParserObj.get('SHARED_SOCKET_SERVER_CONNECTED_CHANNEL_NAME', 'string', true);
const sharedSocketServerDisconnectedChannelName: string = environmentParserObj.get('SHARED_SOCKET_SERVER_DISCONNECTED_CHANNEL_NAME', 'string', true);
const sharedSocketServerDisconnectUserChannelName: string = environmentParserObj.get('SHARED_SOCKET_SERVER_DISCONNECT_USER_CHANNEL_NAME', 'string', true);

const socketManagerSocketPrefix: string = environmentParserObj.get('SOCKET_MANAGER_SOCKET_PREFIX', 'string', true);
const socketManagerRoomPrefix: string = environmentParserObj.get('SOCKET_MANAGER_ROOM_PREFIX', 'string', true);
const socketManagerParser: string = environmentParserObj.get('SOCKET_MANAGER_PARSER', 'string', true);
const socketManagerPrivateRsaKey: string = environmentParserObj.get('SOCKET_RSA_PRIVATE_KEY', 'string', false) || '';
const socketManagerPublicRsaKey: string = environmentParserObj.get('SOCKET_RSA_PUBLIC_KEY', 'string', false) || '';
const socketManagerPublicRsaKeyHash: string = environmentParserObj.get('SOCKET_RSA_PUBLIC_HASH', 'string', false) || '';
const useCustomAesSocketProtocol: boolean = environmentParserObj.get('USE_CUSTOM_AES_SOCKET_PROTOCOL', 'boolean', false) || false;

const dbConnectionHost: string = environmentParserObj.get('DB_CONN_HOST', 'string', true);
const dbConnectionUser: string = environmentParserObj.get('DB_CONN_USER', 'string', true);
const dbConnectionPassword: string = environmentParserObj.get('DB_CONN_PASS', 'string', true);
const dbConnectionDb: string = environmentParserObj.get('DB_CONN_DB', 'string', true);

const socketServer: Server = new Server(socketPort, {
	cors: getCorsOptions([appUrl]),
});

const sharedSocketServerObj: SharedSocketServer = new SharedSocketServer(redisSocketUrl, socketServer, sharedSocketServerEmitChannelName, sharedSocketServerOnChannelName, sharedSocketServerConnectedChannelName, sharedSocketServerDisconnectedChannelName, sharedSocketServerDisconnectUserChannelName);
const dbConnection: DbHandler = new DbHandler(dbConnectionHost, dbConnectionUser, dbConnectionPassword, dbConnectionDb, 'utf8mb4');
const redisConnectionObj: RedisConnectionRelation = new RedisConnectionRelation(redisSessionUrls);
const sessionManagerObj: SessionManager = new SessionManager({
	redisObj: redisConnectionObj,
	sessionPrefix: sessionManagerPrefix,
	sessionParser: sessionManagerParser,
	sessionExpInSec: sessionManagerSessionExpSec,
	sessionCookieName: sessionManagerCookieName,
	sessionCookieDomain: sessionManagerCookieDomain,
	isSecureCookie: true,
	sessionCookieExpInSec: sessionManagerCookieExpSec,
});
const socketManagerObj: SocketManager = new SocketManager(redisConnectionObj, sharedSocketServerObj, socketManagerSocketPrefix, socketManagerRoomPrefix, socketManagerParser, 'string', socketManagerPrivateRsaKey, socketManagerPublicRsaKey, socketManagerPublicRsaKeyHash, useCustomAesSocketProtocol);
const serverCommunicationObj: ServerCommunication = new ServerCommunication(namespace, serverCommunicationKey);
const loginMethodsObj: LoginMethods = new LoginMethods(loginCookieName, loginCookieDomain, loginCookieExpInDays, loginSessionExpInMin, serverCommunicationObj);
const socketMethodsObj: SocketMethods = new SocketMethods(serverCommunicationObj);
const accountMethodsObj: AccountMethods = new AccountMethods(dbConnection);

const handleCheckLoginSocketMiddleware = (sessionManagerObj: SessionManager, loginMethodsObj: LoginMethods, socketManagerObj: SocketManager) => {
	return async function (socket: Socket, next: NextFunction) {
		try {
			var sessionId: string = socket['sessionId'];
			var loginMethodsInterfaceObj: LoginMethodsInterface;
			var sessionInterfaceObj: SessionInterface;
			var socketInterfaceObj: SocketInterface;
			var userId: number;
			if (sessionId == undefined || sessionId == null || sessionId == '') {
				socket.disconnect();
				next(new Error('Invalid login session'));
			} else {
				sessionInterfaceObj = new SessionInterface(sessionManagerObj, sessionId);
				loginMethodsInterfaceObj = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
				userId = await loginMethodsInterfaceObj.getLoggedInUserId();
				socketInterfaceObj = new SocketInterface(socketManagerObj, socket.id);
				if (await loginMethodsInterfaceObj.checkLoginObject()) {
					console.log('connection established: ' + socket.id);
					// check if the user is authenticated
					await socketInterfaceObj.createSocketUser();
					await socketInterfaceObj.addUserToRoom(`user-${userId}`);
					next();
				} else {
					// otherwise send invalid login response
					socket.disconnect();
					next(new Error('Invalid login session'));
				}
			}
		} catch (err) {
			socket.disconnect();
			console.log(err);
		}
	};
};

const handleCheckUserDisabledSocketMiddleware = (sessionManagerObj: SessionManager, loginMethodsObj: LoginMethods, socketMethodsObj: SocketMethods, accountMethodsObj: AccountMethods) => {
	return async function (socket: Socket, next: NextFunction) {
		try {
			var sessionId: string = socket['sessionId'];
			var sessionInterfaceObj: SessionInterface = new SessionInterface(sessionManagerObj, sessionId);
			var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
			var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
			if (await accountMethodsObj.checkIfUserIsDisabled(userId)) {
				await socketMethodsObj.disconnectSessionsSockets(sessionId);
				next(new Error('User disabled'));
			} else {
				next();
			}
		} catch (err) {
			socket.disconnect();
			console.log(err);
		}
	};
};

socketServer.use(handleSessionManagementSocketMiddleware(sessionManagerObj));
socketServer.use(handleSocketManagementMiddleware(socketManagerObj));
socketServer.use(handleCheckLoginSocketMiddleware(sessionManagerObj, loginMethodsObj, socketManagerObj));
socketServer.use(handleCheckUserDisabledSocketMiddleware(sessionManagerObj, loginMethodsObj, socketMethodsObj, accountMethodsObj));

const app: Express = express();
const router: Router = Router();
const secureRouter: Router = Router();

app.use(cors(getCorsOptions([appUrl, websiteUrl])));
app.use(cookieParser());
secureRouter.use(express.urlencoded({ extended: false }));
secureRouter.use(bodyParser.text());
secureRouter.use(secureRoutesMiddleware(serverCommunicationObj));

router.use(express.urlencoded({ limit: '50mb', extended: false }));
router.use(bodyParser.text({ limit: '50mb' }));

app.use(`/apiv${apiVersion}` + pathPrefix, router);

app.listen(serverPort, () => {
	console.log(`server listening on http://localhost:${serverPort}`);
});

secureRoutes(router);
socketRoutes(socketManagerObj, serverCommunicationObj, accountMethodsObj);
healthRoutes(app);
