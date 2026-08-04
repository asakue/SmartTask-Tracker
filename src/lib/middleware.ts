import { NextRequest } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function authMiddleware(req: NextRequest) {
  const token = extractTokenFromHeader(req.headers.get("Authorization") ?? undefined);

  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }

  const user = verifyToken(token);
  if (!user) {
    return { error: "Invalid token", status: 401 };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, role: true, avatar: true },
  });

  if (!dbUser) {
    return { error: "User not found", status: 404 };
  }

  return { user: dbUser };
}
