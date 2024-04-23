import { DbHandler, NormalPacket, SelectPacket } from '@raducualexandrumircea/custom-db-handler';
import { FilePermission } from '@raducualexandrumircea/lunaris-files';
import { CustomResponseObject } from '@raducualexandrumircea/lunaris-interfaces';
import { Router, Request, Response } from 'express';
import multer from 'multer';
import mime from 'mime-types';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const ExifTransformer = require('exif-be-gone');

export function secureRoutes(secureRouter: Router, dbConnection: DbHandler, upload: multer.Multer) {
	secureRouter.post('/delete-files', async (req: Request, res: Response) => {
		interface CurrentBody {
			filesIds: number[];
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		console.log(body);
		if (!('filesIds' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var filesIds: number[] = body.filesIds;
		var storedFileNameSqlResult: SelectPacket;
		for (var i = 0; i < filesIds.length; i++) {
			storedFileNameSqlResult = await dbConnection.execute<SelectPacket>('SELECT storedFileName FROM files WHERE fileId = ?', [filesIds[i]]);
			if (storedFileNameSqlResult.length != 1) {
				continue;
			}
			await dbConnection.execute<NormalPacket>('DELETE FROM files WHERE fileId = ?', [filesIds[i]]);
			await dbConnection.execute<NormalPacket>('DELETE FROM filesPermissions WHERE fileId = ?', [filesIds[i]]);
			await fs.promises.unlink(path.join('/files', storedFileNameSqlResult[0].storedFileName));
		}
		responseObject = {
			succ: true,
		};
		res.status(200).send(responseObject);
		return;
	});

	secureRouter.route('/upload-files').post(upload.array('files'), async (req: Request, res: Response) => {
		interface CurrentBody {
			filePermissions: string;
			ownerUserId: string;
		}
		var responseObject: CustomResponseObject;
		var body: CurrentBody = req.body;
		console.log(body);
		if (!('filePermissions' in body && 'ownerUserId' in body)) {
			responseObject = {
				succ: false,
				mes: 'Something went wrong',
				debugMes: 'Invalid number of POST parameters',
			};
			res.status(200).send(responseObject);
			return;
		}
		var filePermissions: FilePermission[] = JSON.parse(body.filePermissions);
		var ownerUserId: number = parseInt(body.ownerUserId);
		var files = (req.files as Express.Multer.File[]) || [];
		console.log(files);
		var transaction = await dbConnection.startTransaction();
		var fileName: string;
		var fileExt: string | boolean;
		var filesIds: number[] = [];
		try {
			for (var i = 0; i < files.length; i++) {
				fileExt = mime.extension(files[0].mimetype);
				if (!fileExt) {
					await dbConnection.rollbackTransactionAndClose(transaction);
					responseObject = {
						succ: false,
						mes: 'The file type is not supported',
					};
					res.status(200).send(responseObject);
					return;
				}
				fileName = uuidv4() + '.' + fileExt;
				var fileInsertSqlResult: NormalPacket = await dbConnection.executeInTransaction<NormalPacket>(
					transaction,
					'INSERT INTO files (fileName, storedFileName, lastModifiedUserId, fileType) VALUES (?, ?, ?, ?)',
					[files[0].originalname, fileName, ownerUserId, 2]
				);
				filesIds.push(fileInsertSqlResult.insertId);
				var stream = require('stream');
				var reader = new stream.PassThrough();
				reader.end(files[i].buffer);
				var writer = fs.createWriteStream(path.join('/files', fileName));
				//reader.pipe(new ExifTransformer()).pipe(writer);
				reader.pipe(writer);
				await new Promise<void>((res, rej) => {
					reader.on('end', function () {
						res();
					});
				});
				for (var j = 0; j < filePermissions.length; j++) {
					await dbConnection.executeInTransaction<NormalPacket>(transaction, 'INSERT INTO filesPermissions (fileId, userId, permissionType) VALUES (?, ?, ?)', [
						fileInsertSqlResult.insertId,
						filePermissions[j].userId,
						filePermissions[j].permissionType,
					]);
				}
			}
			await dbConnection.commitTransactionAndClose(transaction);
		} catch (err) {
			await dbConnection.rollbackTransactionAndClose(transaction);
			responseObject = {
				succ: false,
				mes: String(err),
			};
			res.status(200).send(responseObject);
			return;
		}
		responseObject = {
			succ: true,
			data: {
				filesIds: filesIds,
			},
		};
		res.status(200).send(responseObject);
		return;
	});
}
