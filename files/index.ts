import { CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';
import { ServerCommunication } from '@raducualexandrumircea/lunaris-server-communication';
import { FILES_MCS_NAME } from '@raducualexandrumircea/lunaris-service-names';

export class FilesMethods {
	serverCommunicationObj: ServerCommunication;

	constructor(serverCommunicationObj: ServerCommunication) {
		this.serverCommunicationObj = serverCommunicationObj;
	}

	async deleteFiles(filesIds: number[]): Promise<void> {
		try {
			interface CurrentBody {
				filesIds: number[];
			}
			var body: CurrentBody = {
				filesIds: filesIds,
			};
			await this.serverCommunicationObj.sendPostRequest(FILES_MCS_NAME, '/files/delete-files', body);
		} catch (err) {
			console.log(err);
		}
	}

	async sendFiles(ownerUserId: number, filePermissions: FilePermission[], files: Express.Multer.File[]): Promise<number[]> {
		var response: CustomResponseObject;
		var formData: FormData = new FormData();
		try {
			formData.append('filePermissions', JSON.stringify(filePermissions));
			formData.append('ownerUserId', String(ownerUserId));
			for (var i = 0; i < files.length; i++) {
				formData.append(
					'files',
					new Blob([files[i].buffer], {
						type: files[i].mimetype,
					}),
					files[i].originalname
				);
			}
			response = await this.serverCommunicationObj.sendPostRequest(FILES_MCS_NAME, '/files/upload-files', formData, null, 80, false);
			if (response.succ) {
				return response.data.filesIds;
			}
		} catch (err) {
			console.log(err);
		}
		return [];
	}
}

export interface FilePermission {
	userId: number;
	permissionType: number;
}
