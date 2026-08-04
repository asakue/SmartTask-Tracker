import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

// GET — одна задача
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
    include: { subtasks: true },
  });

  if (!task || task.userId !== auth.user.id) {
    return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
  }

  return NextResponse.json(task);
}

// PUT — обновление задачи
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
    const {
      title,
      description,
      priority,
      status,
      dueDate,
      tags,
      color,
      subtasks,
    } = body;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task || task.userId !== auth.user.id) {
      return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) {
      updateData.status = status;
      updateData.completedAt = status === "COMPLETED" ? new Date() : task.completedAt;
    }
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) updateData.tags = tags;
    if (color !== undefined) updateData.color = color;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: { subtasks: true },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// DELETE — удаление задачи
export async function DELETE(
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
  });

  if (!task || task.userId !== auth.user.id) {
    return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
  }

  await prisma.task.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Задача удалена" });
}
