import { DbHandler, NormalPacket, SelectPacket } from "@raducualexandrumircea/custom-db-handler";
import { CustomResponseObject, DeviceTypes } from "@raducualexandrumircea/lunaris-interfaces";
import { JwtMethods } from "@raducualexandrumircea/lunaris-jwt";
import { ServerCommunication } from "@raducualexandrumircea/lunaris-server-communication";
import { LOGIN_MCS_NAME } from "@raducualexandrumircea/lunaris-service-names";
import { SocketMethods } from "@raducualexandrumircea/lunaris-socket-methods";
import { SessionInterface } from "@raducualexandrumircea/redis-session-manager";
import { NextFunction, Request, Response } from "express";

export class LoginMethods {
    sessionLoginPath: string[] = ['login'];
    sessionExpInMin: number;
    jwtCookieName: string;
    jwtCookieDomain: string;
    jwtExpInDays: number;
    serverCommunicationObj: ServerCommunication;
    jwtMethodsObj: JwtMethods;
    checkLoginIdUrlPath: string = '/login/check-login-id';
    checkJwtUrlPath: string = '/login/check-jwt';
    createJwtUrlPath: string = '/login/create-jwt';

    constructor(jwtCookieName: string = 'login-token', jwtCookieDomain: string = '', jwtExpInDays: number = 30, sessionExpInMin: number = 30, serverCommunicationObj: ServerCommunication, jwtMethodsObj: JwtMethods = null) {
        this.jwtCookieName = jwtCookieName;
        this.jwtCookieDomain = jwtCookieDomain;
        this.sessionExpInMin = sessionExpInMin;
        this.jwtExpInDays = jwtExpInDays;
        this.serverCommunicationObj = serverCommunicationObj;
        if (jwtMethodsObj == null) {
            jwtMethodsObj = new JwtMethods();
        } else {
            this.jwtMethodsObj = jwtMethodsObj;
        }
    }

    calculateJwtExp(): number {
        var currentDate: number = new Date().getTime();
        return currentDate + this.jwtExpInDays * 24 * 60 * 60 * 1000;
    }

    checkIfJwtExpired(lastUsedTime: number): boolean {
        return lastUsedTime + this.jwtExpInDays * 24 * 60 * 60 * 1000 <= new Date().getTime();
    }

    getJwt(req: Request): string {
        return req.cookies[this.jwtCookieName];
    }

    clearJwt(res: Response): void {
        var isSecureCookieEnabled: boolean = true;
        res.cookie(this.jwtCookieName, '', { domain: this.jwtCookieDomain, expires: new Date(), httpOnly: true, secure: isSecureCookieEnabled });
    }

    setJwt(res: Response, jwt: string): void {
        var isSecureCookieEnabled: boolean = true;
        res.cookie(this.jwtCookieName, jwt, { domain: this.jwtCookieDomain, expires: new Date(this.calculateJwtExp()), httpOnly: true, secure: isSecureCookieEnabled });
    }

    updateJwt(req: Request, res: Response): void {
        var jwt: string = this.getJwt(req);
        this.setJwt(res, jwt);
    }

    updateJwtLastTimeUsed(dbConnection: DbHandler, loginId: number): Promise<NormalPacket> {
        return dbConnection.execute<NormalPacket>('UPDATE logins SET lastUsedTime = ? WHERE loginId = ?', [new Date(), loginId]);
    }

    async checkForgotPasswordToken(dbConnection: DbHandler, forgotPasswordToken: string): Promise<boolean> {
        var sql: string = 'SELECT used, createdDate FROM userForgotPasswords WHERE forgotPasswordToken = ?';
        var value: any[] = [forgotPasswordToken];
        var selectSqlResult: SelectPacket = await dbConnection.execute<SelectPacket>(sql, value);
        if (selectSqlResult.length != 1) {
            return false;
        }
        var used: boolean = selectSqlResult[0].used;
        var createdDate: number = selectSqlResult[0].createdDate.getTime();
        if (used) {
            return false;
        }
        if (createdDate + 10 * 60 * 1000 <= new Date().getTime()) {
            return false;
        }
        return true;
    }
}

export class LoginMethodsInterface {
    sessionInterfaceObj: SessionInterface;
    loginMethodsObj: LoginMethods;

    constructor(sessionInterfaceObj: SessionInterface, loginMethodsObj: LoginMethods) {
        this.sessionInterfaceObj = sessionInterfaceObj;
        this.loginMethodsObj = loginMethodsObj;
    }

    async generateFinalLogin(dbConnection: DbHandler, req: Request, res: Response, userId: number, deviceType: DeviceTypes, deviceToken: string, isLocal: boolean = false): Promise<string | void> {
        /*         var sql: string = 'DELETE FROM logins WHERE userId = ?';
                var value: any[] = [userId];
                await dbConnection.execute<NormalPacket>(sql, value); */
        var sql: string = 'INSERT INTO logins (userId, deviceType, deviceToken, createdDate, lastUsedTime) VALUES (?, ?, ?, ?, ?)';
        var values: any[] = [userId, deviceType, deviceToken, new Date(), new Date()];
        var normalSqlResult: NormalPacket = await dbConnection.execute<NormalPacket>(sql, values);
        var loginId: number = normalSqlResult.insertId;
        var jwtToken: string;
        var createJwtTokenResponse: CustomResponseObject;
        if (isLocal) {
            jwtToken = this.loginMethodsObj.jwtMethodsObj.createJwt(loginId);
        } else {
            createJwtTokenResponse = await this.loginMethodsObj.serverCommunicationObj.sendPostRequest(LOGIN_MCS_NAME, this.loginMethodsObj.createJwtUrlPath, {
                loginId: loginId,
            });
            if (!createJwtTokenResponse.succ) {
                throw new Error(createJwtTokenResponse.debugMes || createJwtTokenResponse.mes);
            }
            jwtToken = createJwtTokenResponse.data.jwt;
        }
        await this.createLoginObject(userId, loginId);
        if (res == null) {
            return jwtToken;
        }
        this.loginMethodsObj.setJwt(res, jwtToken);
    }

    createLoginObject(userId: number, loginId: number): Promise<void> {
        var loginObj = {
            iss: new Date().getTime(),
            userId: userId,
            loginId: loginId,
        };
        return this.sessionInterfaceObj.set(this.loginMethodsObj.sessionLoginPath, loginObj);
    }

    deleteLoginObject(): Promise<void> {
        return this.sessionInterfaceObj.delete(this.loginMethodsObj.sessionLoginPath);
    }

    getLoggedInUserId(): Promise<number> {
        return this.sessionInterfaceObj.get(this.loginMethodsObj.sessionLoginPath.concat('userId'));
    }

    getLoggedInLoginId(): Promise<number> {
        return this.sessionInterfaceObj.get(this.loginMethodsObj.sessionLoginPath.concat('loginId'));
    }

    async checkLoginObject(): Promise<boolean> {
        if (!(await this._checkIfLoginObjectExists())) {
            return false;
        }
        var iss: number = await this.sessionInterfaceObj.get(this.loginMethodsObj.sessionLoginPath.concat('iss'));
        if (iss + this.loginMethodsObj.sessionExpInMin * 60 * 1000 <= new Date().getTime()) {
            await this.deleteLoginObject();
            return false;
        }
        await this._updateLoginObject();
        return true;
    }

    private _checkIfLoginObjectExists(): Promise<boolean> {
        return this.sessionInterfaceObj.checkKey(this.loginMethodsObj.sessionLoginPath);
    }

    private async _updateLoginObject(): Promise<void> {
        return this.sessionInterfaceObj.set(this.loginMethodsObj.sessionLoginPath.concat('iss'), new Date().getTime());
    }
}

export function handleCheckLoginMiddleware(loginMethodsObj: LoginMethods, socketMethodsObj: SocketMethods) {
    return async (req: Request, res: Response, next: NextFunction) => {
        interface CustomResponseObjectJwtData {
            userId: number;
            loginId: number;
        }
        var sessionInterfaceObj: SessionInterface = req['sessionInterfaceObj'];
        var loginMethodsInterfaceObj: LoginMethodsInterface = new LoginMethodsInterface(sessionInterfaceObj, loginMethodsObj);
        var jwt: string;
        var checkJwtResponse: CustomResponseObject;
        var checkLoginIdResponse: CustomResponseObject;
        var userId: number;
        var loginId: number;
        var data: CustomResponseObjectJwtData;
        var responseObject: CustomResponseObject;
        if (await loginMethodsInterfaceObj.checkLoginObject()) {
            loginId = await loginMethodsInterfaceObj.getLoggedInLoginId();
            userId = await loginMethodsInterfaceObj.getLoggedInUserId();
            try {
                checkLoginIdResponse = await loginMethodsObj.serverCommunicationObj.sendPostRequest(LOGIN_MCS_NAME, loginMethodsObj.checkLoginIdUrlPath, {
                    loginId: loginId,
                    userId: userId,
                });
            } catch (err) {
                responseObject = {
                    succ: false,
                    loggedIn: false,
                    debugMes: 'Something went wrong while authenticating your session error on server',
                };
                console.log('err', err);
                loginMethodsInterfaceObj.loginMethodsObj.clearJwt(res);
                await socketMethodsObj.disconnectSessionsSockets(req['sessionId']);
                await loginMethodsInterfaceObj.deleteLoginObject();
                res.status(200).send(responseObject);
                return;
            }
            if (!checkLoginIdResponse.succ) {
                responseObject = {
                    succ: true,
                    loggedIn: false,
                    debugMes: checkLoginIdResponse.debugMes,
                };
                loginMethodsInterfaceObj.loginMethodsObj.clearJwt(res);
                await socketMethodsObj.disconnectSessionsSockets(req['sessionId']);
                await loginMethodsInterfaceObj.deleteLoginObject();
                res.status(200).send(responseObject);
                return;
            }
        } else {
            jwt = req.cookies[loginMethodsObj.jwtCookieName];
            if (!jwt || jwt == '') {
                responseObject = {
                    succ: false,
                    loggedIn: false,
                    debugMes: 'The session is not logged in and the user did not present a JWT',
                };
                await socketMethodsObj.disconnectSessionsSockets(req['sessionId']);
                loginMethodsInterfaceObj.loginMethodsObj.clearJwt(res);
                res.status(200).send(responseObject);
                return;
            }
            try {
                checkJwtResponse = await loginMethodsObj.serverCommunicationObj.sendPostRequest(LOGIN_MCS_NAME, loginMethodsObj.checkJwtUrlPath, {
                    jwt: jwt,
                });
            } catch (err) {
                responseObject = {
                    succ: false,
                    loggedIn: false,
                    debugMes: 'Something went wrong while authenticating your jwt token error on server',
                };
                await socketMethodsObj.disconnectSessionsSockets(req['sessionId']);
                loginMethodsInterfaceObj.loginMethodsObj.clearJwt(res);
                res.status(200).send(responseObject);
                return;
            }
            if (!checkJwtResponse.succ) {
                responseObject = {
                    succ: true,
                    loggedIn: false,
                    debugMes: checkJwtResponse.debugMes,
                };
                await socketMethodsObj.disconnectSessionsSockets(req['sessionId']);
                loginMethodsInterfaceObj.loginMethodsObj.clearJwt(res);
                res.status(200).send(responseObject);
                return;
            }
            data = checkJwtResponse.data;
            userId = data.userId;
            loginId = data.loginId;
            await loginMethodsInterfaceObj.createLoginObject(userId, loginId);
        }
        loginMethodsInterfaceObj.loginMethodsObj.updateJwt(req, res);
        req['loginMethodsInterfaceObj'] = loginMethodsInterfaceObj;
        next();
    };
}

export type LoginAction = 'logged in' | 'logged out';
