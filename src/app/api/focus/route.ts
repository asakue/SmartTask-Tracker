import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

// GET — список фокус-сессий
export async function GET(req: NextRequest) {
  const auth = await authMiddleware(req);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  const where: Record<string, unknown> = { userId: auth.user.id };
  if (taskId) {
    where.taskId = taskId;
  }

  const sessions = await prisma.focusSession.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      task: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json(sessions);
}

// POST — создание фокус-сессии
export async function POST(req: NextRequest) {
  const auth = await authMiddleware(req);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { duration = 1500, taskId, completed = false } = body;

    const session = await prisma.focusSession.create({
      data: {
        duration: duration || 1500,
        completed,
        taskId: taskId || null,
        userId: auth.user.id,
      },
      include: {
        task: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Create focus session error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
