import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Флаг для предотвращения многократного создания таблиц
let tablesCreated = false;

async function ensureTables() {
  if (tablesCreated) return;
  
  const { prisma } = await import("@/lib/prisma");
  
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
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
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
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS subtasks (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS focus_sessions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        duration INTEGER NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS daily_reports (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        tasks_created INTEGER DEFAULT 0,
        tasks_completed INTEGER DEFAULT 0,
        focus_minutes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, date)
      )
    `);

    tablesCreated = true;
    console.log("[INIT] Tables created successfully");
  } catch (error) {
    console.error("[INIT] Error creating tables:", error);
    // Если таблицы уже существуют, просто продолжаем работу
    tablesCreated = true;
  }
}

export async function middleware(request: NextRequest) {
  // Запускаем создание таблиц для API маршрутов
  if (request.nextUrl.pathname.startsWith("/api/")) {
    await ensureTables();
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
