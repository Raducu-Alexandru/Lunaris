import { DbHandler, NormalPacket } from '@raducualexandrumircea/custom-db-handler';
import { NextFunction, Request, Response } from 'express';

export function getCorsOptions(urls: string[]) {
	var splittedUrl: string[];
	var hostname: string;
	var normalUrl: string;
	var capacitorUrl: string;
	var currentUrl: string;
	var finalOrigins: string[] = [];
	for (var i = 0; i < urls.length; i++) {
		currentUrl = urls[i];
		splittedUrl = currentUrl.split('://');
		hostname = splittedUrl[1];
		normalUrl = currentUrl;
		capacitorUrl = 'capacitor://' + hostname;
		finalOrigins.push(normalUrl);
		finalOrigins.push(capacitorUrl);
	}
	return {
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		credentials: true,
		origin: finalOrigins,
		optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
	};
}

export function formatDate(date: Date): string {
	let day = date.getDate().toString().padStart(2, '0');
	let month = (date.getMonth() + 1).toString().padStart(2, '0'); // JavaScript months are zero-indexed
	let year = date.getFullYear();
	let hours = date.getHours().toString().padStart(2, '0');
	let minutes = date.getMinutes().toString().padStart(2, '0');
	let seconds = date.getSeconds().toString().padStart(2, '0');

	return `${day}.${month}.${year} ${hours}-${minutes}-${seconds}`;
}

export function handleEventManagerMiddleware(dbConnection: DbHandler) {
	return async (req: Request, res: Response, next: NextFunction) => {
		res.on('finish', async () => {
			if (!res['adminEventDataObj']) {
				return;
			}
			var adminEventDataObj: AdminEventData = res['adminEventDataObj'];
			try {
				await dbConnection.execute<NormalPacket>('INSERT INTO adminEvents (userId, message) VALUES (?, ?)', [adminEventDataObj.userId, adminEventDataObj.message]);
			} catch (err) {
				console.log(err);
			}
		});
		next();
	};
}

export interface AdminEventData {
	userId: number;
	message: string;
}
