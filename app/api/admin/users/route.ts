// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req.headers.get("authorization"));
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
        _count: { select: { predictions: true } },
      },
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
  }
}
