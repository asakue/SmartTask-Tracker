import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await authMiddleware(req);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Task stats
  const totalTasks = await prisma.task.count({
    where: { userId: auth.user.id },
  });

  const plannedTasks = await prisma.task.count({
    where: { userId: auth.user.id, status: "PLANNED" },
  });

  const inProgressTasks = await prisma.task.count({
    where: { userId: auth.user.id, status: "IN_PROGRESS" },
  });

  const completedTasks = await prisma.task.count({
    where: { userId: auth.user.id, status: "COMPLETED" },
  });

  const byPriority = await prisma.task.groupBy({
    by: ["priority"],
    where: { userId: auth.user.id },
    _count: true,
  });

  const allTasks = await prisma.task.findMany({
    where: { userId: auth.user.id },
  });

  // By category
  const byCategory: Record<string, number> = {};
  allTasks.forEach((task: any) => {
    const tags = task.tags as string[];
    tags.forEach((tag: string) => {
      byCategory[tag] = (byCategory[tag] || 0) + 1;
    });
  });

  // Weekly productivity
  const daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const dailyProductivity = await prisma.task.findMany({
    where: {
      userId: auth.user.id,
      status: "COMPLETED",
      completedAt: { not: null },
    },
    select: { completedAt: true },
  });

  const dayCounts = new Array(7).fill(0);
  dailyProductivity.forEach((task) => {
    if (task.completedAt) {
      const dayIndex = (task.completedAt.getDay() + 6) % 7;
      dayCounts[dayIndex]++;
    }
  });

  const productivityData = daysOfWeek.map((day, index) => ({
    day,
    completed: dayCounts[index],
  }));

  // Weekly and monthly stats
  const weekCreated = await prisma.task.count({
    where: { userId: auth.user.id, createdAt: { gte: startOfWeek } },
  });

  const monthCreated = await prisma.task.count({
    where: { userId: auth.user.id, createdAt: { gte: startOfMonth } },
  });

  const yearCreated = await prisma.task.count({
    where: { userId: auth.user.id, createdAt: { gte: startOfYear } },
  });

  // Streak calculation
  const completedByDate: Record<string, number> = {};
  dailyProductivity.forEach((task) => {
    if (task.completedAt) {
      const dateStr = task.completedAt.toISOString().split("T")[0];
      completedByDate[dateStr] = (completedByDate[dateStr] || 0) + 1;
    }
  });

  let streak = 0;
  const checkDate = new Date(now);
  const todayStr = now.toISOString().split("T")[0];
  if (!completedByDate[todayStr]) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (completedByDate[dateStr]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Daily reports — last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split("T")[0];
  });

  const dailyReports = await Promise.all(
    last30Days.map(async (date) => {
      const dateStart = new Date(date);
      const dateEnd = new Date(date + "T23:59:59");

      const tasksCreated = await prisma.task.count({
        where: {
          userId: auth.user.id,
          createdAt: { gte: dateStart, lte: dateEnd },
        },
      });

      const tasksCompleted = await prisma.task.count({
        where: {
          userId: auth.user.id,
          status: "COMPLETED",
          completedAt: { gte: dateStart, lte: dateEnd },
        },
      });

      const sessions = await prisma.focusSession.findMany({
        where: {
          userId: auth.user.id,
          createdAt: { gte: dateStart, lte: dateEnd },
        },
        select: { duration: true },
      });
      const focusMinutes = sessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

      return {
        date,
        tasksCreated,
        tasksCompleted,
        focusMinutes,
      };
    })
  );

  // Monthly reports — last 12 months
  const monthlyReports = await Promise.all(
    Array.from({ length: 12 }, async (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      const monthName = date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

      const tasksCreated = await prisma.task.count({
        where: { userId: auth.user.id, createdAt: { gte: monthStart, lte: monthEnd } },
      });
      const tasksCompleted = await prisma.task.count({
        where: { userId: auth.user.id, status: "COMPLETED", completedAt: { gte: monthStart, lte: monthEnd } },
      });
      const sessions = await prisma.focusSession.findMany({
        where: { userId: auth.user.id, createdAt: { gte: monthStart, lte: monthEnd } },
        select: { duration: true },
      });
      const focusMinutes = sessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

      return { month: monthName, tasksCreated, tasksCompleted, focusMinutes };
    })
  );

  // Completion rate by priority
  const completionByPriority = {
    HIGH: { total: 0, completed: 0 },
    MEDIUM: { total: 0, completed: 0 },
    LOW: { total: 0, completed: 0 },
  };

  allTasks.forEach((task) => {
    const key = task.priority as keyof typeof completionByPriority;
    if (completionByPriority[key]) {
      completionByPriority[key].total++;
      if (task.status === "COMPLETED") {
        completionByPriority[key].completed++;
      }
    }
  });

  return NextResponse.json({
    stats: {
      total: totalTasks,
      planned: plannedTasks,
      inProgress: inProgressTasks,
      completed: completedTasks,
      byPriority: {
        HIGH: byPriority.find((p) => p.priority === "HIGH")?._count || 0,
        MEDIUM: byPriority.find((p) => p.priority === "MEDIUM")?._count || 0,
        LOW: byPriority.find((p) => p.priority === "LOW")?._count || 0,
      },
      byCategory,
    },
    productivity: productivityData,
    weekly: {
      weekCompleted: dailyProductivity.filter(
        (t) => t.completedAt && t.completedAt >= startOfWeek
      ).length,
      weekCreated,
      monthCompleted: dailyProductivity.filter(
        (t) => t.completedAt && t.completedAt >= startOfMonth
      ).length,
      monthCreated,
      yearCreated,
      streak,
    },
    dailyReports,
    monthlyReports,
    completionByPriority,
  });
}
