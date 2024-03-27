import { Router, Request, Response } from 'express';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';
import { DbHandler, NormalPacket, SelectPacket } from '@raducualexandrumircea/custom-db-handler';
import { LoginMethods, LoginMethodsInterface } from '@raducualexandrumircea/lunaris-login';
import { AccountMethods } from '@raducualexandrumircea/lunaris-account';
import { SessionInterface } from '@raducualexandrumircea/redis-session-manager';
import { CustomResponseObject, UserEditDetails, UserTableDetails } from '@raducualexandrumircea/lunaris-interfaces';
import multer from 'multer';
import { saveImage } from '@raducualexandrumircea/lunaris-file';
import { checkIfEmailIsValid } from '@raducualexandrumircea/lunaris-regex-checks';
import { LoginAuthenticate } from '@raducualexandrumircea/login-authenticate';

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

export function appRoutes(router: Router, dbConnection: DbHandler, loginMethodsObj: LoginMethods, accountMethodsObj: AccountMethods, upload: multer.Multer) {

  router.get('/', async (req: Request, res: Response) => {
    res.status(200).send(environmentParserObj.get('SERVER_NAME', 'string', false) || 'root path works');
  });

  router.get('/get/admin/:adminUserId', async (req: Request, res: Response) => {
    var adminUserId: number = parseInt(req.params.adminUserId);
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
    var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
    var adminSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>("SELECT email, firstName, lastName, disabled FROM users WHERE universityId = ? AND role = 3 AND userId = ?", [universityId, adminUserId]);
    if (adminSqlResult.length != 1) {
      responseObject = {
        succ: false,
        mes: 'Found more than one admin with that id',
      };
      res.status(200).send(responseObject);
      return;
    }
    var adminEditDetails: UserEditDetails = {
      email: adminSqlResult[0].email,
      firstName: adminSqlResult[0].firstName,
      lastName: adminSqlResult[0].lastName,
      disabled: adminSqlResult[0].disabled,
    };
    var responseObject: CustomResponseObject = {
      succ: true,
      data: {
        adminEditDetails: adminEditDetails
      }
    }
    res.status(200).send(responseObject);
    return;
  });

  router.get('/get/admins', async (req: Request, res: Response) => {
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
    var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
    var adminsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>("SELECT userId, email, CONCAT_WS(' ', firstName, lastName) as fullName FROM users WHERE universityId = ? AND role = 3", [universityId]);
    var adminsTableDetails: UserTableDetails[] = [];
    for (var i = 0; i < adminsSqlResult.length; i++) {
      adminsTableDetails.push({
        userId: adminsSqlResult[i].userId,
        email: adminsSqlResult[i].email,
        fullname: adminsSqlResult[i].fullName,
      });
    }
    var responseObject: CustomResponseObject = {
      succ: true,
      data: {
        adminsTableDetails: adminsTableDetails
      }
    }
    res.status(200).send(responseObject);
    return;
  });

  router.post('/create/admin', async (req: Request, res: Response) => {
    interface CurrentBody {
      firstName: string,
      lastName: string
      email: string,
      password: string
    }
    var body: CurrentBody = req.body;
    var responseObject: CustomResponseObject;
    if (!('firstName' in body && 'lastName' in body && 'email' in body && 'password' in body)) {
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
    var firstName: string = body.firstName;
    var lastName: string = body.lastName;
    var email: string = body.email;
    var password: string = body.password;
    if (!firstName) {
      responseObject = {
        succ: false,
        mes: 'Please enter a valid firstname',
      };
      res.status(200).send(responseObject);
      return;
    }
    if (!lastName) {
      responseObject = {
        succ: false,
        mes: 'Please enter a valid lastname',
      };
      res.status(200).send(responseObject);
      return;
    }
    if (!checkIfEmailIsValid(email)) {
      responseObject = {
        succ: false,
        mes: 'Please enter a valid email',
      };
      res.status(200).send(responseObject);
      return;
    }
    if (!password) {
      responseObject = {
        succ: false,
        mes: 'Please enter a valid password',
      };
      res.status(200).send(responseObject);
      return;
    }
    var emailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT userId FROM users WHERE email = ?', [email]);
    if (emailSqlResult.length != 0) {
      responseObject = {
        succ: false,
        mes: 'This email is already in use',
      };
      res.status(200).send(responseObject);
      return;
    }
    var loginAuthenticateObj: LoginAuthenticate = new LoginAuthenticate();
    var hashedPassword: string = loginAuthenticateObj.hashPassword(password);
    await dbConnection.execute<NormalPacket>('INSERT INTO users (universityId, email, hashedPassword, role, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?)', [universityId, email, hashedPassword, 3, firstName, lastName]);
    responseObject = {
      succ: true,
    }
    res.status(200).send(responseObject);
    return;
  });

  router.post('/update/admin', async (req: Request, res: Response) => {
    interface CurrentBody {
      firstName: string,
      lastName: string
      email: string,
      password: string,
      disabled: boolean,
      adminUserId: number
    }
    var body: CurrentBody = req.body;
    var responseObject: CustomResponseObject;
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
    var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
    if (!('adminUserId' in body)) {
      responseObject = {
        succ: false,
        mes: 'Something went wrong',
        debugMes: 'Invalid number of POST parameters',
      };
      res.status(200).send(responseObject);
      return;
    }
    var firstName: string = body.firstName;
    var lastName: string = body.lastName;
    var email: string = body.email;
    var password: string = body.password;
    var disabled: boolean = body.disabled;
    var adminUserId: number = body.adminUserId;
    if (email) {
      if (!checkIfEmailIsValid(email)) {
        responseObject = {
          succ: false,
          mes: 'Please enter a valid email',
        };
        res.status(200).send(responseObject);
        return;
      }
      var emailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT userId FROM users WHERE email = ?', [email]);
      if (emailSqlResult.length != 0) {
        responseObject = {
          succ: false,
          mes: 'This email is already in use',
        };
        res.status(200).send(responseObject);
        return;
      }
    }
    if (firstName) {
      await dbConnection.execute<NormalPacket>('UPDATE users SET firstName = ? WHERE userId = ? AND universityId = ?', [firstName, adminUserId, universityId]);
    }
    if (lastName) {
      await dbConnection.execute<NormalPacket>('UPDATE users SET lastName = ? WHERE userId = ? AND universityId = ?', [lastName, adminUserId, universityId]);
    }
    if (email) {
      await dbConnection.execute<NormalPacket>('UPDATE users SET email = ? WHERE userId = ? AND universityId = ?', [email, adminUserId, universityId]);
    }
    if (password) {
      var loginAuthenticateObj: LoginAuthenticate = new LoginAuthenticate();
      var hashedPassword: string = loginAuthenticateObj.hashPassword(password);
      await dbConnection.execute<NormalPacket>('UPDATE users SET hashedPassword = ? WHERE userId = ? AND universityId = ?', [hashedPassword, adminUserId, universityId]);
    }
    if (disabled != undefined) {
      await dbConnection.execute<NormalPacket>('UPDATE users SET disabled = ? WHERE userId = ? AND universityId = ?', [disabled, adminUserId, universityId]);
    }
    responseObject = {
      succ: true,
    }
    res.status(200).send(responseObject);
    return;
  });

  router.get('/get/professor/:professorUserId', async (req: Request, res: Response) => {
    var professorUserId: number = parseInt(req.params.professorUserId);
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
    var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
    var professorSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>("SELECT email, firstName, lastName, disabled FROM users WHERE universityId = ? AND role = 2 AND userId = ?", [universityId, professorUserId]);
    if (professorSqlResult.length != 1) {
      responseObject = {
        succ: false,
        mes: 'Found more than one professor with that id',
      };
      res.status(200).send(responseObject);
      return;
    }
    var professorEditDetails: UserEditDetails = {
      email: professorSqlResult[0].email,
      firstName: professorSqlResult[0].firstName,
      lastName: professorSqlResult[0].lastName,
      disabled: professorSqlResult[0].disabled,
    };
    var responseObject: CustomResponseObject = {
      succ: true,
      data: {
        professorEditDetails: professorEditDetails
      }
    }
    res.status(200).send(responseObject);
    return;
  });

  router.get('/get/professors', async (req: Request, res: Response) => {
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
    var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
    var professorsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>("SELECT userId, email, CONCAT_WS(' ', firstName, lastName) as fullName FROM users WHERE universityId = ? AND role = 2", [universityId]);
    var professorsTableDetails: UserTableDetails[] = [];
    for (var i = 0; i < professorsSqlResult.length; i++) {
      professorsTableDetails.push({
        userId: professorsSqlResult[i].userId,
        email: professorsSqlResult[i].email,
        fullname: professorsSqlResult[i].fullName,
      });
    }
    var responseObject: CustomResponseObject = {
      succ: true,
      data: {
        professorsTableDetails: professorsTableDetails
      }
    }
    res.status(200).send(responseObject);
    return;
  });

  router.post('/create/professor', async (req: Request, res: Response) => {
    interface CurrentBody {
      firstName: string,
      lastName: string
      email: string,
      password: string
    }
    var body: CurrentBody = req.body;
    var responseObject: CustomResponseObject;
    if (!('firstName' in body && 'lastName' in body && 'email' in body && 'password' in body)) {
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
    var firstName: string = body.firstName;
    var lastName: string = body.lastName;
    var email: string = body.email;
    var password: string = body.password;
    if (!firstName) {
      responseObject = {
        succ: false,
        mes: 'Please enter a valid firstname',
      };
      res.status(200).send(responseObject);
      return;
    }
    if (!lastName) {
      responseObject = {
        succ: false,
        mes: 'Please enter a valid lastname',
      };
      res.status(200).send(responseObject);
      return;
    }
    if (!checkIfEmailIsValid(email)) {
      responseObject = {
        succ: false,
        mes: 'Please enter a valid email',
      };
      res.status(200).send(responseObject);
      return;
    }
    if (!password) {
      responseObject = {
        succ: false,
        mes: 'Please enter a valid password',
      };
      res.status(200).send(responseObject);
      return;
    }
    var emailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT userId FROM users WHERE email = ?', [email]);
    if (emailSqlResult.length != 0) {
      responseObject = {
        succ: false,
        mes: 'This email is already in use',
      };
      res.status(200).send(responseObject);
      return;
    }
    var loginAuthenticateObj: LoginAuthenticate = new LoginAuthenticate();
    var hashedPassword: string = loginAuthenticateObj.hashPassword(password);
    await dbConnection.execute<NormalPacket>('INSERT INTO users (universityId, email, hashedPassword, role, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?)', [universityId, email, hashedPassword, 2, firstName, lastName]);
    responseObject = {
      succ: true,
    }
    res.status(200).send(responseObject);
    return;
  });

  router.post('/update/professor', async (req: Request, res: Response) => {
    interface CurrentBody {
      firstName: string,
      lastName: string
      email: string,
      password: string,
      disabled: boolean,
      professorUserId: number
    }
    var body: CurrentBody = req.body;
    var responseObject: CustomResponseObject;
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
    var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
    if (!('professorUserId' in body)) {
      responseObject = {
        succ: false,
        mes: 'Something went wrong',
        debugMes: 'Invalid number of POST parameters',
      };
      res.status(200).send(responseObject);
      return;
    }
    var firstName: string = body.firstName;
    var lastName: string = body.lastName;
    var email: string = body.email;
    var password: string = body.password;
    var disabled: boolean = body.disabled;
    var professorUserId: number = body.professorUserId;
    if (email) {
      if (!checkIfEmailIsValid(email)) {
        responseObject = {
          succ: false,
          mes: 'Please enter a valid email',
        };
        res.status(200).send(responseObject);
        return;
      }
      var emailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT userId FROM users WHERE email = ?', [email]);
      if (emailSqlResult.length != 0) {
        responseObject = {
          succ: false,
          mes: 'This email is already in use',
        };
        res.status(200).send(responseObject);
        return;
      }
    }
    if (firstName) {
      await dbConnection.execute<NormalPacket>('UPDATE users SET firstName = ? WHERE userId = ? AND universityId = ?', [firstName, professorUserId, universityId]);
    }
    if (lastName) {
      await dbConnection.execute<NormalPacket>('UPDATE users SET lastName = ? WHERE userId = ? AND universityId = ?', [lastName, professorUserId, universityId]);
    }
    if (email) {
      await dbConnection.execute<NormalPacket>('UPDATE users SET email = ? WHERE userId = ? AND universityId = ?', [email, professorUserId, universityId]);
    }
    if (password) {
      var loginAuthenticateObj: LoginAuthenticate = new LoginAuthenticate();
      var hashedPassword: string = loginAuthenticateObj.hashPassword(password);
      await dbConnection.execute<NormalPacket>('UPDATE users SET hashedPassword = ? WHERE userId = ? AND universityId = ?', [hashedPassword, professorUserId, universityId]);
    }
    if (disabled != undefined) {
      await dbConnection.execute<NormalPacket>('UPDATE users SET disabled = ? WHERE userId = ? AND universityId = ?', [disabled, professorUserId, universityId]);
    }
    responseObject = {
      succ: true,
    }
    res.status(200).send(responseObject);
    return;
  });

  router.get('/get/university-name', async (req: Request, res: Response) => {
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
    var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
    var universityNameSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT universityName FROM universities WHERE universityId = ?', [universityId]);
    var responseObject: CustomResponseObject;
    if (universityNameSqlResult.length != 1) {
      responseObject = {
        succ: false,
        mes: 'Found more than one university name',
      };
      res.status(200).send(responseObject);
      return;
    }
    responseObject = {
      succ: true,
      data: {
        universityName: universityNameSqlResult[0].universityName
      }
    }
    res.status(200).send(responseObject);
    return;
  });

  router.get('/get/university-long-id', async (req: Request, res: Response) => {
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
    var universityLongId: string = await accountMethodsObj.getUserUniveristyLongId(userId);
    var responseObject: CustomResponseObject = {
      succ: true,
      data: {
        universityLongId: universityLongId
      }
    };
    res.status(200).send(responseObject);
    return;
  });

  router.route('/update/university-settings').post(upload.single('universityLogo'), async (req: Request, res: Response) => {
    interface CurrentBody {
      universityName: string;
    }
    var responseObject: CustomResponseObject;
    var body: CurrentBody = req.body;
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
    var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
    var universityName: string = JSON.parse(body.universityName) || null;
    var universityLogo = req.file as Express.Multer.File || null;
    var staticPath: string = environmentParserObj.get('STATIC_FOLDER_PATH', 'string', true);
    if (universityName) {
      await dbConnection.execute<NormalPacket>('UPDATE universities SET universityName = ? WHERE universityId = ?', [universityName, universityId]);
    }
    if (universityLogo) {
      var universityLongId: string = await accountMethodsObj.getUserUniveristyLongId(userId);
      await saveImage(universityLogo.buffer, staticPath + '/universities-images', `${universityLongId}.png`);
    }
    responseObject = {
      succ: true,
    }
    res.status(200).send(responseObject);
    return;
  });

}
