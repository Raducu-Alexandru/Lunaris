import { CustomResponseObject } from "@raducualexandrumircea/lunaris-interfaces";
import { ServerCommunication } from "@raducualexandrumircea/lunaris-server-communication";
import { SOCKET_SERVER_MCS_NAME } from "@raducualexandrumircea/lunaris-service-names";


export class SocketMethods {
    serverCommunicationObj: ServerCommunication;
    disconnectSessionsSocketsUrlPath: string = '/socket/disconnect-sessions-sockets';

    constructor(serverCommunicationObj: ServerCommunication) {
        this.serverCommunicationObj = serverCommunicationObj;
    }

    async disconnectSessionsSockets(sessionId: string): Promise<void> {
        var response: CustomResponseObject;
        try {
            response = await this.serverCommunicationObj.sendPostRequest(SOCKET_SERVER_MCS_NAME, this.disconnectSessionsSocketsUrlPath, {
                sessionId: sessionId,
            });
            console.log(response);
        } catch (err) {
            console.log(err);
        }
    }
}
