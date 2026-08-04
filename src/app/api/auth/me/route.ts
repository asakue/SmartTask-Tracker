import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  const auth = await authMiddleware(req);

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  return NextResponse.json({ user: auth.user });
}
