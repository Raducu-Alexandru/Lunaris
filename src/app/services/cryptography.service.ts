import { Injectable, Inject } from '@angular/core';
import Dexie from 'dexie';
import { Subject, Subscription } from 'rxjs';
import { AESCryptography, RSACryptography } from '@raducualexandrumircea/custom-cryptography';

// @ts-ignore
@Injectable({
	providedIn: 'root',
})
/**
 * Handle the custom encryption protocol for client
 */
// @ts-ignore
export class CryptographyService {
	indexedDBCryptographyObj: IndexedDBCryptography;
	aesCryptographyObj: AESCryptography;
	rsaCryptographyObj: RSACryptography;
	aesKeyExchangeTries: number = 0;
	aesKeyExchangeMaxTries: number = 3;
	aesKeyExchangeInProgress: boolean = false;
	aesKeyIat: Date;
	aesKeyExp: Date;
	aesKeyDoneSubject: Subject<CryptographyMessage> = new Subject<CryptographyMessage>();
	indexedDBSubscription: Subscription;

	//@ts-ignore
	constructor(@Inject('encryptionServerUrl') private _encryptionServerUrl: string = location.origin, @Inject('useEncryption') private _useEncryption: boolean = true) {
		this.indexedDBCryptographyObj = new IndexedDBCryptography(); // initialize local indexed DB
		this.aesCryptographyObj = new AESCryptography(); // initialize local custom AES operations
		this.rsaCryptographyObj = new RSACryptography(); // initialize local custom RSA operations
	}

	/**
	 * Exchange the AES key
	 *
	 * @param {boolean} omitCheck omit the check for already started the AES handshake.
	 * @return {Promise<CryptographyMessage>} return the result after the AES handshake.
	 */
	startAesKeyExchange(omitCheck: boolean = false): Promise<CryptographyMessage> {
		if (this._useEncryption) {
			var resultalreadyInProg: CryptographyMessage = { mes: 'Another AES key exchange is already in progress', err: '', succ: false, alreadyInProg: true };
			var resultMaxTriesExceeded: CryptographyMessage = { mes: '', err: 'Maximum tries exceeded for AES handshake', succ: false, alreadyInProg: false };
			if (this.aesKeyExchangeInProgress && omitCheck == false) {
				// if key exchange already in progress
				return Promise.resolve(resultalreadyInProg);
			}
			this.aesKeyExchangeInProgress = true;
			if (this.aesKeyExchangeTries < this.aesKeyExchangeMaxTries) {
				// if max tries is reached
				return this._getAESKey()
					.then((result: CryptographyMessage) => {
						if (result['succ']) {
							// AES handshake is successfull, reset the tries
							this.aesKeyExchangeTries = 0;
						} else {
							// otherwise increase the tries and try again
							this.aesKeyExchangeTries++;
							return this.startAesKeyExchange((omitCheck = true));
						}
						this.aesKeyExchangeInProgress = false; // exit the key exchange
						this.aesKeyDoneSubject.next(result); // send the result to the waiting subscribers
						return Promise.resolve(result);
					})
					.catch(() => {
						// if any error increase the tries and try again
						this.aesKeyExchangeTries++;
						return this.startAesKeyExchange((omitCheck = true));
					});
			} else {
				this.aesKeyExchangeTries = 0; // reset the tries
				this.aesKeyExchangeInProgress = false; // exit the key exchange
				this.aesKeyDoneSubject.error(resultMaxTriesExceeded); // send the maximum tries exceeded to the waiting subscribers
				return Promise.reject(resultMaxTriesExceeded);
			}
		} else {
			return Promise.resolve({ mes: '', err: '', succ: true, alreadyInProg: false });
		}
	}

	/**
	 * Get the public key from the server
	 *
	 * @return {Promise<CryptographyMessage>} return the result after the getting the public key.
	 */
	private _getPukey(): Promise<CryptographyMessage> {
		var payload: { [id: string]: string };
		var isPukeyTableEmpty: boolean = false;
		var result: CryptographyMessage;
		return new Promise<boolean>((res, rej) => {
			// check if the Indexed DB has opened
			if (this.indexedDBCryptographyObj.triedOpeningdatabase) {
				res(this.indexedDBCryptographyObj.openedDB);
			} else {
				this.indexedDBSubscription = this.indexedDBCryptographyObj.openedDBSubject.subscribe({
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
				return this.indexedDBCryptographyObj.getPukey(); // get the public key from the local DB
			})
			.then((data: undefined | IndexedDBCryptographyPayload) => {
				console.log(data);
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
				return fetch(this._encryptionServerUrl + '/getPukey', {
					// send the public key hash to the server
					credentials: 'include',
					method: 'POST',
					body: JSON.stringify(payload),
				});
			})
			.then((response: Response) => {
				if (response.status != 200) {
					throw response.statusText;
				}
				return response.json();
			})
			.then((data: PukeyResponse) => {
				console.log(data);
				var hashMatch: boolean = data['hashMatch'];
				console.log(hashMatch);
				var pukeyHash: string;
				var pukey: string;
				var dbPayload: IndexedDBCryptographyPayload;
				if (hashMatch && !isPukeyTableEmpty) {
					// if the hash matches with the one on the server
					return this.indexedDBCryptographyObj.getPukey().then((data: undefined | IndexedDBCryptographyPayload) => {
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
						return this.indexedDBCryptographyObj.addPukey(dbPayload).then(() => {
							return pukey;
						});
					} else {
						// else update the DB with the new public key and hash
						dbPayload = { pukeyHash: pukeyHash, pukey: pukey };
						return this.indexedDBCryptographyObj.updatePukey('1', dbPayload).then(() => {
							return pukey;
						});
					}
				}
			})
			.then((pukey: string) => {
				this.rsaCryptographyObj.readPukey(pukey); // read public key
				result = { mes: 'PublicKey read into object', err: '', succ: true, alreadyInProg: false };
				return Promise.resolve(result);
			});
	}

	/**
	 * Get the AES key from the server
	 *
	 * @return {Promise<CryptographyMessage>} return the result after the getting the AES key.
	 */
	private _getAESKey(): Promise<CryptographyMessage> {
		return this._getPukey() // get or check the public key
			.then((result: CryptographyMessage) => {
				if (!result['succ']) {
					return Promise.reject(result);
				}
				var aesKey16Local: string = this.aesCryptographyObj.generateAESKey(16); // generate half of the final AES key
				var aesKey32Local: string = this.aesCryptographyObj.generateAESKey(32); // generate a full key for the server to encrypt the final key
				var payload: { [id: string]: string } = { key: aesKey16Local, encryptionKey: aesKey32Local };
				this.aesCryptographyObj.readKey(aesKey32Local);
				return fetch(this._encryptionServerUrl + '/getKey', {
					// get the AES key
					credentials: 'include',
					method: 'POST',
					body: this.rsaCryptographyObj.encrypt(JSON.stringify(payload)), // encrypt the the 2 keys with the public key
				});
			})
			.then((response: Response) => {
				if (response.status != 200) {
					throw new Error(response.statusText);
				}
				return response.text();
			})
			.then((data: string) => {
				var decData: string = this.aesCryptographyObj.decrypt(data); // decrypt the data using the local full AES key
				var parsedData: AESKeyResponse = JSON.parse(decData);
				console.log(parsedData);
				var aesKey32Global: string = parsedData['finalKey']; // save the final AES key
				var aesExp: number = parsedData['exp'];
				var aesIat: number = parsedData['iat'];
				this.aesKeyIat = new Date(aesIat * 1000); // convert to JS timestamp
				this.aesKeyExp = new Date(aesExp * 1000); // convert to JS timestamp
				this.aesCryptographyObj.readKey(aesKey32Global); // read the final AES key
				var result: CryptographyMessage = { mes: 'AES key exchange successfull', err: '', succ: true, alreadyInProg: false };
				return Promise.resolve(result);
			});
	}
}

export interface CryptographyMessage {
	mes: string;
	err: string;
	succ: boolean;
	alreadyInProg: boolean;
}

interface IndexedDBCryptographyPayload {
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
	iat: number;
	exp: number;
}

/**
 * Interact with the Public Key Indexed DB
 */
class IndexedDBCryptography extends Dexie {
	openedDB: boolean = false;
	triedOpeningdatabase: boolean = false;
	openedDBSubject: Subject<boolean> = new Subject<boolean>();

	constructor() {
		super('PukeyDB'); // database name 'PukeyDB'
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
	 * @return {Promise<undefined | IndexedDBCryptographyPayload>} return the key or undefined if the key doesn't exist.
	 */
	getPukey(): Promise<undefined | IndexedDBCryptographyPayload> {
		if (this.openedDB) {
			return this.table('PukeyTable').get('1');
		} else {
			return Promise.resolve(undefined);
		}
	}

	/**
	 * Add the public key to the local database
	 *
	 * @param {IndexedDBCryptographyPayload} dbPayload the payload for the database
	 * @return {Promise<any>}
	 */
	addPukey(dbPayload: IndexedDBCryptographyPayload): Promise<any> {
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
	 * @param {IndexedDBCryptographyPayload} dbPayload the payload for the database
	 * @return {Promise<any>}
	 */
	updatePukey(primary_key: string, dbPayload: IndexedDBCryptographyPayload): Promise<any> {
		if (this.openedDB) {
			return this.table('PukeyTable').update(primary_key, dbPayload);
		} else {
			return Promise.resolve(null);
		}
	}
}
