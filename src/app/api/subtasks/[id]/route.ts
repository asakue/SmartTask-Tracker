import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

// PUT — обновить подзадачу (toggle completed)
export async function PUT(
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
    const { completed, title } = body;

    const subtask = await prisma.subtask.findUnique({
      where: { id },
      include: { task: { select: { userId: true } } },
    });

    if (!subtask || subtask.task.userId !== auth.user.id) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const updated = await prisma.subtask.update({
      where: { id },
      data: {
        completed: completed ?? !subtask.completed,
        ...(title !== undefined && { title }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update subtask error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка" },
      { status: 500 }
    );
  }
}

// DELETE — удалить подзадачу
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authMiddleware(req);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  const subtask = await prisma.subtask.findUnique({
    where: { id },
    include: { task: { select: { userId: true } } },
  });

  if (!subtask || subtask.task.userId !== auth.user.id) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }

  await prisma.subtask.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Подзадача удалена" });
}
