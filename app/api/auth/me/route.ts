// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req.headers.get("authorization"));

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, fullName: true, role: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
  }
}
