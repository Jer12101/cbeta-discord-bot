import * as Database from 'better-sqlite3';
import * as fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import * as path from 'path';

// === CONFIG ===
const DB_PATH = 'cbeta.db';
const TEST_FILE = './data/test';

// === 1. Open DB ===
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Ensure table exists
db.exec(`
    CREATE TABLE IF NOT EXISTS sutra_quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sutra_name TEXT NOT NULL,
    chapter TEXT NOT NULL,
    text TEXT NOT NULL
    );
`);

// === 2. Prepare Insert Statement ===
const insertStmt = db.prepare(`
    INSERT INTO sutra_quotes (sutra_name, chapter, text)
    VALUES (@sutra_name, @chapter, @text)
`);


// === 3. Parse XML ===
const parser = new XMLParser({ ignoreAttributes: false });
// === Filtering Function ===
function shouldIncludeTitle(title: string): boolean {
    if (!title) return false;

    const exclusionKeywords = ['音義', '注', '序', '科判'];
    for (const keyword of exclusionKeywords) {
        if (title.includes(keyword)) return false;
    }

    return true; // Include everything else
}

// === Helper: Extract paragraphs ===
function extractParagraphs(p): string {
    if (!p) return '';
    if (typeof p === 'string') return p.trim();
    if (Array.isArray(p)) return p.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join('\n').trim();
    if (p?._text) return p._text.trim();
    return '';
}

// === Main Seeding Function ===
function processFile(filePath: string) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const json = parser.parse(content);

        // === Get title from teiHeader ===
        const title = json?.TEI?.teiHeader?.fileDesc?.titleStmt?.title ?? '';
        if (!title) {
        console.log(`⚠️  No title in ${filePath}, skipping`);
        return;
        }

        // === Apply filter rules ===
        if (!shouldIncludeTitle(title)) {
        console.log(`⏭️ Skipping (filtered): ${title}`);
        return;
        }

        console.log(`✅ Including: ${title}`);

        // === Get body content ===
        const bookDiv = json?.TEI?.text?.body?.div;
        if (!bookDiv) {
        console.log(`⚠️  No <div> in body for ${title}`);
        return;
        }

        // === Check for internal chapters ===
        const maybeChapters = bookDiv.div;
        if (maybeChapters) {
        const chapters = Array.isArray(maybeChapters) ? maybeChapters : [maybeChapters];
        for (const chapterDiv of chapters) {
            const chapterNumber = chapterDiv["@_n"] ?? '未知章';
            const chapterLabel = `第${chapterNumber}章`;
            const text = extractParagraphs(chapterDiv.p);
            if (text) {
            insertStmt.run({ sutra_name: title, chapter: chapterLabel, text });
            }
        }
        } else {
        // No internal chapters → treat entire book as one
        const text = extractParagraphs(bookDiv.p);
        if (text) {
            insertStmt.run({ sutra_name: title, chapter: '全篇', text });
        }
        }

    } catch (err) {
        console.error(`❌ Error parsing ${filePath}:`, err.message);
    }
    }

    // === Recursive Directory Walker ===
    function walkDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath);
        } else if (file.endsWith('.xml')) {
        processFile(fullPath);
        }
    }
    }

// === Run Seeding ===
console.log('🚀 Starting CBETA seeding...');
walkDir(TEST_FILE);
console.log('✅ Seeding complete.');