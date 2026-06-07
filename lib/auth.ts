// lib/auth.ts
// Utilitas autentikasi sisi CLIENT (browser).
// Semua fungsi ini hanya berjalan di browser (localStorage).

export interface TokenPayload {
  userId: number;
  username: string;
  fullName: string | null;
  role: "user" | "admin";
  exp: number;
}

const TOKEN_KEY = "myheart_token";

// ── Simpan token ke localStorage ──────────────────────────────
export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

// ── Ambil token dari localStorage ─────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

// ── Hapus token (logout) ───────────────────────────────────────
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// ── Decode payload JWT tanpa verifikasi (hanya baca claim) ────
// Verifikasi asli tetap dilakukan di API route server-side.
export function decodeToken(token: string): TokenPayload | null {
  try {
    const base64Payload = token.split(".")[1];
    const decoded = JSON.parse(atob(base64Payload));
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}

// ── Ambil payload user yang sedang login ──────────────────────
export function getCurrentUser(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload) return null;

  // Cek apakah token sudah expire
  if (Date.now() / 1000 > payload.exp) {
    removeToken();
    return null;
  }

  return payload;
}

// ── Cek apakah user sudah login ───────────────────────────────
export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

// ── Cek apakah user adalah admin ──────────────────────────────
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === "admin";
}

// ── Logout: hapus token & redirect ke login ───────────────────
export function logout(): void {
  removeToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}