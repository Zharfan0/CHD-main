// lib/api.ts
// Wrapper untuk HTTP request yang otomatis menyertakan token Authorization.

import { getToken, logout } from "./auth";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://chd-backend-production.up.railway.app";

// ── Generic fetch wrapper (untuk Next.js API routes) ──────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });

  // Token expired atau tidak valid → logout otomatis
  if (res.status === 401) {
    logout();
    throw new Error("Sesi habis. Silakan login kembali.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ── GET ────────────────────────────────────────────────────────
export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "GET" });
}

// ── POST ───────────────────────────────────────────────────────
export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Panggil FastAPI backend (inference, tanpa token) ──────────
export async function callPredict(
  model: "full" | "mi" | "rf",
  data: Record<string, number>
): Promise<{ prediction: number; probability: number; model: string }> {
  const endpointMap = {
    full: "/predict/full",
    mi: "/predict/mi",
    rf: "/predict/rf",
  };

  const res = await fetch(`${BACKEND_URL}${endpointMap[model]}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(`FastAPI error: HTTP ${res.status}`);
  return res.json();
}

// ── Auth API calls ─────────────────────────────────────────────
export const authApi = {
  register: (body: { username: string; fullName?: string; password: string }) =>
    apiPost<{ message: string; userId: number }>("/api/auth/register", body),

  login: (body: { username: string; password: string }) =>
    apiPost<{
      access_token: string;
      token_type: string;
      role: string;
      username: string;
    }>("/api/auth/login", body),

  me: () =>
    apiGet<{ id: number; username: string; fullName: string | null; role: string }>(
      "/api/auth/me"
    ),
};

// ── User API calls ─────────────────────────────────────────────
export const userApi = {
  getHistory: () => apiGet<HistoryItem[]>("/api/user/history"),
  getHistoryDetail: (id: string) =>
    apiGet<HistoryDetail>(`/api/user/history/${id}`),
};

// ── Admin API calls ────────────────────────────────────────────
export const adminApi = {
  getStats: () => apiGet<AdminStats>("/api/admin/stats"),
  getUsers: () => apiGet<AdminUser[]>("/api/admin/users"),
  getPredictions: (params?: string) =>
    apiGet<{ predictions: AdminPrediction[]; total: number; page: number; limit: number }>(
      `/api/admin/predictions${params ? `?${params}` : ""}`
    ),
};

// ── Types ──────────────────────────────────────────────────────
export interface HistoryItem {
  id: string;
  createdAt: string;
  modelUsed: string;
  result: string;
  confidence: number | null;
  name: string;
}

export interface HistoryDetail extends HistoryItem {
  physicalactivities: string | null;
  hadasthma: string | null;
  removedteeth: string | null;
  alcoholdrinkers: string | null;
  fluvaxlast12: string | null;
  chestscan: string | null;
  sex: string | null;
  generalhealth: string | null;
  raceethnicitycategory: string | null;
  lastcheckuptime: string | null;
  physicalhealthdays: string | null;
  mentalhealthdays: string | null;
  sleephours: string | null;
  haddiabetes: string | null;
  agecategory: string | null;
  bmi: string | null;
  heightinmeters: string | null;
  hadstroke: string | null;
  hadcopd: string | null;
  hadarthritis: string | null;
  hadkidneydisease: string | null;
  hadskincancer: string | null;
  haddepressivedisorder: string | null;
  deaforhardofhearing: string | null;
  blindorvisiondifficulty: string | null;
  difficultyconcentrating: string | null;
  difficultywalking: string | null;
  difficultydressingbathing: string | null;
  difficultyerrands: string | null;
  smokerstatus: string | null;
  ecigaretteusage: string | null;
  hivtesting: string | null;
  pneumovaxever: string | null;
  tetanuslast10tdap: string | null;
  highrisklastyear: string | null;
  covidpos: string | null;
}

export interface AdminStats {
  totalUsers: number;
  totalPredictions: number;
  positiveCount: number;   // angka riil prediksi positif CHD
  byModel: { model: string; count: number }[];
  positiveRate: number;
}

export interface AdminUser {
  id: number;
  username: string;
  fullName: string | null;
  role: string;
  createdAt: string;
  _count: { predictions: number };
}

export interface AdminPrediction {
  id: string;
  createdAt: string;
  modelUsed: string;
  result: string;
  confidence: number | null;
  name: string;
  user: { username: string } | null;
}