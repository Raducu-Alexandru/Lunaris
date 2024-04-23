import express from 'express';
import { Router, Express } from 'express';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';

import { appRoutes } from './paths/paths';
import { SessionManager, handleSessionManagementMiddleware } from '@raducualexandrumircea/redis-session-manager';
import { RedisConnectionRelation } from '@raducualexandrumircea/redis-connection';
import { healthRoutes } from '@raducualexandrumircea/lunaris-health-paths';
import { DbHandler } from '@raducualexandrumircea/custom-db-handler';
import { ServerCommunication, secureRoutesMiddleware } from '@raducualexandrumircea/lunaris-server-communication';
import { LoginMethods, handleCheckLoginMiddleware } from '@raducualexandrumircea/lunaris-login';
import { getCorsOptions } from '@raducualexandrumircea/lunaris-general';
import { SocketMethods } from '@raducualexandrumircea/lunaris-socket-methods';
import { AccountMethods, handleCheckDisabledMiddleware } from '@raducualexandrumircea/lunaris-account';
import multer from 'multer';
import { secureRoutes } from './paths/securePaths';

const cookieParser = require('cookie-parser');
const cors = require('cors');

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

const appUrl: string = environmentParserObj.get('APP_URL', 'string', true);
const websiteUrl: string = environmentParserObj.get('WEBSITE_URL', 'string', true);

const apiVersion: string = environmentParserObj.get('API_VERSION', 'string', true);
const serverPort: number = environmentParserObj.get('SERVER_PORT', 'number', true);
const pathPrefix: string = environmentParserObj.get('PATH_PREFIX', 'string', true);

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

const dbConnectionHost: string = environmentParserObj.get('DB_CONN_HOST', 'string', true);
const dbConnectionUser: string = environmentParserObj.get('DB_CONN_USER', 'string', true);
const dbConnectionPassword: string = environmentParserObj.get('DB_CONN_PASS', 'string', true);
const dbConnectionDb: string = environmentParserObj.get('DB_CONN_DB', 'string', true);

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
const serverCommunicationObj: ServerCommunication = new ServerCommunication(namespace, serverCommunicationKey);
const loginMethodsObj: LoginMethods = new LoginMethods(loginCookieName, loginCookieDomain, loginCookieExpInDays, loginSessionExpInMin, serverCommunicationObj);
const socketMethodsObj: SocketMethods = new SocketMethods(serverCommunicationObj);
const accountMethodsObj: AccountMethods = new AccountMethods(dbConnection);

const app: Express = express();
const router: Router = Router();
const secureRouter: Router = Router();
const upload = multer({ limits: { fileSize: 1 * 1024 * 1024 * 1024 } });

app.use(cors(getCorsOptions([appUrl, websiteUrl])));
app.use(cookieParser());
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
router.use(handleSessionManagementMiddleware(sessionManagerObj));
router.use(handleCheckLoginMiddleware(loginMethodsObj, socketMethodsObj));
router.use(handleCheckDisabledMiddleware(dbConnection, loginMethodsObj, accountMethodsObj));

secureRouter.use(express.urlencoded({ extended: false }));
secureRouter.use(express.json());
//secureRouter.use(secureRoutesMiddleware(serverCommunicationObj));

app.use(`/apiv${apiVersion}` + pathPrefix, router);
app.use(pathPrefix, secureRouter);

app.listen(serverPort, () => {
	console.log(`server listening on http://localhost:${serverPort}`);
});

appRoutes(router, dbConnection, loginMethodsObj, accountMethodsObj, upload);
secureRoutes(secureRouter, dbConnection, upload);
healthRoutes(app);
