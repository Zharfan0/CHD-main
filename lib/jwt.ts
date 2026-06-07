// lib/jwt.ts
// Helper JWT untuk sisi SERVER (API routes).
// Jangan import ini di komponen client.

import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET_KEY!;
const ALGORITHM = "HS256";
const EXPIRE_DAYS = 7;

export interface JwtPayload {
  userId: number;
  username: string;
  fullName: string | null;
  role: "user" | "admin";
}

// ── Sign token ────────────────────────────────────────────────
export function signToken(payload: JwtPayload): string {
  if (!SECRET) throw new Error("JWT_SECRET_KEY tidak diset di environment");
  return jwt.sign(payload, SECRET, {
    algorithm: ALGORITHM,
    expiresIn: `${EXPIRE_DAYS}d`,
  });
}

// ── Verify & decode token ─────────────────────────────────────
export function verifyToken(token: string): JwtPayload {
  if (!SECRET) throw new Error("JWT_SECRET_KEY tidak diset di environment");
  return jwt.verify(token, SECRET, { algorithms: [ALGORITHM] }) as JwtPayload;
}

// ── Ambil token dari header Authorization ─────────────────────
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

// ── Verifikasi request dan kembalikan payload ──────────────────
// Throw error jika token tidak valid atau tidak ada.
export function requireAuth(authHeader: string | null): JwtPayload {
  const token = extractToken(authHeader);
  if (!token) throw new Error("Token tidak ditemukan");
  return verifyToken(token);
}

// ── Verifikasi opsional (untuk guest mode) ─────────────────────
// Return null jika tidak ada token, throw jika token invalid.
export function optionalAuth(authHeader: string | null): JwtPayload | null {
  const token = extractToken(authHeader);
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null; // token ada tapi invalid → anggap guest
  }
}