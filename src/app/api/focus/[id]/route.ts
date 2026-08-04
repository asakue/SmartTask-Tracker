import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

// PUT — обновление фокус-сессии
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
    const { completed, duration } = body;

    const session = await prisma.focusSession.findUnique({
      where: { id },
    });

    if (!session || session.userId !== auth.user.id) {
      return NextResponse.json({ error: "Сессия не найдена" }, { status: 404 });
    }

    const updated = await prisma.focusSession.update({
      where: { id },
      data: {
        completed: completed ?? session.completed,
        duration: duration ?? session.duration,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update focus session error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// DELETE — удаление фокус-сессии
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authMiddleware(req);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  const session = await prisma.focusSession.findUnique({
    where: { id },
  });

  if (!session || session.userId !== auth.user.id) {
    return NextResponse.json({ error: "Сессия не найдена" }, { status: 404 });
  }

  await prisma.focusSession.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Сессия удалена" });
}
