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

  sendGetRequest(serviceName: string, path: string, namespace: string = null, port: number = 80): Promise<CustomResponseObject> {
    return fetch(this._constructServiceUrl(serviceName, path, port, namespace), {
      headers: {
        'server-key': this.serverKey,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data: CustomResponseObject) => {
        return data;
      });
  }

  sendPostRequest(serviceName: string, path: string, payload: any, namespace: string = null, port: number = 80): Promise<CustomResponseObject> {
    return fetch(this._constructServiceUrl(serviceName, path, port, namespace), {
      method: 'POST',
      headers: {
        'server-key': this.serverKey,
      },
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

  private _constructServiceUrl(serviceName: string, path: string, port: number, namespace: string): string {
    if (namespace == null) {
      namespace = this.namespace;
    }
    return `http://${serviceName}.${namespace}:${port}${path}`;
  }
}

export function secureRoutesMiddleware(serverCommunicationObj: ServerCommunication) {
  return (req: Request, res: Response, next: NextFunction) => {
    var requestPayload: string;
    var parsedRequestPayload: any;
    var responsePayload: any;
    var oldSend = res.send;
    if (!serverCommunicationObj.checkServerKey(req)) {
      res.status(404).send();
      return;
    }
    res.send = function (string: string | Buffer): Response<any> {
      responsePayload = string instanceof Buffer ? string.toString() : string;
      if (responsePayload == undefined || responsePayload == null) {
        return oldSend.call(this, responsePayload);
      } else {
        return oldSend.call(this, JSON.stringify(responsePayload));
      }
    };
    if (req.method == 'POST') {
      requestPayload = req.body;
      parsedRequestPayload = JSON.parse(requestPayload);
      req['reqPayload'] = parsedRequestPayload;
    }
    next();
  };
}
