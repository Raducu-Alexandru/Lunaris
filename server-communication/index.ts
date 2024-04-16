import { CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';
import { Request, Response, NextFunction } from 'express';

export class ServerCommunication {
	namespace: string;
	serverKey: string;

	constructor(namespace: string, serverKey: string) {
		this.namespace = namespace;
		this.serverKey = serverKey;
	}

	checkServerKey(req: Request): boolean {
		var reqServerKey: string = req.headers['server-key'] as string;
		if (reqServerKey !== this.serverKey) {
			return false;
		}
		return true;
	}

	sendGetRequest(serviceName: string, path: string, namespace: string = null, port: number = 80, useJson: boolean = true): Promise<CustomResponseObject> {
		return fetch(this._constructServiceUrl(serviceName, path, port, namespace), {
			headers: this._constructHeaders({}, useJson),
		})
			.then((response) => {
				return response.json();
			})
			.then((data: CustomResponseObject) => {
				return data;
			});
	}

	sendPostRequest(serviceName: string, path: string, payload: any, namespace: string = null, port: number = 80, useJson: boolean = true): Promise<CustomResponseObject> {
		return fetch(this._constructServiceUrl(serviceName, path, port, namespace), {
			method: 'POST',
			headers: this._constructHeaders({}, useJson),
			body: JSON.stringify(payload),
		})
			.then((response) => {
				return response.json();
			})
			.then((data: CustomResponseObject) => {
				console.log(data);
				return data;
			});
	}

	private _constructHeaders(headers: { [key: string]: string }, isJson: boolean = false): { [key: string]: string } {
		return Object.assign(
			{},
			headers,
			isJson
				? {
						'Content-Type': 'application/json; charset=utf-8',
						'server-key': this.serverKey,
				  }
				: {}
		);
	}

	private _constructServiceUrl(serviceName: string, path: string, port: number, namespace: string): string {
		if (namespace == null) {
			namespace = this.namespace;
		}
		return `http://${serviceName}.${namespace}:${port}${path}`;
	}
}

export function secureRoutesMiddleware(serverCommunicationObj: ServerCommunication) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!serverCommunicationObj.checkServerKey(req)) {
			res.status(404).send();
			return;
		}
		next();
	};
}
