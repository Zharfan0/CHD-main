// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // ── Cari user ────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    // ── Verifikasi password ──────────────────────────────────
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    // ── Buat JWT token ───────────────────────────────────────
    const token = signToken({
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    });

    return NextResponse.json({
      access_token: token,
      token_type: "bearer",
      role: user.role,
      username: user.username,
      fullName: user.fullName,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}