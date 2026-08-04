import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

// GET — подзадачи задачи
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authMiddleware(req);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!task || task.userId !== auth.user.id) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  const subtasks = await prisma.subtask.findMany({
    where: { taskId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(subtasks);
}

// POST — создать подзадачу
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authMiddleware(req);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Название обязательно" },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!task || task.userId !== auth.user.id) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const subtask = await prisma.subtask.create({
      data: { title, taskId: id },
    });

    return NextResponse.json(subtask, { status: 201 });
  } catch (error) {
    console.error("Create subtask error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка" },
      { status: 500 }
    );
  }
}
