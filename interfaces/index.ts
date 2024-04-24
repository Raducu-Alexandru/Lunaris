export interface CustomResponseObject {
	succ: boolean;
	mes?: string;
	debugMes?: string;
	loggedIn?: boolean;
	disabled?: boolean;
	data?: any;
}

export type DeviceTypes = 'ios' | 'android' | 'web';

export interface UniversitySelectDetails {
	universityLongId: string;
	universityName: string;
}

export interface AnnouncementInfo {
	userId: number;
	announcementId: number;
	announcementText: string;
	announcementName: string;
}

export interface UserTableDetails {
	userId: number;
	email: string;
	fullname: string;
}

export interface UserEditDetails {
	email: string;
	firstName: string;
	lastName: string;
	disabled: boolean;
}

export interface SchoolPreviewDetails {
	schoolId: number;
	schoolName: string;
	noPrograms: number;
}

export interface SchoolEditDetails {
	schoolName: string;
}

export interface ProgamPreviewDetails {
	programId: number;
	programName: string;
	programType: string;
}

export interface ProgramEditDetails {
	programName: string;
	programType: string;
	programShortName: string;
	schoolId: number;
	archived: boolean;
}

export interface SubjectPreviewDetails {
	subjectId: number;
	subjectName: string;
	subjectCredits: string;
}

export interface SubjectEditDetails {
	subjectName: string;
	subjectCredits: number;
	archived: boolean;
}

export interface ProgramYearSubjectEditDetails {
	subjectId: number;
	semesterIndex: number;
}

export type ProgramYearEditDetails = ProgramYearSubjectEditDetails[];

export interface YearPreviewDetails {
	yearId: number;
	yearIndex: number;
	noSubjects: number;
}

export interface YearEditDetails {
	subjectId: number;
	subjectName: string;
	semesterIndex: number;
}

export interface StudentProgramPreviewDetails {
	programId: number;
	programName: string;
	yearIndex: number;
}

export interface StudentYearsDetails {
	studentYearId: number;
	fromYear: number;
	toYear: number;
	yearIndex: number;
	programShortName: string;
}

export interface SubjectScholarSituation {
	subjectId: number;
	subjectName: string;
	semesterIndex: number;
	grade: number;
	credits: number;
}

export interface StudyYearDetails {
	studyYearId: number;
	fromYear: number;
	toYear: number;
}

export interface StudyYearStudentDetails {
	userId: number;
	email: string;
}

export interface ClassPreviewDetails {
	classId: number;
	classLongId: string;
	className: string;
	classCredits: number;
	classFinalGrade: number;
}

export interface ClassDetails {
	className: string;
	classDescription: string;
	classCredits: number;
	classFinalGrade: number;
}

export interface ClassMessageDetails {
	userId: number;
	classMessageId: number;
	content: string;
	fullname: string;
}

export interface SocketSendClassMessage {
	classId: number;
	content: string;
}

export interface ClassSubjectDropdownDetails {
	yearSubjectId: number;
	name: string;
}

export interface ClassFinalGradeDetails {
	email: string;
	fullname: string;
	grade: number;
	userId: number;
}

export interface AssignmentPreviewDetails {
	classAssigId: number;
	classAssigName: string;
	classAssigDesc: string;
	dueDate: number;
	grade: number;
}

export interface AssignmentDetails {
	classAssigName: string;
	classAssigDesc: string;
	filesIds: number[];
	dueDate: number;
	grade: number;
}

export interface FileAssignmentDetails {
	fileId: number;
	fileName: string;
}

export interface UpcommingDeadlinePreviewDetails {
	classAssigId: number;
	classAssigName: string;
	classAssigDesc: string;
	dueDate: number;
	classId: number;
}

export interface UserContactInfo {
	fullname: string;
	description: string;
	website: string;
	publicEmail: string;
}

export interface HandInAssignmentDetails {
	handedInDate: number;
	filesIds: number[];
}

export interface HandedInAssignmentDetails {
	userId: number;
	email: string;
	grade: number;
	handedInDate: number;
	filesIds: number[];
}
