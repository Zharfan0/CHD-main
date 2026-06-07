// app/api/user/history/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/jwt";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = requireAuth(req.headers.get("authorization"));

    const prediction = await prisma.prediction.findUnique({
      where: { id: params.id },
    });

    if (!prediction) {
      return NextResponse.json({ error: "Prediksi tidak ditemukan" }, { status: 404 });
    }

    // User hanya bisa lihat miliknya sendiri; admin bisa lihat semua
    if (prediction.userId !== payload.userId && payload.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    return NextResponse.json(prediction);
  } catch {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
  }
}
