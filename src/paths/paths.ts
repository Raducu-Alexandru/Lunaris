import { Router, Request, Response } from 'express';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';
import { DbHandler, NormalPacket, SelectPacket } from '@raducualexandrumircea/custom-db-handler';
import { LoginMethods, LoginMethodsInterface } from '@raducualexandrumircea/lunaris-login';
import { SocketMethods } from '@raducualexandrumircea/lunaris-socket-methods';
import { ServerCommunication } from '@raducualexandrumircea/lunaris-server-communication';
import { JwtMethods } from '@raducualexandrumircea/lunaris-jwt';
import { UniversitySelectDetails, CustomResponseObject, DeviceTypes } from '@raducualexandrumircea/lunaris-interfaces';
import { SessionInterface } from '@raducualexandrumircea/redis-session-manager';
import { checkIfDeviceTypeIsValid, checkIfEmailIsValid, checkIfPasswordIsValid } from '@raducualexandrumircea/lunaris-regex-checks';
import { LoginAuthenticate } from '@raducualexandrumircea/login-authenticate';
import * as uid from 'uid-safe';
import { v4 as uuidv4 } from 'uuid';
import { SqlQueries } from '@raducualexandrumircea/lunaris-sql-queries';

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

export function appRoutes(router: Router, dbConnection: DbHandler, loginMethodsObj: LoginMethods, socketMethodsObj: SocketMethods, serverCommunicationObj: ServerCommunication, jwtMethodsObj: JwtMethods) {

  router.get('/', async (req: Request, res: Response) => {
    res.status(200).send(environmentParserObj.get('SERVER_NAME', 'string', false) || 'root path works');
  });

  router.get('/get/universities', async (req: Request, res: Response) => {
    var allUniversitiesSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT universityName, universityLongId FROM universities');
    var allUniversitiesSelectDetails: UniversitySelectDetails[] = [];
    for (var i = 0; i < allUniversitiesSqlResult.length; i++) {
      allUniversitiesSelectDetails.push({
        universityLongId: allUniversitiesSqlResult[i].universityLongId,
        universityName: allUniversitiesSqlResult[i].universityName,
      });
    }
    var responseObject: CustomResponseObject = {
      succ: true,
      data: {
        allUniversitiesSelectDetails: allUniversitiesSelectDetails
      }
    };
    res.status(200).send(responseObject);
    return;
  });

  router.get('/check-logged-in', async (req: Request, res: Response) => {
    var responseObject: CustomResponseObject;
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var sql: string;
    var value: any[];
    var selectSqlResult: SelectPacket;
    var jwtToken: string;
    var loginId: number = 0;
    var userId: number;
    var lastUsedTime: number;
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    jwtToken = loginMethodsInterfaceObj.loginMethodsObj.getJwt(req);
    if (await loginMethodsInterfaceObj.checkLoginObject()) {
      loginId = await loginMethodsInterfaceObj.getLoggedInLoginId();
      userId = await loginMethodsInterfaceObj.getLoggedInUserId();
      selectSqlResult = await dbConnection.execute<SelectPacket>('SELECT userId FROM logins WHERE loginId = ? AND userId = ?', [loginId, userId]);
      if (selectSqlResult.length != 1) {
        responseObject = {
          succ: false,
          loggedIn: false,
          debugMes: 'The loginId is not present in the database for the given userId',
        };
        loginMethodsInterfaceObj.loginMethodsObj.clearJwt(res);
        await loginMethodsInterfaceObj.deleteLoginObject();
        await socketMethodsObj.disconnectSessionsSockets(req['sessionId']);
        res.status(200).send(responseObject);
        return;
      }
    } else {
      if (!jwtToken) {
        responseObject = {
          succ: false,
          loggedIn: false,
          debugMes: 'The session is not logged in and the user did not present a JWT',
        };
        loginMethodsInterfaceObj.loginMethodsObj.clearJwt(res);
        await socketMethodsObj.disconnectSessionsSockets(req['sessionId']);
        res.status(200).send(responseObject);
        return;
      }
      try {
        loginId = jwtMethodsObj.verifyJwt(jwtToken);
      } catch (err) {
        console.log('Error in the dec of the JWT, ', err);
      }
      if (loginId == 0) {
        responseObject = {
          succ: false,
          loggedIn: false,
          debugMes: 'The JWT is invalid',
        };
        loginMethodsInterfaceObj.loginMethodsObj.clearJwt(res);
        await socketMethodsObj.disconnectSessionsSockets(req['sessionId']);
        res.status(200).send(responseObject);
        return;
      }
      sql = 'SELECT userId, lastUsedTime FROM logins WHERE loginId = ?';
      value = [loginId];
      selectSqlResult = await dbConnection.execute<SelectPacket>(sql, value);
      if (selectSqlResult.length != 1) {
        responseObject = {
          succ: false,
          loggedIn: false,
          debugMes: 'The JWT is not present in the database',
        };
        loginMethodsInterfaceObj.loginMethodsObj.clearJwt(res);
        await socketMethodsObj.disconnectSessionsSockets(req['sessionId']);
        res.status(200).send(responseObject);
        return;
      }
      userId = selectSqlResult[0].userId;
      lastUsedTime = selectSqlResult[0].lastUsedTime.getTime();
      if (loginMethodsObj.checkIfJwtExpired(lastUsedTime)) {
        responseObject = {
          succ: false,
          loggedIn: false,
          debugMes: 'The JWT is expired',
        };
        loginMethodsInterfaceObj.loginMethodsObj.clearJwt(res);
        await socketMethodsObj.disconnectSessionsSockets(req['sessionId']);
        res.status(200).send(responseObject);
        return;
      }
      await loginMethodsInterfaceObj.createLoginObject(userId, loginId);
    }
    loginMethodsInterfaceObj.loginMethodsObj.setJwt(res, jwtToken);
    await loginMethodsObj.updateJwtLastTimeUsed(dbConnection, loginId);
    responseObject = {
      succ: true,
      loggedIn: true,
    };
    res.status(200).send(responseObject);
    return;
  });

  router.post('/change-password', async (req: Request, res: Response) => {
    interface CurrentBody {
      password: string;
      token: string;
    }
    var body: CurrentBody = req.body;
    var responseObject: CustomResponseObject;
    if (!('password' in body && 'token' in body)) {
      responseObject = {
        succ: false,
        mes: 'Something went wrong',
        debugMes: 'Invalid number of POST parameters',
      };
      res.status(200).send(responseObject);
      return;
    }
    if (!checkIfPasswordIsValid(body.password)) {
      responseObject = {
        succ: false,
        mes: 'Something went wrong',
        debugMes: 'One of the parameters did not pass the regex check',
      };
      res.status(200).send(responseObject);
      return;
    }
    var sql: string;
    var value: any[];
    var values: any[];
    var selectSqlResult: SelectPacket;
    var password: string = body.password;
    var forgotPasswordToken: string = body.token;
    if (!(await loginMethodsObj.checkForgotPasswordToken(dbConnection, forgotPasswordToken))) {
      responseObject = {
        succ: false,
        mes: 'The used URL is expired or invalid, please resend the link',
      };
      res.status(200).send(responseObject);
      return;
    }
    sql = 'SELECT userId FROM userForgotPasswords WHERE forgotPasswordToken = ?';
    value = [forgotPasswordToken];
    selectSqlResult = await dbConnection.execute<SelectPacket>(sql, value);
    if (selectSqlResult.length != 1) {
      responseObject = {
        succ: false,
        mes: 'The used URL is expired or invalid, please resend the link',
      };
      res.status(200).send(responseObject);
      return;
    }
    var userId = selectSqlResult[0].userId;
    var loginAuthenticateObj: LoginAuthenticate = new LoginAuthenticate();
    var hashedPassword: string = loginAuthenticateObj.hashPassword(password);
    sql = 'UPDATE userForgotPasswords SET used = ? WHERE forgotPasswordToken = ?';
    values = [true, forgotPasswordToken];
    await dbConnection.execute<NormalPacket>(sql, values);
    sql = 'UPDATE users SET hashedPassword = ? WHERE userId = ?';
    values = [hashedPassword, new Date(), userId];
    await dbConnection.execute<NormalPacket>(sql, values);
    responseObject = {
      succ: true,
    };
    res.status(200).send(responseObject);
    return;
  });

  router.post('/check-forgot-password-token', async (req: Request, res: Response) => {
    interface CurrentBody {
      token: string;
    }
    var body: CurrentBody = req.body;
    console.log(body, body.token);
    var responseObject: CustomResponseObject;
    if (!('token' in body)) {
      responseObject = {
        succ: false,
        mes: 'Something went wrong',
        debugMes: 'Invalid number of POST parameters',
      };
      res.status(200).send(responseObject);
      return;
    }
    var forgotPasswordToken: string = body.token;
    if (!(await loginMethodsObj.checkForgotPasswordToken(dbConnection, forgotPasswordToken))) {
      responseObject = {
        succ: false,
        mes: 'The used URL is expired or invalid, please resend the link',
      };
      res.status(200).send(responseObject);
      return;
    }
    responseObject = {
      succ: true,
    };
    res.status(200).send(responseObject);
    return;
  });

  router.post('/send-forgot-password-email', async (req: Request, res: Response) => {
    interface CurrentBody {
      email: string;
    }
    var body: CurrentBody = req.body;
    var responseObject: CustomResponseObject;
    if (!('email' in body)) {
      responseObject = {
        succ: false,
        mes: 'Something went wrong',
        debugMes: 'Invalid number of POST parameters',
      };
      res.status(200).send(responseObject);
      return;
    }
    if (!checkIfEmailIsValid(body.email)) {
      responseObject = {
        succ: false,
        mes: 'Something went wrong',
        debugMes: 'One of the parameters did not pass the regex check',
      };
      res.status(200).send(responseObject);
      return;
    }
    var sql: string;
    var value: any[];
    var values: any[];
    var selectSqlResult: SelectPacket;
    var email: string = body.email;
    sql = 'SELECT userId, socialLogin FROM userCredentials WHERE email = ?';
    value = [email];
    selectSqlResult = await dbConnection.execute<SelectPacket>(sql, value);
    if (selectSqlResult.length != 1) {
      responseObject = {
        succ: false,
        mes: "There is no account with that email address, or it's using Social Login",
      };
      res.status(200).send(responseObject);
      return;
    }
    var userId: number = selectSqlResult[0].userId;
    var socialLogin: boolean = selectSqlResult[0].socialLogin;
    if (socialLogin) {
      responseObject = {
        succ: false,
        mes: "There is no account with that email address, or it's using Social Login",
      };
      res.status(200).send(responseObject);
      return;
    }
    var forgotPasswordToken: string = await uid(192);
    //var forgotPasswordToken: string = jwtMethodsObj.generateForgotPasswordToken(uuidv4());
    sql = 'SELECT userId FROM userForgotPasswords WHERE forgotPasswordToken = ?';
    value = [forgotPasswordToken];
    selectSqlResult = await dbConnection.execute<SelectPacket>(sql, value);
    while (selectSqlResult.length != 0) {
      forgotPasswordToken = jwtMethodsObj.generateForgotPasswordToken(uuidv4());
      sql = 'SELECT userId FROM userForgotPasswords WHERE forgotPasswordToken = ?';
      value = [forgotPasswordToken];
      selectSqlResult = await dbConnection.execute<SelectPacket>(sql, value);
    }
    sql = 'INSERT INTO userForgotPasswords (forgotPasswordToken, userId, createdDate, used) VALUES (?, ?, ?, ?)';
    values = [forgotPasswordToken, userId, new Date(), false];
    await dbConnection.execute<NormalPacket>(sql, values);
    selectSqlResult = await dbConnection.execute<SelectPacket>('SELECT firstName, lastName FROM users WHERE userId = ?', [userId]);
    var fullname: string;
    if (selectSqlResult.length != 1) {
      fullname = '';
    } else {
      fullname = selectSqlResult[0].firstName + selectSqlResult[0].lastName;
    }
    /*     const websiteUrl: string = environmentParserObj.get('WEBSITE_URL', 'string', true);
        var emailHtmlTemplate: HtmlTemplate = {
          templatePath: 'forgot-password.html',
          replacements: {
            fullname: fullname,
            apiBaseUrl: environmentParserObj.get('API_BASE_URL', 'string', true),
            apiVersion: environmentParserObj.get('API_VERSION', 'string', true),
            resetLink: `${websiteUrl}/reset-password/${forgotPasswordToken}`,
          },
        };
        await emailHandlerNoReplyObj.sendEmail(email, 'Password Reset', null, emailHtmlTemplate); */
    responseObject = {
      succ: true,
    };
    res.status(200).send(responseObject);
    return;
  });

  router.post('/credentials', async (req: Request, res: Response) => {
    interface CurrentBody {
      email: string;
      password: string;
      universityLongId: string;
      deviceType: DeviceTypes;
      deviceToken: string;
    }
    var body: CurrentBody = req.body;
    var responseObject: CustomResponseObject;
    if (!('email' in body && 'password' in body && 'universityLongId' in body && 'deviceType' in body && 'deviceToken' in body)) {
      responseObject = {
        succ: false,
        mes: 'Something went wrong',
        debugMes: 'Invalid number of POST parameters',
      };
      res.status(200).send(responseObject);
      return;
    }
    if (!(checkIfEmailIsValid(body.email) && checkIfPasswordIsValid(body.password) && checkIfDeviceTypeIsValid(body.deviceType))) {
      responseObject = {
        succ: false,
        mes: 'Something went wrong',
        debugMes: 'One of the parameters did not pass the regex check',
      };
      res.status(200).send(responseObject);
      return;
    }
    var sql: string;
    var value: any[];
    var selectSqlResult: SelectPacket;
    var loginAuthenticateObj: LoginAuthenticate = new LoginAuthenticate();
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var email: string = body.email;
    var password: string = body.password;
    var universityLongId: string = body.universityLongId;
    var deviceType: DeviceTypes = body.deviceType;
    var deviceToken: string = body.deviceToken;
    if (deviceToken == undefined) {
      deviceToken = null;
    }
    var sqlQueriesObj: SqlQueries = new SqlQueries(dbConnection);
    var universityId: number = await sqlQueriesObj.getUniversityIdFromLongId(universityLongId);
    sql = 'SELECT hashedPassword, userId FROM users WHERE email = ? AND universityId = ? AND disabled = ?';
    value = [email, universityId, false];
    selectSqlResult = await dbConnection.execute<SelectPacket>(sql, value);
    if (selectSqlResult.length != 1) {
      responseObject = {
        succ: false,
        mes: 'The email password or the university is incorrect',
      };
      res.status(200).send(responseObject);
      return;
    }
    var storedPasswordHash: string = selectSqlResult[0].hashedPassword;
    var userId: number = selectSqlResult[0].userId;
    if (!loginAuthenticateObj.verifyPassword(storedPasswordHash, password)) {
      responseObject = {
        succ: false,
        mes: 'The email password or the university is incorrect',
      };
      res.status(200).send(responseObject);
      return;
    }
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    await loginMethodsInterfaceObj.generateFinalLogin(dbConnection, req, res, userId, deviceType, deviceToken, true);
    responseObject = {
      succ: true,
      loggedIn: true
    };
    res.status(200).send(responseObject);
    return;
  });

  router.get('/logout', async (req: Request, res: Response) => {
    var responseObject: CustomResponseObject;
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var sql: string;
    var value: any[];
    var values: any[];
    var selectSqlResult: SelectPacket;
    var jwtToken: string;
    var loginId: number = 0;
    var userId: number;
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    loginMethodsInterfaceObj.loginMethodsObj.clearJwt(res);
    if (await loginMethodsInterfaceObj.checkLoginObject()) {
      userId = await loginMethodsInterfaceObj.getLoggedInUserId();
      await loginMethodsInterfaceObj.deleteLoginObject();
    } else {
      jwtToken = req.cookies[loginMethodsObj.jwtCookieName];
      if (!jwtToken) {
        responseObject = {
          succ: false,
          loggedIn: false,
          debugMes: 'The session is not logged in and the user did not present a JWT',
        };
        res.status(200).send(responseObject);
        return;
      }
      try {
        loginId = jwtMethodsObj.verifyJwt(jwtToken);
      } catch (err) {
        console.log('Error in the dec of the JWT, ', err);
      }
      if (loginId == 0) {
        responseObject = {
          succ: false,
          loggedIn: false,
          debugMes: 'The JWT is invalid',
        };
        res.status(200).send(responseObject);
        return;
      }
      sql = 'SELECT userId FROM logins WHERE loginId = ?';
      value = [loginId];
      selectSqlResult = await dbConnection.execute<SelectPacket>(sql, value);
      if (selectSqlResult.length != 1) {
        responseObject = {
          succ: false,
          loggedIn: false,
          debugMes: 'The JWT is not present in the database',
        };
        res.status(200).send(responseObject);
        return;
      }
      userId = selectSqlResult[0].userId;
    }
    sql = 'DELETE FROM logins WHERE loginId = ?';
    value = [loginId];
    await dbConnection.execute<NormalPacket>(sql, value);
    await socketMethodsObj.disconnectSessionsSockets(req['sessionId']);
    responseObject = {
      succ: true,
      loggedIn: false,
    };
    res.status(200).send(responseObject);
    return;
  });

}