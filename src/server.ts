import express from 'express';
import { Router, Express } from 'express';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';

import { appRoutes } from './paths/paths';
import { DbHandler } from '@raducualexandrumircea/custom-db-handler';

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

const apiVersion: string = environmentParserObj.get('API_VERSION', 'string', true);
const serverPort: number = environmentParserObj.get('SERVER_PORT', 'number', true);
const pathPrefix: string = environmentParserObj.get('PATH_PREFIX', 'string', true);

const dbConnectionHost: string = environmentParserObj.get('DB_CONN_HOST', 'string', true);
const dbConnectionUser: string = environmentParserObj.get('DB_CONN_USER', 'string', true);
const dbConnectionPassword: string = environmentParserObj.get('DB_CONN_PASS', 'string', true);
const loginConnectionDb: string = environmentParserObj.get('LOGIN_CONN_DB', 'string', true);

const loginDbConnection: DbHandler = new DbHandler(dbConnectionHost, dbConnectionUser, dbConnectionPassword, loginConnectionDb, 'utf8mb4');

const app: Express = express();
const router: Router = Router();

app.use(cookieParser());

router.use(express.urlencoded({ limit: '50mb', extended: false }));
router.use(bodyParser.text({ limit: '50mb' }));

app.use(`/apiv${apiVersion}` + pathPrefix, router);

app.listen(serverPort, () => {
  console.log(`server listening on http://localhost:${serverPort}`);
});

appRoutes(router);
