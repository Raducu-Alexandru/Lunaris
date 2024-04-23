import express from 'express';
import { Router, Express } from 'express';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';

import { appRoutes } from './paths/paths';

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

const apiVersion: string = environmentParserObj.get('API_VERSION', 'string', true);
const serverPort: number = environmentParserObj.get('SERVER_PORT', 'number', true);
const pathPrefix: string = environmentParserObj.get('PATH_PREFIX', 'string', true);

const staticFolderPath: string = environmentParserObj.get('STATIC_FOLDER_PATH', 'string', false) || '/static';

const app: Express = express();
const router: Router = Router();

app.use(cookieParser());

router.use(express.urlencoded({ limit: '50mb', extended: false }));
router.use(bodyParser.text({ limit: '50mb' }));
router.use('/static', express.static(staticFolderPath));

app.use(`/apiv${apiVersion}` + pathPrefix, router);

app.listen(serverPort, () => {
  console.log(`server listening on http://localhost:${serverPort}`);
});

appRoutes(router);
