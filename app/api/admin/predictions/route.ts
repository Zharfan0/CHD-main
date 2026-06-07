// app/api/admin/predictions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req.headers.get("authorization"));
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    // Query params untuk filter
    const { searchParams } = new URL(req.url);
    const model = searchParams.get("model");    // misal "mi", "random-forest", "cnn-lstm"
    const result = searchParams.get("result");  // "Have heart disease" | "No heart disease"
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (model) where.modelUsed = model;
    if (result) where.result = result;

    const [predictions, total] = await Promise.all([
      prisma.prediction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          createdAt: true,
          modelUsed: true,
          result: true,
          confidence: true,
          name: true,
          userId: true,
          user: { select: { username: true } },
        },
      }),
      prisma.prediction.count({ where }),
    ]);

    return NextResponse.json({ predictions, total, page, limit });
  } catch {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
  }
}
