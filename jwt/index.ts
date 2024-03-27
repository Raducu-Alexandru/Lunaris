import { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import * as fs from 'fs';
const jwt = require('jsonwebtoken');

export class JwtMethods {
  privateRsaKey: string;
  publicRsaKey: string;
  readKeysFormat: JWTReadKeysFormat;
  audience: string;
  signOptions: SignOptions;
  verifyOptions: VerifyOptions;

  constructor(readKeysFormat: JWTReadKeysFormat = 'file', privateRsaKey: string = './build/keys/jwt/RSA-Pr.key', publicRsaKey: string = './build/keys/jwt/RSA-Pu.key', issuer: string = '', audience: string = '') {
    this.privateRsaKey = privateRsaKey;
    this.publicRsaKey = publicRsaKey;
    this.readKeysFormat = readKeysFormat;
    this.signOptions = {
      issuer: issuer,
      audience: audience,
      algorithm: 'RS256',
    };
    this.verifyOptions = {
      issuer: issuer,
      audience: audience,
      algorithms: ['RS256'],
    };
  }

  generateForgotPasswordToken(id: string): string {
    var jwtPayload = {
      id: id,
    };
    var jwtToken = jwt.sign(jwtPayload, this._readPrivateKey(), this.signOptions);
    var base64: string = Buffer.from(jwtToken).toString('base64');
    return base64;
  }

  createJwt(loginId: number): string {
    var jwtPayload: CustomJwtPayload = {
      loginId: loginId,
    };
    return jwt.sign(jwtPayload, this._readPrivateKey(), this.signOptions);
  }

  verifyJwt(encJwt: string): number {
    var decJwt: CustomJwtPayload = jwt.verify(encJwt, this._readPublicKey(), this.verifyOptions) as CustomJwtPayload;
    return decJwt.loginId;
  }

  private _readPrivateKey(): string {
    if (this.readKeysFormat == 'file') {
      return fs.readFileSync(this.privateRsaKey, 'utf-8');
    } else if (this.readKeysFormat == 'string') {
      return this.privateRsaKey;
    } else if (this.readKeysFormat == null) {
      throw new Error('Read key format is required, but is null');
    }
  }

  private _readPublicKey(): string {
    if (this.readKeysFormat == 'file') {
      return fs.readFileSync(this.publicRsaKey, 'utf-8');
    } else if (this.readKeysFormat == 'string') {
      return this.publicRsaKey;
    } else if (this.readKeysFormat == null) {
      throw new Error('Read key format is required, but is null');
    }
  }
}

export type JWTReadKeysFormat = 'string' | 'file';

export interface CustomJwtPayload extends JwtPayload {
  loginId: number;
}
