import { DbHandler } from "@raducualexandrumircea/custom-db-handler";

export class SqlQueries {
    private dbConnection: DbHandler;

    constructor(dbConnection: DbHandler) {
        this.dbConnection = dbConnection;
    }

    async getUniversityIdFromLongId(universityLongId: string): Promise<number> {
        var result: GetUniversityIdFromLongId[] = await this.dbConnection.execute<GetUniversityIdFromLongId[]>('SELECT universityId FROM universities WHERE universityLongId = ?', [universityLongId]);
        if (result.length != 1) {
            return null;
        }
        return result[0].universityId;
    }
}

interface GetUniversityIdFromLongId {
    universityId: number;
}