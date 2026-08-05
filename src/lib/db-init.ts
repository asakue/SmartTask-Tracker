import { Pool } from "pg";

let initialized = false;

export async function ensureDatabaseInitialized() {
  if (initialized) return;
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    await client.query("SET statement_timeout = '30s'");

    const commands = [
      "DROP TABLE IF EXISTS daily_reports CASCADE",
      "DROP TABLE IF EXISTS focus_sessions CASCADE",
      "DROP TABLE IF EXISTS subtasks CASCADE",
      "DROP TABLE IF EXISTS tasks CASCADE",
      "DROP TABLE IF EXISTS users CASCADE",
      
      `CREATE TABLE users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'USER',
        avatar TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE tasks (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        priority TEXT DEFAULT 'MEDIUM',
        status TEXT DEFAULT 'PLANNED',
        due_date TIMESTAMP,
        tags TEXT[] DEFAULT '{}',
        color TEXT,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      )`,
      
      `CREATE TABLE subtasks (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE focus_sessions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        duration INTEGER NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE daily_reports (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        tasks_created INTEGER DEFAULT 0,
        tasks_completed INTEGER DEFAULT 0,
        focus_minutes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, date)
      )`,
      
      "CREATE INDEX IF NOT EXISTS idx_tus ON tasks(user_id, status)",
      "CREATE INDEX IF NOT EXISTS idx_tud ON tasks(user_id, due_date)",
      "CREATE INDEX IF NOT EXISTS idx_tup ON tasks(user_id, priority)",
      "CREATE INDEX IF NOT EXISTS idx_fsu ON focus_sessions(user_id, created_at)",
      "CREATE INDEX IF NOT EXISTS idx_dru ON daily_reports(user_id, date)",
    ];

    for (const cmd of commands) {
      await client.query(cmd);
    }

    client.release();
    await pool.end();
    initialized = true;
    console.log("[DB INIT] ALL DONE via pg pool");
  } catch (error) {
    console.error("[DB INIT] Error:", error);
    initialized = true;
  }
}
