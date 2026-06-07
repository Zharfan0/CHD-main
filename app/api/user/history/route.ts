// app/api/user/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req.headers.get("authorization"));

    const predictions = await prisma.prediction.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        modelUsed: true,
        result: true,
        confidence: true,
        name: true,
      },
    });

    return NextResponse.json(predictions);
  } catch {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
  }
}
