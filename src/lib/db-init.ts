import { prisma } from "@/lib/prisma";

let initialized = false;

export async function ensureDatabaseInitialized() {
  if (initialized) return;
  
  try {
    // Всё в одном SQL запросе
    await prisma.$executeRawUnsafe(`
      DROP TABLE IF EXISTS daily_reports CASCADE;
      DROP TABLE IF EXISTS focus_sessions CASCADE;
      DROP TABLE IF EXISTS subtasks CASCADE;
      DROP TABLE IF EXISTS tasks CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      
      CREATE TABLE users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'USER',
        avatar TEXT,
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE tasks (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        priority TEXT DEFAULT 'MEDIUM',
        status TEXT DEFAULT 'PLANNED',
        dueDate TIMESTAMP,
        tags TEXT[] DEFAULT '{}',
        color TEXT,
        userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW(),
        completedAt TIMESTAMP
      );
      
      CREATE TABLE subtasks (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        taskId TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE focus_sessions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        duration INTEGER NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        taskId TEXT REFERENCES tasks(id) ON DELETE SET NULL,
        userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        startedAt TIMESTAMP DEFAULT NOW(),
        createdAt TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE daily_reports (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        tasksCreated INTEGER DEFAULT 0,
        tasksCompleted INTEGER DEFAULT 0,
        focusMinutes INTEGER DEFAULT 0,
        createdAt TIMESTAMP DEFAULT NOW(),
        UNIQUE(userId, date)
      );
      
      CREATE INDEX idx_tus ON tasks(userId, status);
      CREATE INDEX idx_tud ON tasks(userId, dueDate);
      CREATE INDEX idx_tup ON tasks(userId, priority);
      CREATE INDEX idx_fsu ON focus_sessions(userId, createdAt);
      CREATE INDEX idx_dru ON daily_reports(userId, date);
    `);

    initialized = true;
    console.log("[DB INIT] ALL DONE");
  } catch (error) {
    console.error("[DB INIT] Error:", error);
    initialized = true;
  }
}
