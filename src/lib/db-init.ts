import { prisma } from "@/lib/prisma";

// Флаг для предотвращения многократного создания таблиц в одной сессии
let initialized = false;

export async function ensureDatabaseInitialized() {
  if (initialized) return;
  
  try {
    // Создаём таблицы один раз
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'USER',
        avatar TEXT,
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW()
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
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
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS subtasks (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        taskId TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW()
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS focus_sessions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        duration INTEGER NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        taskId TEXT REFERENCES tasks(id) ON DELETE SET NULL,
        userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        startedAt TIMESTAMP DEFAULT NOW(),
        createdAt TIMESTAMP DEFAULT NOW()
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS daily_reports (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        tasksCreated INTEGER DEFAULT 0,
        tasksCompleted INTEGER DEFAULT 0,
        focusMinutes INTEGER DEFAULT 0,
        createdAt TIMESTAMP DEFAULT NOW(),
        UNIQUE(userId, date)
      )
    `);

    // Создаём индексы
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(userId, status)
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_tasks_user_dueDate ON tasks(userId, dueDate)
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_tasks_user_priority ON tasks(userId, priority)
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_tasks_user_createdAt ON tasks(userId, createdAt)
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_focus_sessions_user ON focus_sessions(userId, createdAt)
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_focus_sessions_task ON focus_sessions(taskId)
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_daily_reports_user ON daily_reports(userId, date)
    `);

    initialized = true;
    console.log("[DB INIT] Tables created successfully");
  } catch (error) {
    console.error("[DB INIT] Error creating tables:", error);
    // Если таблицы уже существуют, просто продолжаем работу
    initialized = true;
  }
}
