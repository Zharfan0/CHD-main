// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req.headers.get("authorization"));
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const [totalUsers, totalPredictions, allPredictions] = await Promise.all([
      prisma.user.count(),
      prisma.prediction.count(),
      prisma.prediction.findMany({
        select: { modelUsed: true, result: true },
      }),
    ]);

    // Hitung per model
    const modelCount: Record<string, number> = {};
    let positiveCount = 0;
    for (const p of allPredictions) {
      modelCount[p.modelUsed] = (modelCount[p.modelUsed] || 0) + 1;
      if (p.result === "Have heart disease") positiveCount++;
    }

    const byModel = Object.entries(modelCount).map(([model, count]) => ({
      model,
      count,
    }));

    const positiveRate =
      totalPredictions > 0
        ? Math.round((positiveCount / totalPredictions) * 100)
        : 0;

    return NextResponse.json({
      totalUsers,
      totalPredictions,
      positiveCount,   // angka riil pembilang
      byModel,
      positiveRate,
    });
  } catch {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
  }
}