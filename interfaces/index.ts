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
}
