import { Express, Request, Response } from 'express';

const healthPathPrefix = '/health';

export function healthRoutes(app: Express) {
    app.get(healthPathPrefix + '/check', async (req: Request, res: Response) => {
        res.status(200).send();
    });
}
