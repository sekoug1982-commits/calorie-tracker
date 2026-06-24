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
    protein INTEGER NOT NULL DEFAULT 0,
    carbs INTEGER NOT NULL DEFAULT 0,
    fat INTEGER NOT NULL DEFAULT 0,
    meal_type TEXT NOT NULL,
    serving_size TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

const columns = sqlite.pragma('table_info(food_entries)') as { name: string }[];
const columnNames = columns.map(c => c.name);
if (!columnNames.includes('protein')) {
  sqlite.exec('ALTER TABLE food_entries ADD COLUMN protein INTEGER NOT NULL DEFAULT 0');
}
if (!columnNames.includes('carbs')) {
  sqlite.exec('ALTER TABLE food_entries ADD COLUMN carbs INTEGER NOT NULL DEFAULT 0');
}
if (!columnNames.includes('fat')) {
  sqlite.exec('ALTER TABLE food_entries ADD COLUMN fat INTEGER NOT NULL DEFAULT 0');
}

export const db = drizzle(sqlite, { schema });
