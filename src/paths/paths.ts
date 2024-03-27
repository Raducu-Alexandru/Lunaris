import { Router, Request, Response } from 'express';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';
import { DbHandler, NormalPacket, SelectPacket } from '@raducualexandrumircea/custom-db-handler';
import { LoginMethods, LoginMethodsInterface } from '@raducualexandrumircea/lunaris-login';
import { AccountMethods, handleCheckAdminMiddleware } from '@raducualexandrumircea/lunaris-account';
import { AnnouncementInfo, CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';
import { SessionInterface } from '@raducualexandrumircea/redis-session-manager';

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

export function appRoutes(router: Router, dbConnection: DbHandler, loginMethodsObj: LoginMethods, accountMethodsObj: AccountMethods) {

  router.get('/', async (req: Request, res: Response) => {
    res.status(200).send(environmentParserObj.get('SERVER_NAME', 'string', false) || 'root path works');
  });

  router.get('/get/announcements', async (req: Request, res: Response) => {
    var responseObject: CustomResponseObject;
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
    var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
    var announcementsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(`SELECT CONCAT_WS(' ', firstName, lastName) as fullName, content, announcementId FROM announcements
INNER JOIN users ON announcements.userId = users.userId
WHERE announcements.universityId = ?`, [universityId]);
    var announcementsInfo: AnnouncementInfo[] = [];
    for (var i = 0; i < announcementsSqlResult.length; i++) {
      announcementsInfo.push({
        announcementId: announcementsSqlResult[i].announcementId,
        announcementText: announcementsSqlResult[i].content,
        announcementName: announcementsSqlResult[i].fullName,
      })
    }
    responseObject = {
      succ: true,
      data: {
        announcementsInfo: announcementsInfo
      }
    }
    res.status(200).send(responseObject);
    return;
  });

  router.post('/add/announcement', handleCheckAdminMiddleware(dbConnection, loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
    interface CurrentBody {
      content: string
    }
    var responseObject: CustomResponseObject;
    var body: CurrentBody = req.body;
    if (!('content' in body)) {
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
    var content: string = body.content;
    if (!content) {
      responseObject = {
        succ: false,
        mes: 'Please enter a message',
      };
      res.status(200).send(responseObject);
      return;
    }
    await dbConnection.execute<NormalPacket>('INSERT INTO announcements (universityId, userId, content) VALUES (?, ?, ?)', [universityId, userId, content]);
    responseObject = {
      succ: true
    }
    res.status(200).send(responseObject);
    return;
  });

  router.post('/delete/announcement', handleCheckAdminMiddleware(dbConnection, loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
    interface CurrentBody {
      announcementId: string
    }
    var responseObject: CustomResponseObject;
    var body: CurrentBody = req.body;
    if (!('announcementId' in body)) {
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
    var announcementId: string = body.announcementId;
    await dbConnection.execute<NormalPacket>('DELETE FROM announcements WHERE announcementId = ? AND universityId = ?', [announcementId, universityId]);
    responseObject = {
      succ: true
    }
    res.status(200).send(responseObject);
    return;
  });

}
