// Handles random fetching

export interface Quote {
    id: number;
    sutra_name: string;
    chapter: string;
    text: string;
}

import { Inject, Injectable} from '@nestjs/common';
import { Database as DatabaseType} from 'better-sqlite3';


@Injectable()
export class QuoteService {
    constructor(
        @Inject('SQLITE_CONNECTION') private readonly db: DatabaseType
    ) {}

    getRandomQuote() {
        const stmt = this.db
        .prepare('SELECT * FROM sutra_quotes ORDER BY RANDOM() LIMIT 1');

        return stmt.get() as Quote | undefined; // stmt.get always returns either the row or undefined
        // We type-cast with as Quote | undefined to tell TypeScript exactly what we expect
    }
}

