// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { username, fullName, password } = await req.json();

    // ── Validasi input ───────────────────────────────────────
    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json(
        { error: "Username minimal 3 karakter" },
        { status: 400 }
      );
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim().toLowerCase();

    // ── Cek username sudah ada ───────────────────────────────
    const existing = await prisma.user.findUnique({
      where: { username: trimmedUsername },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 409 }
      );
    }

    // ── Hash password ────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    // ── Simpan user (role default: user) ─────────────────────
    const user = await prisma.user.create({
      data: {
        username: trimmedUsername,
        fullName: fullName?.trim() || null,
        passwordHash,
      },
    });

    return NextResponse.json(
      { message: "Registrasi berhasil", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Register error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}