import { createClient } from '@libsql/client'

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL environment variable is not set')
}

if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN environment variable is not set')
}

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export async function initializeDatabase() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      pronunciation TEXT,
      category TEXT DEFAULT 'isim',
      source TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS definitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
      definition TEXT NOT NULL,
      order_num INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS examples (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
      example TEXT NOT NULL,
      order_num INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS synonyms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL REFERENCES words(id) ON DELETE CASCADE,
      synonym TEXT NOT NULL,
      type TEXT DEFAULT 'sinonim'
    );
  `)
}

export type Word = {
  id: number
  word: string
  slug: string
  pronunciation: string | null
  category: string
  source: string | null
  created_at: string
  updated_at: string
}

export type Definition = {
  id: number
  word_id: number
  definition: string
  order_num: number
}

export type Example = {
  id: number
  word_id: number
  example: string
  order_num: number
}

export type Synonym = {
  id: number
  word_id: number
  synonym: string
  type: string
}

export type WordWithRelations = Word & {
  definitions: Definition[]
  examples: Example[]
  synonyms: Synonym[]
}
