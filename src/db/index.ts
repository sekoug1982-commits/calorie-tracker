import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import fs from 'fs';
import * as schema from './schema';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'tracker.db');
const sqlite = new Database(dbPath);

sqlite.pragma('journal_mode = WAL');

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS food_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    meal_type TEXT NOT NULL,
    serving_size TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

export const db = drizzle(sqlite, { schema });
