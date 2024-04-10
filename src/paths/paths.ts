import { Router, Request, Response } from 'express';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';
import { DbHandler, NormalPacket, SelectPacket } from '@raducualexandrumircea/custom-db-handler';
import { LoginMethods, LoginMethodsInterface } from '@raducualexandrumircea/lunaris-login';
import { AccountMethods, handleCheckProfessorMiddleware } from '@raducualexandrumircea/lunaris-account';
import multer from 'multer';
import { SessionInterface } from '@raducualexandrumircea/redis-session-manager';
import { ClassPreviewDetails, CustomResponseObject, StudyYearStudentDetails, SubjectPreviewDetails, UserTableDetails } from '@raducualexandrumircea/lunaris-interfaces';
import { v4 as uuidv4 } from 'uuid';

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

export function appRoutes(router: Router, dbConnection: DbHandler, loginMethodsObj: LoginMethods, accountMethodsObj: AccountMethods, upload: multer.Multer) {

  router.get('/', async (req: Request, res: Response) => {
    res.status(200).send(environmentParserObj.get('SERVER_NAME', 'string', false) || 'root path works');
  });

  router.post('/add/members', handleCheckProfessorMiddleware(dbConnection, loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
    interface CurrentBody {
      classId: number;
      usersIds: number[];
    }
    var body: CurrentBody = req.body;
    var responseObject: CustomResponseObject;
    if (!('classId' in body && 'usersIds' in body)) {
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
    var userRole: number = await accountMethodsObj.getUserRole(userId);
    var classId: number = body.classId;
    var usersIds: number[] = body.usersIds;
    if (usersIds.length == 0) {
      responseObject = {
        succ: false,
        mes: 'Please add at least one member',
      };
      res.status(200).send(responseObject);
      return;
    }
    var checkClassIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(`SELECT classes.classId FROM classes
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE classes.classId = ? AND studyYears.universityId = ?`, [classId, universityId]);
    if (checkClassIdSqlResult.length != 1) {
      responseObject = {
        succ: false,
        mes: 'You don not permissions to edit this class as is not under your university',
      };
      res.status(200).send(responseObject);
      return;
    }
    if (userRole == 2) {
      var checkIfUserInClassSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT classMemberId FROM classesMembers WHERE classId = ? AND userId = ?', [classId, userId]);
      if (checkIfUserInClassSqlResult.length != 1) {
        responseObject = {
          succ: false,
          mes: 'You don not permissions to delete this member as you are not in that class',
        };
        res.status(200).send(responseObject);
        return;
      }
    }
    var transaction = await dbConnection.startTransaction();
    try {
      var checkUserIdSqlResult: SelectPacket;
      var checkUserIdClassMembersSqlResult: SelectPacket;
      var insertClassMembersSql: string = 'INSERT INTO classesMembers (classId, userId) VALUES (?, ?)';
      for (var i = 0; i < usersIds.length; i++) {
        checkUserIdSqlResult = await dbConnection.executeInTransaction<SelectPacket>(transaction, 'SELECT userId FROM users WHERE userId = ? AND universityId = ?', [usersIds[i], universityId]);
        if (checkUserIdSqlResult.length != 1) {
          responseObject = {
            succ: false,
            mes: 'Can not find user with that id under your university',
          };
          res.status(200).send(responseObject);
          return;
        }
        checkUserIdClassMembersSqlResult = await dbConnection.executeInTransaction<SelectPacket>(transaction, 'SELECT userId FROM classesMembers WHERE userId = ?', [usersIds[i]]);
        if (checkUserIdClassMembersSqlResult.length != 0) {
          responseObject = {
            succ: false,
            mes: 'Can not add the same user twice',
          };
          res.status(200).send(responseObject);
          return;
        }
        await dbConnection.executeInTransaction<NormalPacket>(transaction, insertClassMembersSql, [classId, usersIds[i]]);
      }
      await dbConnection.commitTransactionAndClose(transaction);
    } catch (err) {
      await dbConnection.rollbackTransactionAndClose(transaction);
      responseObject = {
        succ: false,
        mes: String(err),
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

  router.post('/delete/member', handleCheckProfessorMiddleware(dbConnection, loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {

    interface CurrentBody {
      classId: number;
      memberUserId: number;
    }
    var body: CurrentBody = req.body;
    var responseObject: CustomResponseObject;
    if (!('classId' in body && 'memberUserId' in body)) {
      responseObject = {
        succ: false,
        mes: 'Something went wrong',
        debugMes: 'Invalid number of POST parameters',
      };
      res.status(200).send(responseObject);
      return;
    }
    var classId: number = body.classId;
    var memberUserId: number = body.memberUserId;
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
    var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
    var userRole: number = await accountMethodsObj.getUserRole(userId);
    var checkClassMemberIdAndClassIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(`SELECT classesMembers.classMemberId FROM classesMembers
INNER JOIN classes ON classes.classId = classesMembers.classId
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE classesMembers.userId = ? AND classesMembers.classId = ? AND studyYears.universityId = ?`, [memberUserId, classId, universityId]);
    if (checkClassMemberIdAndClassIdSqlResult.length != 1) {
      responseObject = {
        succ: false,
        mes: 'You don not permissions to delete this member as is not under your university',
      };
      res.status(200).send(responseObject);
      return;
    }
    if (userRole == 2) {
      var checkIfUserInClassSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT classMemberId FROM classesMembers WHERE classId = ? AND userId = ?', [classId, userId]);
      if (checkIfUserInClassSqlResult.length != 1) {
        responseObject = {
          succ: false,
          mes: 'You don not permissions to delete this member as you are not in that class',
        };
        res.status(200).send(responseObject);
        return;
      }
    }
    await dbConnection.execute<NormalPacket>('DELETE FROM classesMembers WHERE userId = ? AND classId = ?', [memberUserId, classId]);
    responseObject = {
      succ: true,
    };
    res.status(200).send(responseObject);
    return;
  });

  router.get('/get/members/:classId', async (req: Request, res: Response) => {
    var classId: number = parseInt(req.params.classId);
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
    var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
    var classMembersSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(`SELECT users.userId, users.email, CONCAT_WS(' ', users.firstName, users.lastName) as fullName FROM classesMembers
INNER JOIN users ON users.userId = classesMembers.userId
INNER JOIN classes ON classes.classId = classesMembers.classId
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE classes.classId = ? AND studyYears.universityId = ?`, [classId, universityId]);
    var classMembersDetails: UserTableDetails[] = [];
    var currentUserIndex: number = null;
    for (var i = 0; i < classMembersSqlResult.length; i++) {
      if (classMembersSqlResult[i].userId == userId) {
        currentUserIndex = i;
        continue;
      }
      classMembersDetails.push({
        userId: classMembersSqlResult[i].userId,
        fullname: classMembersSqlResult[i].fullName,
        email: classMembersSqlResult[i].email
      });
    }
    if (currentUserIndex != null) {
      classMembersDetails.unshift({
        userId: classMembersSqlResult[currentUserIndex].userId,
        fullname: classMembersSqlResult[currentUserIndex].fullName + ' (You)',
        email: classMembersSqlResult[currentUserIndex].email
      });
    }
    var responseObject: CustomResponseObject = {
      succ: true,
      data: {
        classMembersDetails: classMembersDetails
      }
    };
    res.status(200).send(responseObject);
    return;
  })

  router.post('/create/class', handleCheckProfessorMiddleware(dbConnection, loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
    interface CurrentBody {
      studyYearId: number;
      classSuffix: string;
      classPrefix: string;
      className: string;
      subjectId: number;
      description: string;
      usersIds: number[];
    }
    var body: CurrentBody = req.body;
    var responseObject: CustomResponseObject;
    if (!('studyYearId' in body && 'classSuffix' in body && 'classPrefix' in body && 'className' in body && 'subjectId' in body && 'description' in body && 'usersIds' in body)) {
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
    var studyYearId: number = body.studyYearId;
    var classSuffix: string = body.classSuffix;
    var classPrefix: string = body.classPrefix;
    var className: string = body.className || null;
    var subjectId: number = body.subjectId || null;
    var description: string = body.description;
    var usersIds: number[] = body.usersIds;
    var checkStudyYearIdSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT studyYearId FROM studyYears WHERE universityId = ? AND studyYearId = ?', [universityId, studyYearId]);
    if (checkStudyYearIdSqlResult.length != 1) {
      responseObject = {
        succ: false,
        mes: 'You don not permissions to use this study year as is not under your university',
      };
      res.status(200).send(responseObject);
      return;
    }
    if (subjectId) {
      var checkSubjectIdSqlResult = await dbConnection.execute<SelectPacket>('SELECT subjectId FROM subjects WHERE universityId = ? AND subjectId = ?', [universityId, subjectId]);
      if (checkSubjectIdSqlResult.length != 1) {
        responseObject = {
          succ: false,
          mes: 'You don not permissions to use this subject as is not under your university',
        };
        res.status(200).send(responseObject);
        return;
      }
    }
    var classLongId: string = uuidv4();
    var transaction = await dbConnection.startTransaction();
    try {
      var classInserSqlResult: NormalPacket = await dbConnection.executeInTransaction<NormalPacket>(transaction, 'INSERT INTO classes (studyYearId, subjectId, classLongId, className, classPrefix, classSuffix, classDescription) VALUES (?, ?, ?, ?, ?, ?, ?)', [studyYearId, subjectId, classLongId, className, classPrefix, classSuffix, description]);
      var checkUserIdSqlResult: SelectPacket;
      var insertClassMembersSql: string = 'INSERT INTO classesMembers (classId, userId) VALUES (?, ?)';
      await dbConnection.executeInTransaction<NormalPacket>(transaction, insertClassMembersSql, [classInserSqlResult.insertId, userId]);
      for (var i = 0; i < usersIds.length; i++) {
        checkUserIdSqlResult = await dbConnection.executeInTransaction<SelectPacket>(transaction, 'SELECT userId FROM users WHERE userId = ? AND universityId = ?', [usersIds[i], universityId]);
        if (checkUserIdSqlResult.length != 1) {
          responseObject = {
            succ: false,
            mes: 'Can not find user with that id under your university',
          };
          res.status(200).send(responseObject);
          return;
        }
        await dbConnection.executeInTransaction<NormalPacket>(transaction, insertClassMembersSql, [classInserSqlResult.insertId, usersIds[i]]);
      }
      await dbConnection.commitTransactionAndClose(transaction);
    } catch (err) {
      await dbConnection.rollbackTransactionAndClose(transaction);
      responseObject = {
        succ: false,
        mes: String(err),
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

  router.post('/get/user-id/from/email', handleCheckProfessorMiddleware(dbConnection, loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
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
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
    var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
    var email: string = body.email;
    var userEmailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT userId, disabled FROM users WHERE email = ? AND universityId = ?', [email, universityId]);
    if (userEmailSqlResult.length != 1) {
      responseObject = {
        succ: false,
        mes: 'There is no user with that email under your university',
      };
      res.status(200).send(responseObject);
      return;
    }
    if (userEmailSqlResult[0].disabled) {
      responseObject = {
        succ: false,
        mes: 'The user is disabled',
      };
      res.status(200).send(responseObject);
      return;
    }
    var studyYearStudentDetails: StudyYearStudentDetails = {
      userId: userEmailSqlResult[0].userId,
      email: email
    };
    responseObject = {
      succ: true,
      data: {
        studyYearStudentDetails: studyYearStudentDetails
      }
    };
    res.status(200).send(responseObject);
    return;
  });

  router.get('/get/subjects/:isArchived?', handleCheckProfessorMiddleware(dbConnection, loginMethodsObj, accountMethodsObj), async (req: Request, res: Response) => {
    var isArchived: boolean = parseInt(req.params.isArchived) == 1 ? true : (parseInt(req.params.isArchived) == 0 ? false : null);
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
    var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
    var subjectsSqlResult: SelectPacket;
    if (isArchived != null) {
      subjectsSqlResult = await dbConnection.execute<SelectPacket>('SELECT subjectId, subjectName, credits, archived FROM subjects WHERE universityId = ? AND archived = ?', [universityId, isArchived]);
    } else {
      subjectsSqlResult = await dbConnection.execute<SelectPacket>('SELECT subjectId, subjectName, credits, archived FROM subjects WHERE universityId = ?', [universityId]);
    }
    var subjectsPreviewDetails: SubjectPreviewDetails[] = [];
    for (var i = 0; i < subjectsSqlResult.length; i++) {
      subjectsPreviewDetails.push({
        subjectId: subjectsSqlResult[i].subjectId,
        subjectName: subjectsSqlResult[i].subjectName,
        subjectCredits: subjectsSqlResult[i].archived ? subjectsSqlResult[i].credits + ' (Archived)' : subjectsSqlResult[i].credits
      });
    }
    var responseObject: CustomResponseObject = {
      succ: true,
      data: {
        subjectsPreviewDetails: subjectsPreviewDetails
      }
    }
    res.status(200).send(responseObject);
    return;
  });

  router.get('/get/classes/:studyYearId', async (req: Request, res: Response) => {
    var studyYearId: number = parseInt(req.params.studyYearId);
    var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
    var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
    var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
    var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
    var userRole: number = await accountMethodsObj.getUserRole(userId);
    var classesSqlResult: SelectPacket;
    if (userRole == 3) {
      classesSqlResult = await dbConnection.execute<SelectPacket>(`SELECT classes.classId, classes.classPrefix, classes.classSuffix, classes.className, classes.classLongId, subjects.subjectName, subjects.credits FROM classes
LEFT JOIN subjects ON subjects.subjectId = classes.subjectId
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
WHERE studyYears.universityId = ? AND studyYears.studyYearId = ?`, [universityId, studyYearId]);
    } else {
      classesSqlResult = await dbConnection.execute<SelectPacket>(`SELECT classes.classId, classes.classPrefix, classes.classSuffix, classes.className, classes.classLongId, subjects.subjectName, subjects.credits FROM classes
LEFT JOIN subjects ON subjects.subjectId = classes.subjectId
INNER JOIN studyYears ON studyYears.studyYearId = classes.studyYearId
INNER JOIN classesMembers ON classesMembers.classId = classes.classId
WHERE studyYears.universityId = ? AND studyYears.studyYearId = ? AND classesMembers.userId = ?`, [universityId, studyYearId, userId]);
    }
    var classesPreviewDetails: ClassPreviewDetails[] = [];
    var className: string = '';
    for (var i = 0; i < classesSqlResult.length; i++) {
      if (classesSqlResult[i].subjectName) {
        className = classesSqlResult[i].classPrefix + ' ' + classesSqlResult[i].subjectName + ' ' + classesSqlResult[i].classSuffix;
      } else {
        className = classesSqlResult[i].className;
      }
      classesPreviewDetails.push({
        classId: classesSqlResult[i].classId,
        classLongId: classesSqlResult[i].classLongId,
        className: className,
        classCredits: classesSqlResult[i].credits,
      });
    }
    var responseObject: CustomResponseObject = {
      succ: true,
      data: {
        classesPreviewDetails: classesPreviewDetails
      }
    };
    res.status(200).send(responseObject);
    return;
  });

}
