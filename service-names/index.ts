import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

export const CDN_MCS_NAME: string = environmentParserObj.get('CDN_MCS_NAME', 'string', true);
export const CLASSES_MCS_NAME: string = environmentParserObj.get('CLASSES_MCS_NAME', 'string', true);
export const FEES_MCS_NAME: string = environmentParserObj.get('FEES_MCS_NAME', 'string', true);
export const FILES_MCS_NAME: string = environmentParserObj.get('FILES_MCS_NAME', 'string', true);
export const LOGIN_MCS_NAME: string = environmentParserObj.get('LOGIN_MCS_NAME', 'string', true);
export const MESSAGES_MCS_NAME: string = environmentParserObj.get('MESSAGES_MCS_NAME', 'string', true);
export const PUSH_NOTIFICATIONS_MCS_NAME: string = environmentParserObj.get('PUSH_NOTIFICATIONS_MCS_NAME', 'string', true);
export const SOCKET_SERVER_MCS_NAME: string = environmentParserObj.get('SOCKET_SERVER_MCS_NAME', 'string', true);
export const UNIVERSITY_SETTINGS_MCS_NAME: string = environmentParserObj.get('UNIVERSITY_SETTINGS_MCS_NAME', 'string', true);
export const USER_DETAILS_MCS_NAME: string = environmentParserObj.get('USER_DETAILS_MCS_NAME', 'string', true);
export const CLAMAV_MCS_NAME: string = environmentParserObj.get('CLAMAV_MCS_NAME', 'string', true);