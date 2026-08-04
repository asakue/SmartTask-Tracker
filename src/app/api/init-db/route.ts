import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  
  if (secret !== process.env.INIT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    // Удаляем все таблицы
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS daily_reports CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS focus_sessions CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS subtasks CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS tasks CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS users CASCADE`);

    // Создаём таблицы заново с camelCase столбцами
    await prisma.$executeRawUnsafe(`
      CREATE TABLE users (
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
      CREATE TABLE tasks (
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
      CREATE TABLE subtasks (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        taskId TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW()
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE focus_sessions (
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
      CREATE TABLE daily_reports (
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

    await prisma.$executeRawUnsafe(`CREATE INDEX idx_tasks_user_status ON tasks(userId, status)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX idx_tasks_user_dueDate ON tasks(userId, dueDate)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX idx_tasks_user_priority ON tasks(userId, priority)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX idx_focus_sessions_user ON focus_sessions(userId, createdAt)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX idx_daily_reports_user ON daily_reports(userId, date)`);

    console.log("[DB INIT] All tables recreated successfully");

    return NextResponse.json({ 
      success: true, 
      message: "Database initialized successfully. All tables recreated with correct column names." 
    });
  } catch (error) {
    console.error("[DB INIT] Error:", error);
    return NextResponse.json({ 
      error: "Failed to initialize database",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
