import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

// GET — список всех задач пользователя
export async function GET(req: NextRequest) {
  const auth = await authMiddleware(req);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const where: Record<string, unknown> = { userId: auth.user.id };

  if (status && status !== "all") {
    where.status = status;
  }
  if (priority && priority !== "all") {
    where.priority = priority;
  }
  if (tag) {
    where.tags = { has: tag };
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      subtasks: true,
    },
    orderBy: { [sortBy]: order },
  });

  return NextResponse.json(tasks);
}

// POST — создание новой задачи
export async function POST(req: NextRequest) {
  const auth = await authMiddleware(req);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const {
      title,
      description = "",
      priority = "MEDIUM",
      status = "PLANNED",
      dueDate,
      tags = [],
      color,
      subtasks,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Название задачи обязательно" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags,
        color,
        userId: auth.user.id,
        subtasks: subtasks
          ? {
              create: subtasks.map((st: { title: string; completed?: boolean }) => ({
                title: st.title,
                completed: st.completed || false,
              })),
            }
          : undefined,
      },
      include: {
        subtasks: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
