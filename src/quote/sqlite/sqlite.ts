// This provider opens the DB connection and can be injected anywhere

import { Provider } from "@nestjs/common";
import * as Database from "better-sqlite3";

export const SqliteProvider: Provider = {
    provide: 'SQLITE_CONNECTION',
    useFactory: () => {
        const db = new Database('cbeta.db');
        db.pragma('journal_mode = WAL');
        return db;
    },
};
