import { Router, Request, Response } from 'express';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';
import { DbHandler, NormalPacket, SelectPacket } from '@raducualexandrumircea/custom-db-handler';
import { LoginMethods, LoginMethodsInterface } from '@raducualexandrumircea/lunaris-login';
import { CustomResponseObject, StudentYearsDetails, StudyYearDetails, SubjectScholarSituation, UserContactInfo } from '@raducualexandrumircea/lunaris-interfaces';
import { SessionInterface } from '@raducualexandrumircea/redis-session-manager';
import { AccountMethods } from '@raducualexandrumircea/lunaris-account';
import { checkIfEmailIsValid } from '@raducualexandrumircea/lunaris-regex-checks';

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

export function appRoutes(router: Router, dbConnection: DbHandler, loginMethodsObj: LoginMethods, accountMethodsObj: AccountMethods) {
	router.get('/', async (req: Request, res: Response) => {
		res.status(200).send(environmentParserObj.get('SERVER_NAME', 'string', false) || 'root path works');
	});

	router.get('/get/user-contact-info/:userId', async (req: Request, res: Response) => {
		var contactUserId: number = parseInt(req.params.userId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var responseObject: CustomResponseObject;
		var userContactInfoSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			"SELECT publicEmail, website, description, CONCAT_WS(' ', firstName, lastName) as fullName FROM users WHERE universityId = ? AND userId = ?",
			[universityId, contactUserId]
		);
		if (userContactInfoSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Could not find the user under your university',
			};
			res.status(200).send(responseObject);
			return;
		}
		var userContactInfo: UserContactInfo = {
			fullname: userContactInfoSqlResult[0].fullName,
			description: userContactInfoSqlResult[0].description || '',
			website: userContactInfoSqlResult[0].website || '',
			publicEmail: userContactInfoSqlResult[0].publicEmail || '',
		};
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				userContactInfo: userContactInfo,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/scholar-situation/:studentYearId', async (req: Request, res: Response) => {
		var studentYearId: number = parseInt(req.params.studentYearId);
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var scholarSituationSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT yearsSubjects.subjectId, finalGrades.grade, finalGrades.credits as finalGradesCredits, subjects.credits as subjectsCredits, subjects.subjectName, yearsSubjects.semesterIndex FROM yearsSubjects
INNER JOIN years ON years.yearId = yearsSubjects.yearId
INNER JOIN studentsYears ON studentsYears.yearId = years.yearId
INNER JOIN subjects ON subjects.subjectId = yearsSubjects.subjectId
INNER JOIN users ON users.userId = studentsYears.userId
LEFT JOIN finalGrades ON finalGrades.studentYearId = studentsYears.studentYearId
WHERE users.universityId = ? AND studentsYears.studentYearId = ? AND users.userId = ?
ORDER BY yearsSubjects.semesterIndex ASC`,
			[universityId, studentYearId, userId]
		);
		var subjectsScholarSituation: SubjectScholarSituation[] = [];
		var media: number = 0;
		var mediaCount: number = 0;
		var totalCredits: number = 0;
		var outOfCredits: number = 0;
		for (var i = 0; i < scholarSituationSqlResult.length; i++) {
			subjectsScholarSituation.push({
				subjectId: scholarSituationSqlResult[i].subjectId,
				subjectName: scholarSituationSqlResult[i].subjectName,
				semesterIndex: scholarSituationSqlResult[i].semesterIndex,
				grade: scholarSituationSqlResult[i].grade,
				credits: scholarSituationSqlResult[i].finalGradesCredits || scholarSituationSqlResult[i].subjectsCredits,
			});
			if (scholarSituationSqlResult[i].finalGradesCredits) {
				totalCredits += scholarSituationSqlResult[i].finalGradesCredits;
				outOfCredits += scholarSituationSqlResult[i].finalGradesCredits;
			} else {
				outOfCredits += scholarSituationSqlResult[i].subjectsCredits;
			}
			if (scholarSituationSqlResult[i].grade) {
				media += scholarSituationSqlResult[i].grade;
				mediaCount++;
			}
		}
		media /= mediaCount;
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				totalCredits: totalCredits,
				outOfCredits: outOfCredits,
				media: media,
				subjectsScholarSituation: subjectsScholarSituation,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/study-years', async (req: Request, res: Response) => {
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var studyYearsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT studyYears.studyYearId, studyYears.fromYear, studyYears.toYear FROM studyYears
WHERE studyYears.universityId = ?
ORDER BY studyYears.createdDate DESC`,
			[universityId]
		);
		var studyYearsDetails: StudyYearDetails[] = [];
		for (var i = 0; i < studyYearsSqlResult.length; i++) {
			studyYearsDetails.push({
				studyYearId: studyYearsSqlResult[i].studyYearId,
				fromYear: studyYearsSqlResult[i].fromYear,
				toYear: studyYearsSqlResult[i].toYear,
			});
		}
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				studyYearsDetails: studyYearsDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/student/student-years', async (req: Request, res: Response) => {
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var universityId: number = await accountMethodsObj.getUserUniveristy(userId);
		var studentYearsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(
			`SELECT studentsYears.studentYearId, studyYears.fromYear, studyYears.toYear, years.yearIndex, programs.programShortName FROM studentsYears
INNER JOIN studyYears ON studyYears.studyYearId = studentsYears.studyYearId
INNER JOIN years ON years.yearId = studentsYears.yearId
INNER JOIN users ON users.userId = studentsYears.userId
INNER JOIN programs ON programs.programId = years.programId
WHERE users.universityId = ? AND studentsYears.userId = ?
ORDER BY studyYears.createdDate DESC`,
			[universityId, userId]
		);
		var studentYearsDetails: StudentYearsDetails[] = [];
		for (var i = 0; i < studentYearsSqlResult.length; i++) {
			studentYearsDetails.push({
				studentYearId: studentYearsSqlResult[i].studentYearId,
				fromYear: studentYearsSqlResult[i].fromYear,
				toYear: studentYearsSqlResult[i].toYear,
				yearIndex: studentYearsSqlResult[i].yearIndex,
				programShortName: studentYearsSqlResult[i].programShortName,
			});
		}
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				studentYearsDetails: studentYearsDetails,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/personal-details', async (req: Request, res: Response) => {
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var personalDetailsSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT description, website, publicEmail FROM users WHERE userId = ?', [userId]);
		var responseObject: CustomResponseObject;
		if (personalDetailsSqlResult.length != 1) {
			responseObject = {
				succ: false,
				mes: 'Found more personal details for one user',
			};
			res.status(200).send(responseObject);
			return;
		}
		responseObject = {
			succ: true,
			data: {
				description: personalDetailsSqlResult[0].description,
				website: personalDetailsSqlResult[0].website,
				publicEmail: personalDetailsSqlResult[0].publicEmail,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.post('/update/personal-details', async (req: Request, res: Response) => {
		interface CurrentBody {
			website: string;
			publicEmail: string;
			description: string;
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var website: string = body.website || '';
		var publicEmail: string = body.publicEmail || '';
		console.log(publicEmail);
		var description: string = body.description || '';
		if (publicEmail != '' && !checkIfEmailIsValid(publicEmail)) {
			responseObject = {
				succ: false,
				mes: 'The public email address is not valid',
			};
			res.status(200).send(responseObject);
			return;
		}
		await dbConnection.execute<NormalPacket>('UPDATE users SET description = ?, website = ?, publicEmail = ? WHERE userId = ?', [description, website, publicEmail, userId]);
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/user-role', async (req: Request, res: Response) => {
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var userRole: number = await accountMethodsObj.getUserRole(userId);
		var responseObject: CustomResponseObject = {
			succ: true,
			data: {
				userRole: userRole,
			},
		};
		res.status(200).send(responseObject);
		return;
	});

	router.get('/get/user-email', async (req: Request, res: Response) => {
		var responseObject: CustomResponseObject;
		var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
		var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
		var userId: number = await loginMethodsInterfaceObj.getLoggedInUserId();
		var emailSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>('SELECT email FROM users WHERE userId = ?', [userId]);
		if (emailSqlResult.length != 1) {
			responseObject = {
				succ: false,
			};
			res.status(200).send(responseObject);
			return;
		}
		responseObject = {
			succ: true,
			data: {
				userEmail: emailSqlResult[0].email,
			},
		};
		res.status(200).send(responseObject);
		return;
	});
}
