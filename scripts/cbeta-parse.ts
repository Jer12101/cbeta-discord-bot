import * as fs from 'fs';
import * as path from 'path';
import * as Database from 'better-sqlite3';
import { XMLParser } from 'fast-xml-parser';
import { globSync } from 'glob';

// === CONFIG ===
const CBETA_PATH = './data/test';
const DB_PATH = 'cbeta.db';

// === Setup SQLite DB ===
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`DROP TABLE IF EXISTS sutra_quotes`);
db.exec(`
    CREATE TABLE IF NOT EXISTS sutra_quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sutra_name TEXT NOT NULL,
        chapter TEXT NOT NULL,
        text TEXT NOT NULL
    );
`);

const insertStmt = db.prepare(`
    INSERT INTO sutra_quotes (sutra_name, chapter, text)
    VALUES (@sutra_name, @chapter, @text)
`);

// === Setup XML Parser ===
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
});

function readAllXMLFiles(folder: string): string[] {
    const files = globSync(`${folder}/**/*.xml`);
    console.log(`📜 Found ${files.length} XML files`);
    return files;
}

function extractText(p: any): string {
    if (p == null) return '';
    if (typeof p === 'string') return p.trim();
    if (typeof p === 'number' || typeof p === 'bigint') return String(p);
    if (Array.isArray(p)) {
        return p.map(extractText).join(' ').trim();
    }
    if (typeof p === 'object') {
        if ('#text' in p) return String(p['#text']).trim();
        return Object.values(p).map(extractText).join(' ').trim();
    }
    return String(p).trim();
}

function findAllParagraphs(node: any): string[] {
    if (!node) return [];
    let paragraphs: string[] = [];

    if (node.p) {
        if (Array.isArray(node.p)) {
            paragraphs.push(
                ...node.p.map(p => extractText(p))
            );
        } else {
            paragraphs.push(extractText(node.p));
        }
    }

    for (const key in node) {
        if (typeof node[key] === "object") {
            paragraphs.push(...findAllParagraphs(node[key]));
        }
    }

    return paragraphs.filter(p => p.length > 0);
}

function insertParagraphs(sutraName: any, chapter: any, paragraphs: any[]) {
    const cleanName = extractText(sutraName);
    const cleanChapter = extractText(chapter);

    for (const p of paragraphs) {
        const text = extractText(p);
        if (text) {
            insertStmt.run({
                sutra_name: cleanName,
                chapter: cleanChapter,
                text,
            });
        }
    }
}

function isEditorialFile(filePath: string, title: string): boolean {
    // Typical editorial file pattern
    if (/\/a\d{3}\.xml$/.test(filePath)) return true;

    // Title filter
    const blacklist = [
        '目錄',
        '徵稿',
        '體例',
        '啟事',
        '總目',
        '編輯',
        '校勘',
        '投稿',
        '研究',
        '錄文',
        'Buddhist Texts not contained',
        'Passages concerning Buddhism from the Official Histories',
        `Corpus of Venerable Yin Shun's Buddhist Studies`,

    ];
    return blacklist.some(keyword => title.includes(keyword));
}

function processFile(filePath: string) {
    const xml = fs.readFileSync(filePath, "utf-8");
    const json = parser.parse(xml);

    const TEI = json.TEI;
    const rawTitle = TEI?.teiHeader?.fileDesc?.titleStmt?.title || path.basename(filePath, ".xml");
    const title = extractText(rawTitle);

    if (isEditorialFile(filePath, title)) {
        console.warn(`⚠️  Skipping non-sutra file: ${title} (${filePath})`);
        return;
    }

    const body = TEI?.text?.body;
    if (!body) {
        console.warn(`⚠️  No <body> in ${title}`);
        return;
    }

    if (body.div) {
        const divisions = Array.isArray(body.div) ? body.div : [body.div];
        for (const div of divisions) {
            const chapter = extractText(div.n) || "全篇";
            const paragraphs = findAllParagraphs(div);
            insertParagraphs(title, chapter, paragraphs);
        }
    } else {
        const paragraphs = findAllParagraphs(body);
        insertParagraphs(title, "全篇", paragraphs);
    }

    console.log(`✅ Inserted: ${title}`);
}

function main() {
    const files = readAllXMLFiles(CBETA_PATH);
    for (const file of files) {
        try {
            processFile(file);
        } catch (err) {
            console.error(`❌ Error processing ${file}:`, err);
        }
    }
    console.log("✅ All done!");
}

main();
