import { Injectable, Inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, Subscription } from 'rxjs';
import Dexie from 'dexie';
import { AESCryptography, RSACryptography } from '@raducualexandrumircea/custom-cryptography';
import uuid4 from 'uuid4';

// @ts-ignore
@Injectable({
	providedIn: 'root',
})
/**
 * Handle the custom socket protocol
 *
 * @param {CryptographyService} _cryptographyServiceObj the global service object.
 * @param {string} _socketUrl the url for the socket server.
 */
// @ts-ignore
export class SocketService {
	socketConnection: Socket;
	indexedDBSocketObj: IndexedDBSocket;
	indexedDBSubscription: Subscription;
	aesCryptographyObj: AESCryptography;
	rsaCryptographyObj: RSACryptography;
	onSubject: Subject<SocketPackage> = new Subject<SocketPackage>();
	acknowledgmentEventName: string = 'ack';
	aesKeyEventName: string = 'aesKey';
	aesKey: boolean = false;
	getPukeyEventName: string = 'getPukey';
	getKeyEventName: string = 'getKey';
	subscriptionsManagementDict: { [key: string]: Subscription } = {};

	// @ts-ignore
	constructor(@Inject('socketUrl') private _socketUrl: string, @Inject('useSocketEncryption') private _useSocketEncryption: boolean = true) {
		this.indexedDBSocketObj = new IndexedDBSocket(); // initialize local indexed DB
		this.aesCryptographyObj = new AESCryptography(); // initialize local custom AES operations
		this.rsaCryptographyObj = new RSACryptography(); // initialize local custom RSA operations
	}

	/**
	 * Connect to the socket server
	 *
	 * @return {Promise<void>}
	 */
	connectSocket(): Promise<void> {
		return new Promise<void>((res, rej) => {
			this.socketConnection = io(this._socketUrl, {
				// connect to the socket server with credentials
				withCredentials: true,
			});
			this.socketConnection.on('connect', () => {
				// once the socket is connected then return the promise
				console.log('Connected to socket: ', this.socketConnection.id);
				if (this._useSocketEncryption) {
					if (!this.aesKey) {
						this._getAESKey().then((result: boolean) => {
							if (result) {
								sessionStorage.setItem('socketId', this.socketConnection.id);
								res();
							}
						});
					}
				} else {
					sessionStorage.setItem('socketId', this.socketConnection.id);
					res();
				}
			});
			this.socketConnection.on('disconnect', () => {
				// if the socket disconnects then allow for a new key to be established when reconnected
				sessionStorage.removeItem('socketId');
				if (this._useSocketEncryption) {
					this.aesKey = false;
				}
			});
			this.socketConnection.on(this.aesKeyEventName, (payload: string, fn) => { });
			this.socketConnection.onAny((eventName: string, payload: any) => {
				// a global event listener for all the events
				var socketPackage: SocketPackage = {
					eventName: eventName,
					payload: payload,
				};
				this.onSubject.next(socketPackage); // send the event to all the subscribers
			});
		});
	}

	/**
	 * Disconnect to the socket server
	 *
	 * @return {void}
	 */
	disconnectSocket(): void {
		for (var index in this.subscriptionsManagementDict) {
			this.clearEventListener(index);
		}
		try {
			console.log('disconnect');
			this.socketConnection.disconnect();
		} catch (err) {
			console.log(err);
		}
	}

	/**
	 * Emit an event with the custom protocol
	 *
	 * @param {string} eventName the event name for which to emit.
	 * @param {any} data the data to be sent.
	 * @param {number} ackTimeoutSec the time to wait for the acknowledgment.
	 * @return {ReturnObject} the acknowledgment for the emit.
	 */
	emit({ eventName, data, ackTimeoutSec = 10 }: EmitParameters): ReturnObject {
		var onSubscription: Subscription;
		var reqId: string = uuid4(); // generate the req id
		var payload = {
			id: reqId,
			data: this._useSocketEncryption ? this._encrypt(data) : data,
		};
		var acknowledgmentTimeout: any;
		var socketAknowlegment: SocketAknowlegment;
		var socketAknowlegmentData: SocketData;
		var subscriptionId: string = uuid4();
		return {
			id: subscriptionId,
			promise: new Promise<SocketData>((res, rej) => {
				onSubscription = this.onSubject.subscribe({
					// wait for the acknowledgment of the emit
					next: (next: SocketPackage) => {
						var packageEventName: string = next.eventName;
						var packageId: string = next.payload.id;
						if (packageEventName == this.acknowledgmentEventName && packageId == reqId) {
							if (this._useSocketEncryption) {
								next.payload.data = this._decrypt(next.payload.data);
							}
							res(next.payload);
						}
					},
				});
				this.subscriptionsManagementDict[subscriptionId] = onSubscription;
				this.socketConnection.emit(eventName, payload); // send the emit event to the server
				if (ackTimeoutSec > 0) {
					acknowledgmentTimeout = setTimeout(() => {
						// timeout of the acknowledgment
						socketAknowlegment = {
							succ: false,
							statusText: 'The acknowledgment has timed out',
							status: 408,
						};
						socketAknowlegmentData = {
							id: reqId,
							data: socketAknowlegment,
						};
						res(socketAknowlegmentData);
						//throw new Error('The acknowledgment for the emit timed out: ' + reqId);
					}, ackTimeoutSec * 1000);
				}
			}).then((socketData: SocketData) => {
				onSubscription.unsubscribe();
				delete this.subscriptionsManagementDict[subscriptionId];
				clearTimeout(acknowledgmentTimeout);
				return socketData;
			}),
		};
	}

	/**
	 * Listen for an event with the custom protocol
	 *
	 * @param {string} eventName the event name for which to listen.
	 * @param {number} timeoutSec the time that the listener should be active, if the time runs out and no event was captured throw error.
	 * @param {boolean} manualAck if to send the acknowledgment automatically or let the outside caller send it.
	 * @return {Promise<SocketData>} the data that was captured.
	 */
	on({ eventName, timeoutSec = 0, manualAck = false }: OnParameters): Promise<SocketData> {
		var onSubscription: Subscription;
		var socketAknowlegment: SocketAknowlegment;
		var socketAknowlegmentData: SocketData;
		var listenerTimeout: any;
		return new Promise<SocketData>((res, rej) => {
			onSubscription = this.onSubject.subscribe({
				// wait for the event to happen
				next: (next: SocketPackage) => {
					var packageEventName: string = next.eventName;
					if (packageEventName == eventName) {
						// check if the current event is the one that is listening for
						if (this._useSocketEncryption) {
							next.payload.data = this._decrypt(next.payload.data);
						}
						res(next.payload);
					}
				},
			});
			if (timeoutSec > 0) {
				// if no matching event happens in a time window, then timeout the listener
				listenerTimeout = setTimeout(() => {
					socketAknowlegment = {
						succ: false,
						statusText: 'The event listener has timed out',
						status: 408,
					};
					socketAknowlegmentData = {
						id: '',
						data: socketAknowlegment,
					};
					res(socketAknowlegmentData);
					//throw new Error('The event listener has timed out');
				}, timeoutSec * 1000);
			}
		}).then((socketData: SocketData) => {
			onSubscription.unsubscribe();
			clearTimeout(listenerTimeout);
			if (socketData.id == '') {
				return socketData;
			} else {
				if (!manualAck) {
					// send the acknowledgment back to the client if manual acknowledgment is not enabled
					socketAknowlegment = {
						succ: true,
						statusText: 'The emit was successful',
						status: 200,
					};
					socketAknowlegmentData = {
						id: socketData.id,
						data: this._useSocketEncryption ? this._encrypt(socketAknowlegment) : socketAknowlegment,
					};
					this.socketConnection.emit(this.acknowledgmentEventName, socketAknowlegmentData);
				}
				return socketData;
			}
		});
	}

	/**
	 * Listen for an event with the custom protocol with a callback
	 *
	 * @param {string} eventName the event name for which to listen.
	 * @param {number} timeoutSec the time that the listener should be active, if the time runs out and no event was captured throw error.
	 * @param {(socketData: SocketData) => void} callback make the event listener with a callback (global).
	 * @param {boolean} manualAck if to send the acknowledgment automatically or let the outside caller send it.
	 * @return {string} the id for the event listener.
	 */
	onCallback({ eventName, callback, timeoutSec = 0, manualAck = false }: OnCallbackParameters): string {
		var onSubscription: Subscription;
		var socketAknowlegment: SocketAknowlegment;
		var socketAknowlegmentData: SocketData;
		var listenerTimeout: any;
		var subscriptionId: string = uuid4();
		onSubscription = this.onSubject.subscribe({
			// wait for the event to happen
			next: (next: SocketPackage) => {
				var packageEventName: string = next.eventName;
				if (packageEventName == eventName) {
					// check if the current event is the one that is listening for
					if (this._useSocketEncryption) {
						next.payload.data = this._decrypt(next.payload.data);
					}
					var socketData: SocketData = next.payload;
					clearTimeout(listenerTimeout);
					if (!manualAck) {
						// send the acknowledgment back to the client if manual acknowledgment is not enabled
						socketAknowlegment = {
							succ: true,
							statusText: 'The emit was successful',
							status: 200,
						};
						socketAknowlegmentData = {
							id: socketData.id,
							data: this._useSocketEncryption ? this._encrypt(socketAknowlegment) : socketAknowlegment,
						};
						this.socketConnection.emit(this.acknowledgmentEventName, socketAknowlegmentData);
					}
					callback(socketData);
				}
			},
		});
		this.subscriptionsManagementDict[subscriptionId] = onSubscription;
		if (timeoutSec > 0) {
			// if no matching event happens in a time window, then timeout the listener
			listenerTimeout = setTimeout(() => {
				socketAknowlegment = {
					succ: false,
					statusText: 'The event listener has timed out',
					status: 408,
				};
				socketAknowlegmentData = {
					id: '',
					data: socketAknowlegment,
				};
				callback(socketAknowlegmentData);
				onSubscription.unsubscribe();
				clearTimeout(listenerTimeout);
				delete this.subscriptionsManagementDict[subscriptionId];
				//throw new Error('The event listener has timed out');
			}, timeoutSec * 1000);
		}
		return subscriptionId;
	}

	/**
	 * Clear an event listener
	 *
	 * @param {string} id the id for the event listener.
	 * @return {void}
	 */
	clearEventListener(id: string): void {
		try {
			if (Object.keys(this.subscriptionsManagementDict).includes(id)) {
				this.subscriptionsManagementDict[id].unsubscribe();
				delete this.subscriptionsManagementDict[id];
			}
		} catch (err) {
			console.log(err);
		}
	}

	/**
	 * Get the AES key from the server
	 *
	 * @return {Promise<boolean>} return the result after the getting the AES key.
	 */
	private _getAESKey(): Promise<boolean> {
		return this._getPukey() // get or check the public key
			.then((result: boolean) => {
				if (!result) {
					throw new Error('Something went wrong with the Pukey');
				}
				var aesKey16Local: string = this.aesCryptographyObj.generateAESKey(16); // generate half of the final AES key
				var aesKey32Local: string = this.aesCryptographyObj.generateAESKey(32); // generate a full key for the server to encrypt the final key
				var payload: { [id: string]: string } = { key: aesKey16Local, encryptionKey: aesKey32Local };
				this.aesCryptographyObj.readKey(aesKey32Local);
				return new Promise<string>((res, rej) => {
					this.socketConnection.emit(this.getKeyEventName, this.rsaCryptographyObj.encrypt(JSON.stringify(payload)), (data: RequestResponseObject) => {
						if (data.status == 200) {
							res(data.data);
						} else {
							throw new Error(data.statusText);
						}
					});
				});
			})
			.then((data: string) => {
				var decData: string = this.aesCryptographyObj.decrypt(data); // decrypt the data using the local full AES key
				var parsedData: AESKeyResponse = JSON.parse(decData);
				console.log(parsedData);
				var aesKey32Global: string = parsedData['finalKey']; // save the final AES key
				this.aesCryptographyObj.readKey(aesKey32Global); // read the final AES key
				return true;
			});
	}

	/**
	 * Get the public key from the server
	 *
	 * @return {Promise<boolean>} return the result after the getting the public key.
	 */
	private _getPukey(): Promise<boolean> {
		var payload: { [id: string]: string };
		var isPukeyTableEmpty: boolean = false;
		return new Promise<boolean>((res, rej) => {
			// check if the Indexed DB has opened
			if (this.indexedDBSocketObj.triedOpeningdatabase) {
				res(this.indexedDBSocketObj.openedDB);
			} else {
				this.indexedDBSubscription = this.indexedDBSocketObj.openedDBSubject.subscribe({
					next: (result) => {
						res(result);
					},
					error: (result) => {
						res(result);
					},
				});
			}
		})
			.then(() => {
				return this.indexedDBSocketObj.getPukey(); // get the public key from the local DB
			})
			.then((data: undefined | IndexedDBSocketPayload) => {
				if (data == undefined) {
					// if key doesn't exist
					isPukeyTableEmpty = true;
					payload = { hash: '' };
				} else if (data['pukeyHash']) {
					// if key exists, get the hash for it
					payload = { hash: data['pukeyHash'] };
				} else {
					// fallback
					payload = { hash: '' };
				}
				return new Promise<PukeyResponse>((res, rej) => {
					this.socketConnection.emit(this.getPukeyEventName, payload, (data: RequestResponseObject) => {
						if (data.status == 200) {
							res(data.data);
						} else {
							throw new Error(data.statusText);
						}
					});
				});
			})
			.then((data: PukeyResponse) => {
				console.log(data);
				var hashMatch: boolean = data['hashMatch'];
				console.log(hashMatch);
				var pukeyHash: string;
				var pukey: string;
				var dbPayload: IndexedDBSocketPayload;
				if (hashMatch && !isPukeyTableEmpty) {
					// if the hash matches with the one on the server
					return this.indexedDBSocketObj.getPukey().then((data: undefined | IndexedDBSocketPayload) => {
						if (data == undefined) {
							// fallback
							return '';
						} else {
							return data['pukey']; // load the key from the local DB
						}
					});
				} else {
					pukeyHash = data['hash'] || ''; // get the new hash from the server
					pukey = data['pukey'] || ''; // get the new public key from the server
					if (isPukeyTableEmpty) {
						// if local DB is empty, then create a new record with the public key and hash
						dbPayload = { pukeyID: '1', pukeyHash: pukeyHash, pukey: pukey };
						return this.indexedDBSocketObj.addPukey(dbPayload).then(() => {
							return pukey;
						});
					} else {
						// else update the DB with the new public key and hash
						dbPayload = { pukeyHash: pukeyHash, pukey: pukey };
						return this.indexedDBSocketObj.updatePukey('1', dbPayload).then(() => {
							return pukey;
						});
					}
				}
			})
			.then((pukey: string) => {
				this.rsaCryptographyObj.readPukey(pukey); // read public key
				return true;
			});
	}

	/**
	 * Encrpyt the payload for a socket
	 *
	 * @param {any} data the data to be encrypted.
	 * @return {string} the encrypted payload.
	 */
	private _encrypt(data: any): string {
		var stringifiedData: string = JSON.stringify(data);
		var encData: string = this.aesCryptographyObj.encrypt(stringifiedData);
		return encData;
	}

	/**
	 * Decrpyt the payload from a socket
	 *
	 * @param {string} encData the encrypted data to be decrypted.
	 * @return {any} the decrypted payload.
	 */
	private _decrypt(encData: string): any {
		var decData: string = this.aesCryptographyObj.decrypt(encData);
		var parsedData: any = JSON.parse(decData);
		return parsedData;
	}
}

/**
 * Interact with the Public Key Indexed DB
 */
class IndexedDBSocket extends Dexie {
	openedDB: boolean = false;
	triedOpeningdatabase: boolean = false;
	openedDBSubject: Subject<boolean> = new Subject<boolean>();

	constructor() {
		super('SocketPukeyDB'); // database name 'SocketPukeyDB'
		this.version(1).stores({
			// create database columns
			PukeyTable: 'pukeyID, pukeyHash, pukey',
		});

		this.open() // opening the database
			.then((data) => {
				this.openedDB = true;
				this.triedOpeningdatabase = true;
				this.openedDBSubject.next(true);
				console.log('DB Opened');
			})
			.catch((err) => {
				this.openedDB = false;
				this.triedOpeningdatabase = true;
				this.openedDBSubject.error(false);
				console.log(err.message);
			});
	}

	/**
	 * Get the public key from the local database
	 *
	 * @return {Promise<undefined | IndexedDBSocketPayload>} return the key or undefined if the key doesn't exist.
	 */
	getPukey(): Promise<undefined | IndexedDBSocketPayload> {
		if (this.openedDB) {
			return this.table('PukeyTable').get('1');
		} else {
			return Promise.resolve(undefined);
		}
	}

	/**
	 * Add the public key to the local database
	 *
	 * @param {IndexedDBSocketPayload} dbPayload the payload for the database
	 * @return {Promise<any>}
	 */
	addPukey(dbPayload: IndexedDBSocketPayload): Promise<any> {
		if (this.openedDB) {
			return this.table('PukeyTable').add(dbPayload);
		} else {
			return Promise.resolve(null);
		}
	}

	/**
	 * Add the public key to the local database
	 *
	 * @param {string} primary_key the primary key for the record to be updated
	 * @param {IndexedDBSocketPayload} dbPayload the payload for the database
	 * @return {Promise<any>}
	 */
	updatePukey(primary_key: string, dbPayload: IndexedDBSocketPayload): Promise<any> {
		if (this.openedDB) {
			return this.table('PukeyTable').update(primary_key, dbPayload);
		} else {
			return Promise.resolve(null);
		}
	}
}

export interface ReturnObject {
	id: string;
	promise: Promise<SocketData>;
}

export interface SocketPackage {
	eventName: string;
	payload: SocketData;
}

export interface SocketData {
	id: string;
	data: any | SocketAknowlegment;
}

export interface SocketAknowlegment {
	succ: boolean;
	status: number;
	statusText: string;
	data?: any;
}

interface EmitParameters {
	eventName: string;
	data: any;
	ackTimeoutSec?: number;
}

interface OnParameters {
	eventName: string;
	timeoutSec?: number;
	manualAck?: boolean;
}

interface OnCallbackParameters {
	eventName: string;
	timeoutSec?: number;
	callback?: (socketData: SocketData) => void;
	manualAck?: boolean;
}

interface RequestResponseObject {
	statusText: string;
	status: number;
	data?: any;
}

interface IndexedDBSocketPayload {
	pukeyID?: string;
	pukeyHash: string;
	pukey: string;
}

interface PukeyResponse {
	hashMatch: boolean;
	hash?: string;
	pukey?: string;
}

interface AESKeyResponse {
	finalKey: string;
}
