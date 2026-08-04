import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Проверяем, существуют ли таблицы
    const tablesExist = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )
    `;

    if (tablesExist[0].exists) {
      return NextResponse.json({
        success: true,
        message: "Таблицы уже существуют",
      });
    }

    // Создаём таблицы вручную
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" TEXT UNIQUE NOT NULL,
        "name" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT DEFAULT 'USER',
        "avatar" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "tasks" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" TEXT NOT NULL,
        "description" TEXT DEFAULT '',
        "priority" TEXT DEFAULT 'MEDIUM',
        "status" TEXT DEFAULT 'PLANNED',
        "due_date" TIMESTAMP,
        "tags" TEXT[] DEFAULT '{}',
        "color" TEXT,
        "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "completed_at" TIMESTAMP
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "subtasks" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" TEXT NOT NULL,
        "completed" BOOLEAN DEFAULT FALSE,
        "task_id" TEXT NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "focus_sessions" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "duration" INTEGER NOT NULL,
        "completed" BOOLEAN DEFAULT FALSE,
        "task_id" TEXT REFERENCES "tasks"("id") ON DELETE SET NULL,
        "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "started_at" TIMESTAMP DEFAULT NOW(),
        "created_at" TIMESTAMP DEFAULT NOW()
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "daily_reports" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "date" DATE NOT NULL,
        "tasks_created" INTEGER DEFAULT 0,
        "tasks_completed" INTEGER DEFAULT 0,
        "focus_minutes" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT NOW(),
        UNIQUE("user_id", "date")
      )
    `);

    // Создаём индексы
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_tasks_user_status" ON "tasks"("user_id", "status")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_tasks_user_dueDate" ON "tasks"("user_id", "due_date")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_tasks_user_priority" ON "tasks"("user_id", "priority")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_tasks_user_createdAt" ON "tasks"("user_id", "created_at")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_focus_sessions_user_createdAt" ON "focus_sessions"("user_id", "created_at")
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_daily_reports_user_date" ON "daily_reports"("user_id", "date")
    `);

    return NextResponse.json({
      success: true,
      message: "База данных успешно создана!",
      tables: ["users", "tasks", "subtasks", "focus_sessions", "daily_reports"],
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Ошибка при создании базы данных", details: (error as Error).message },
      { status: 500 }
    );
  }
}
