import { Inject, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
// @ts-ignore
import { CryptographyService, CryptographyMessage } from './cryptography.service';

// @ts-ignore
@Injectable({
	providedIn: 'root',
})
/**
 * Manage the request handeling
 *
 * @param {CryptographyService} _cryptographyServiceObj the global service object.
 */
// @ts-ignore
export class CryptographyNetworkService {
	maxNumberOfTries: number = 3;
	aesKeyDoneSubjectSubscription: Subscription;
	aesInvalidKey: { [id: string]: string | number } = {
		status: 460,
		statusText: 'AES-key invalid',
	};
	aesInvalidDecryption: { [id: string]: string | number } = {
		status: 560,
		statusText: 'AES-key invalid decryption',
	};
	headerName: string = 'aes-status';

	//@ts-ignore
	constructor(private _cryptographyServiceObj: CryptographyService, @Inject('useEncryption') private _useEncryption: boolean = true) { }

	/**
	 * Send post request using the custom encryption protocol
	 *
	 * @param {string} url the url for the request.
	 * @param {any} payload the payload for the request.
	 * @param {{ [id: string]: string }} headers any custom headers for the request.
	 * @param {boolean} useJson to use the json headers for the request.
	 * @param {number} tryCount count the number of tries for failed requests.
	 * @return {Promise<ResponseObject>} a promise which contains the response object.
	 */
	sendPostReq(url: string, payload: any, headers: { [id: string]: string } = {}, useJson: boolean = true, tryCount: number = 1): Promise<ResponseObject> {
		var responseObj: ResponseObject;
		var defaultsHeaders: { [id: string]: string } = {}; // default headers
		var finalHeaders: { [id: string]: string } = Object.assign({}, defaultsHeaders, headers);
		var stringifiedPayload: string = JSON.stringify(payload);
		if (this._useEncryption) {
			var encPayload: string = this._cryptographyServiceObj.aesCryptographyObj.encrypt(stringifiedPayload);
			if (sessionStorage.getItem('socketId')) {
				finalHeaders['Socket-Id'] = sessionStorage.getItem('socketId');
			}
			return fetch(url, {
				method: 'POST',
				credentials: 'include',
				headers: finalHeaders,
				body: encPayload,
				mode: 'cors',
			})
				.then((response: Response) => {
					var responseStatus: number = response.status;
					var responseStatusText: string = response.statusText;
					var responseHeaders: Headers = response.headers;
					if (
						// check if the response status has any AES encryption error
						responseStatus == this.aesInvalidKey['status'] /*  && (responseStatusText == this.aesInvalidKey['statusText'] || responseStatusText == '' || responseStatusText == 'Bad ') */ ||
						responseStatus == this.aesInvalidDecryption['status'] /*  && (responseStatusText == this.aesInvalidDecryption['statusText'] || responseStatusText == '') */ ||
						(responseHeaders.has(this.headerName) && [(this.aesInvalidKey['statusText'], this.aesInvalidDecryption['statusText'])].includes(responseHeaders.get(this.headerName)))
					) {
						return this._handleAESKeyRehandshake(tryCount).then((result: AESKeyRehandshakeResponse) => {
							// retry the AES key handshake
							if (result.callFunc) {
								tryCount++;
								return this.sendPostReq(url, payload, finalHeaders, useJson, tryCount); // increase the tryCount and call the function again
							} else if (result.returnObj && result.objErr != undefined) {
								responseObj = {
									url: url,
									payload: payload,
									reqHeaders: finalHeaders,
									succ: false,
									response: response,
									resHeaders: this._getHeadersDict(response.headers),
									err: result.objErr,
								};
								return responseObj; // error in the new AES handshake
							} else {
								responseObj = {
									url: url,
									payload: payload,
									reqHeaders: finalHeaders,
									succ: false,
								};
								return responseObj; // fallback
							}
						});
					} else {
						return response.text().then((data: string) => {
							// get the response data
							var decData = this._cryptographyServiceObj.aesCryptographyObj.decrypt(data);
							var parsedData = JSON.parse(decData);
							responseObj = {
								url: url,
								payload: payload,
								reqHeaders: finalHeaders,
								succ: true,
								response: response,
								data: parsedData,
								resHeaders: this._getHeadersDict(response.headers),
							};
							return responseObj;
						});
					}
				})
				.catch((err: any) => {
					// handle any error
					console.log(err);
					if (typeof err != 'object') {
						err = String(err);
					}
					responseObj = {
						url: url,
						payload: payload,
						reqHeaders: finalHeaders,
						succ: false,
						err: String(err),
					};
					return responseObj;
				});
		} else {
			return fetch(url, {
				method: 'POST',
				credentials: 'include',
				headers: this._constructHeaders(headers, useJson),
				body: useJson ? stringifiedPayload : payload,
				mode: 'cors',
			})
				.then((response: Response) => {
					return response.text().then((data: string) => {
						// get the response data
						var parsedData = JSON.parse(data);
						responseObj = {
							url: url,
							payload: payload,
							reqHeaders: finalHeaders,
							succ: true,
							response: response,
							data: parsedData,
							resHeaders: this._getHeadersDict(response.headers),
						};
						return responseObj;
					})
				})
				.catch((err: any) => {
					// handle any error
					console.log(err);
					if (typeof err != 'object') {
						err = String(err);
					}
					responseObj = {
						url: url,
						payload: payload,
						reqHeaders: finalHeaders,
						succ: false,
						err: String(err),
					};
					return responseObj;
				});
		}
	}

	/**
	 * Send get request using the custom encryption protocol
	 *
	 * @param {string} url the url for the request.
	 * @param {{ [id: string]: string }} headers any custom headers for the request.
	 * @param {boolean} useJson to use the json headers for the request.
	 * @param {number} tryCount count the number of tries for failed requests.
	 * @return {Promise<ResponseObject>} a promise which contains the response object.
	 */
	sendGetReq(url: string, headers: { [id: string]: string } = {}, useJson: boolean = true, tryCount: number = 1): Promise<ResponseObject> {
		var responseObj: ResponseObject;
		var defaultsHeaders: { [id: string]: string } = {}; // default headers
		var finalHeaders: { [id: string]: string } = Object.assign({}, defaultsHeaders, headers);
		if (this._useEncryption) {
			if (sessionStorage.getItem('socketId')) {
				finalHeaders['Socket-Id'] = sessionStorage.getItem('socketId');
			}
			return fetch(url, {
				method: 'GET',
				credentials: 'include',
				headers: finalHeaders,
				mode: 'cors',
			})
				.then((response: Response) => {
					var responseStatus: number = response.status;
					var responseStatusText: string = response.statusText;
					var responseHeaders: Headers = response.headers;
					if (
						// check if the response status has any AES encryption error
						responseStatus == this.aesInvalidKey['status'] /*  && (responseStatusText == this.aesInvalidKey['statusText'] || responseStatusText == '') */ ||
						responseStatus == this.aesInvalidDecryption['status'] /*  && (responseStatusText == this.aesInvalidDecryption['statusText'] || responseStatusText == '') */ ||
						(responseHeaders.has(this.headerName) && [(this.aesInvalidKey['statusText'], this.aesInvalidDecryption['statusText'])].includes(responseHeaders.get(this.headerName)))
					) {
						return this._handleAESKeyRehandshake(tryCount).then((result: AESKeyRehandshakeResponse) => {
							// retry the AES key handshake
							if (result.callFunc) {
								tryCount++;
								return this.sendGetReq(url, finalHeaders, useJson, tryCount); // increase the tryCount and call the function again
							} else if (result.returnObj && result.objErr != undefined) {
								responseObj = {
									url: url,
									reqHeaders: finalHeaders,
									succ: false,
									response: response,
									resHeaders: this._getHeadersDict(response.headers),
									err: result.objErr,
								};
								return responseObj; // error in the new AES handshake
							} else {
								responseObj = {
									url: url,
									reqHeaders: finalHeaders,
									succ: false,
								};
								return responseObj; // fallback
							}
						});
					} else {
						return response.text().then((data: string) => {
							// get the response data
							console.log(data);
							var decData = this._cryptographyServiceObj.aesCryptographyObj.decrypt(data);
							console.log(decData);
							var parsedData = JSON.parse(decData);
							responseObj = {
								url: url,
								reqHeaders: finalHeaders,
								succ: true,
								response: response,
								data: parsedData,
								resHeaders: this._getHeadersDict(response.headers),
							};
							return responseObj;
						});
					}
				})
				.catch((err: any) => {
					// handle any error
					console.log(err);
					if (typeof err != 'object') {
						err = String(err);
					}
					responseObj = {
						url: url,
						reqHeaders: finalHeaders,
						succ: false,
						err: String(err),
					};
					return responseObj;
				});
		} else {
			return fetch(url, {
				method: 'GET',
				credentials: 'include',
				headers: this._constructHeaders(headers, useJson),
				mode: 'cors',
			})
				.then((response: Response) => {
					return response.text().then((data: string) => {
						// get the response data
						var parsedData = JSON.parse(data);
						responseObj = {
							url: url,
							reqHeaders: finalHeaders,
							succ: true,
							response: response,
							data: parsedData,
							resHeaders: this._getHeadersDict(response.headers),
						};
						return responseObj;
					})
				})
				.catch((err: any) => {
					// handle any error
					console.log(err);
					if (typeof err != 'object') {
						err = String(err);
					}
					responseObj = {
						url: url,
						reqHeaders: finalHeaders,
						succ: false,
						err: String(err),
					};
					return responseObj;
				});
		}
	}

	/**
	 * Destroy the subscription
	 */
	object_destroy() {
		this.aesKeyDoneSubjectSubscription.unsubscribe();
	}

	/**
	 * Send get request using the custom encryption protocol
	 *
	 * @param {number} tryCount count the number of tries for failed requests.
	 * @return {Promise<AESKeyRehandshakeResponse>} a promise which contains the AES rehandshake response object.
	 */
	private _handleAESKeyRehandshake(tryCount: number): Promise<AESKeyRehandshakeResponse> {
		var returnObj: AESKeyRehandshakeResponse;
		return this._cryptographyServiceObj.startAesKeyExchange().then((result: CryptographyMessage) => {
			// start the AES key exchange
			if (result['succ']) {
				// the AES key exchange was successfully
				if (tryCount < this.maxNumberOfTries) {
					// if the number of max tries is not reached then call the send request function again
					returnObj = {
						callFunc: true,
						returnObj: false,
					};
				} else {
					// otherwise don't call the send request function again and return the max tries exceeded
					returnObj = {
						callFunc: false,
						returnObj: true,
						objErr: 'Maximum tries exceeded',
					};
				}
				return returnObj;
			} else {
				if (result['alreadyInProg']) {
					// the AES key exchange has already been started by another call
					return new Promise<CryptographyMessage>((res, rej) => {
						this.aesKeyDoneSubjectSubscription = this._cryptographyServiceObj.aesKeyDoneSubject.subscribe({
							// wait for the AES key handshake to complete
							next: (next) => {
								res(next);
							},
							error: (error) => {
								rej(error);
							},
						});
					}).then(() => {
						if (tryCount < this.maxNumberOfTries) {
							// if the number of max tries is not reached then call the send request function again
							returnObj = {
								callFunc: true,
								returnObj: false,
							};
						} else {
							// otherwise don't call the send request function again and return the max tries exceeded
							returnObj = {
								callFunc: false,
								returnObj: true,
								objErr: 'Maximum tries exceeded',
							};
						}
						return returnObj;
					});
				} else {
					// fallback
					returnObj = {
						callFunc: false,
						returnObj: true,
						objErr: result['mes'] || result['err'],
					};
					return returnObj;
				}
			}
		});
	}

	/**
	 * Parse the headers into key value object
	 *
	 * @param {Headers} headers the headers of the request.
	 * @return {{ [id: string]: string }} the headers in object form.
	 */
	private _getHeadersDict(headers: Headers): { [id: string]: string } {
		var headersDict: { [id: string]: string } = {};
		headers.forEach((headerVal: string, headerName: string) => {
			headersDict[headerName] = headerVal;
		});
		return headersDict;
	}

	/**
	 * Construct final headers
	 *
	 * @param {{ [key: string]: string }} headers the headers from the function call.
	 * @return {{ [id: string]: string }} the final headers.
	 */
	private _constructHeaders(headers: { [key: string]: string }, isJson: boolean = false): { [key: string]: string } {
		if (sessionStorage.getItem('socketId')) {
			headers['Socket-Id'] = sessionStorage.getItem('socketId');
		}
		return Object.assign({}, headers, isJson ? {
			'Content-Type': 'application/json; charset=utf-8'
		} : {});
	}
}

export interface ResponseObject {
	url: string;
	payload?: any;
	reqHeaders: { [id: string]: string };
	succ: boolean;
	response?: Response;
	data?: any;
	resHeaders?: { [id: string]: string };
	err?: any;
}

interface AESKeyRehandshakeResponse {
	callFunc: boolean;
	returnObj: boolean;
	objErr?: any;
}
