const protocol: string = 'https://';
const socketProtocol: string = 'wss://';
const apiVersion: string = '1';
const domain: string = 'lunarisapp.com';

export const environment = {
  protocol: protocol,
  socketProtocol: socketProtocol,
  apiVersion: apiVersion,
  domain: domain,
  capacitorAppDomain: `app.${domain}`,
  checkProxyStatusUrl: `${protocol}api.${domain}/apiv${apiVersion}/check-status`,
  encryptionServerUrl: `${protocol}api.${domain}/apiv${apiVersion}/aes`,
  useEncryption: false,
  useSocketEncryption: false,
  cdnUrl: `${protocol}api.${domain}/apiv${apiVersion}/cdn`,
  userDetailsUrl: `${protocol}api.${domain}/apiv${apiVersion}/user-details`,
  classesUrl: `${protocol}api.${domain}/apiv${apiVersion}/classes`,
  loginUrl: `${protocol}api.${domain}/apiv${apiVersion}/login`,
  messagesUrl: `${protocol}api.${domain}/apiv${apiVersion}/messages`,
  universitySettingsUrl: `${protocol}api.${domain}/apiv${apiVersion}/university-settings`,
  socketServerUrl: `${socketProtocol}api.${domain}`,
  notLoggedInRedirectPageArray: ['login'],
  loggedInRedirectPageArray: ['dashboard'],
};
