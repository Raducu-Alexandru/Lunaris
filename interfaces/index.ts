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