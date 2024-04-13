import { AccountMethods } from '@raducualexandrumircea/lunaris-account';
import {
	ClassMessageDetails,
	CustomResponseObject,
	SocketSendClassMessage,
} from '@raducualexandrumircea/lunaris-interfaces';
import { ServerCommunication } from '@raducualexandrumircea/lunaris-server-communication';
import { MESSAGES_MCS_NAME } from '@raducualexandrumircea/lunaris-service-names';
import {
	SocketAknowlegment,
	SocketData,
	SocketInterface,
	SocketManager,
} from '@raducualexandrumircea/redis-socket-manager';

export function socketRoutes(
	socketManagerObj: SocketManager,
	serverCommunicationObj: ServerCommunication,
	accountMethodsObj: AccountMethods
) {
	socketManagerObj.on({
		eventName: 'send-class-message',
		manualAck: true,
		local: true,
		callback: async (socketData: SocketData) => {
			var socketInterfaceObj: SocketInterface = socketData.socketInterfaceObj;
			var data: SocketSendClassMessage = socketData.data;
			var userId: number = await getSocketUserId(socketInterfaceObj);
			var response: CustomResponseObject = await serverCommunicationObj.sendPostRequest(
				MESSAGES_MCS_NAME,
				'/messages/create/class/message',
				{
					userId: userId,
					classId: data.classId,
					content: data.content,
				}
			);
			var socketAknowlegment: SocketAknowlegment;
			if (!response.succ) {
				console.log(response);
				socketAknowlegment = {
					succ: false,
					statusText: response.mes || response.debugMes || 'Something went wrong',
					status: 200,
				};
				await socketInterfaceObj.sendManualAck(socketData.id, socketAknowlegment);
				return;
			}
			var messageId: string = response.data.messageId;
			var socketSendObject: ClassMessageDetails = response.data.socketSendObject;
			socketAknowlegment = {
				succ: true,
				statusText: 'The emit was successful',
				status: 200,
				data: {
					messageId: messageId,
					socketSendObject: socketSendObject,
				},
			};
			await socketInterfaceObj.sendManualAck(socketData.id, socketAknowlegment);
			socketInterfaceObj.emit({
				eventName: 'on-new-class-message',
				rooms: ['class-' + String(data.classId)],
				data: socketSendObject,
				ackTimeoutSec: 0,
			});
		},
	});

	socketManagerObj.on({
		eventName: 'enter-class',
		manualAck: false,
		local: true,
		callback: async (socketData: SocketData) => {
			var classId: number = socketData.data.classId;
			var socketInterfaceObj: SocketInterface = socketData.socketInterfaceObj;
			var userId: number = await getSocketUserId(socketInterfaceObj);
			var userRole: number = await accountMethodsObj.getUserRole(userId);
			if (userRole != 3 && !(await accountMethodsObj.checkIfClassMember(classId, userId))) {
				console.log(
					'You don not permissions to get the class messages as you are not in that class'
				);
				return;
			}
			await socketInterfaceObj.addUserToRoom('class-' + String(classId));
		},
	});

	socketManagerObj.on({
		eventName: 'leave-class',
		manualAck: false,
		local: true,
		callback: async (socketData: SocketData) => {
			var classId: number = socketData.data.classId;
			var socketInterfaceObj: SocketInterface = socketData.socketInterfaceObj;
			await socketInterfaceObj.removeUserFromRoom('class-' + String(classId));
		},
	});
}

async function getSocketUserId(socketInterfaceObj: SocketInterface): Promise<number> {
	var userRoomPrefix: string = 'user-';
	var socketAllRooms = await socketInterfaceObj.getUserRooms();
	for (var i = 0; i < socketAllRooms.length; i++) {
		if (socketAllRooms[i].includes(userRoomPrefix)) {
			return parseInt(socketAllRooms[i].slice(userRoomPrefix.length));
		}
	}
}
