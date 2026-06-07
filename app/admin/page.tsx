"use client";
// app/admin/page.tsx
import { useEffect, useState } from "react";
import { withAuth } from "@/components/withAuth";
import { TokenPayload, logout } from "@/lib/auth";
import { adminApi, AdminStats, AdminUser, AdminPrediction } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Users, Activity, BarChart2, LogOut, Home,
  AlertCircle, CheckCircle2, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function AdminPage({ currentUser }: { currentUser: TokenPayload }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [predictions, setPredictions] = useState<AdminPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "predictions">("stats");

  // Filter state
  const [filterModel, setFilterModel] = useState("");
  const [filterResult, setFilterResult] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [s, u, p] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getPredictions(
          [filterModel ? `model=${filterModel}` : "", filterResult ? `result=${filterResult}` : ""]
            .filter(Boolean).join("&")
        ),
      ]);
      setStats(s); setUsers(u);
      // API mengembalikan { predictions: [...], total, page, limit }
      const predList = (p as unknown as { predictions: AdminPrediction[] }).predictions ?? [];
      setPredictions(predList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [filterModel, filterResult]);

  const modelLabel: Record<string, string> = {
    "mi": "Mutual Info", "random-forest": "Random Forest", "cnn-lstm": "CNN-LSTM",
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/logoUMY.png" alt="Logo" width={36} height={36} className="object-contain" />
            <div>
              <p className="font-bold text-gray-800 text-sm">MyHeartD — Admin Panel</p>
              <p className="text-xs text-gray-400">@{currentUser.username}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-1 text-xs"><Home className="w-3 h-3" /> Dashboard</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-1 text-xs text-red-500">
              <LogOut className="w-3 h-3" /> Keluar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "stats", label: "Statistik", icon: BarChart2 },
            { key: "users", label: `Pengguna (${users.length})`, icon: Users },
            { key: "predictions", label: `Prediksi (${stats?.totalPredictions ?? "..."})`, icon: Activity },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
          <button onClick={loadData}
            className="ml-auto flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-gray-500 bg-white border border-gray-200 hover:bg-gray-50">
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        {/* ── TAB STATISTIK ─────────────────────────────────── */}
        {activeTab === "stats" && stats && (
          <div className="space-y-6">
            {/* Kartu ringkasan */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Pengguna */}
              <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl w-fit mb-3">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">Total Pengguna</p>
                <p className="text-xs text-gray-400 mt-0.5">Tidak termasuk guest</p>
              </div>

              {/* Total Prediksi */}
              <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl w-fit mb-3">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalPredictions}</p>
                <p className="text-xs text-gray-500 mt-1">Total Prediksi</p>
                <p className="text-xs text-gray-400 mt-0.5">Termasuk prediksi guest</p>
              </div>

              {/* Positif CHD — angka riil + persentase */}
              <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
                <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl w-fit mb-3">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.positiveCount}
                  <span className="text-sm font-normal text-gray-400"> / {stats.totalPredictions}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Prediksi Positif CHD</p>
                <p className="text-xs text-red-400 font-medium mt-0.5">{stats.positiveRate}% dari total</p>
              </div>

              {/* Model Aktif */}
              <div className="bg-white rounded-2xl shadow border border-gray-100 p-5">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl w-fit mb-3">
                  <BarChart2 className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stats.byModel.length}</p>
                <p className="text-xs text-gray-500 mt-1">Model Aktif</p>
                <p className="text-xs text-gray-400 mt-0.5">Dari {stats.byModel.map(m => modelLabel[m.model] || m.model).join(", ") || "-"}</p>
              </div>
            </div>

            {/* Prediksi per model */}
            <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Prediksi per Model</h3>
              <div className="space-y-3">
                {stats.byModel.map((m) => (
                  <div key={m.model}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{modelLabel[m.model] || m.model}</span>
                      <span className="font-medium">{m.count} prediksi</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                        style={{ width: `${stats.totalPredictions > 0 ? (m.count / stats.totalPredictions) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB USERS ─────────────────────────────────────── */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["ID", "Username", "Nama Lengkap", "Role", "Total Prediksi", "Bergabung"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">{u.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">@{u.username}</td>
                      <td className="px-4 py-3 text-gray-600">{u.fullName || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u._count.predictions}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(u.createdAt).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB PREDICTIONS ───────────────────────────────── */}
        {activeTab === "predictions" && (
          <div>
            {/* Filter */}
            <div className="flex gap-3 mb-4">
              <select value={filterModel} onChange={(e) => setFilterModel(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Semua Model</option>
                <option value="mi">Mutual Info</option>
                <option value="random-forest">Random Forest</option>
                <option value="cnn-lstm">CNN-LSTM</option>
              </select>
              <select value={filterResult} onChange={(e) => setFilterResult(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Semua Hasil</option>
                <option value="Have heart disease">Berisiko Tinggi</option>
                <option value="No heart disease">Risiko Rendah</option>
              </select>
            </div>

            <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Nama", "User", "Model", "Hasil", "Confidence", "Tanggal"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {predictions.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {p.user ? `@${p.user.username}` : <span className="text-gray-300">guest</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{modelLabel[p.modelUsed] || p.modelUsed}</td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-xs font-medium ${p.result === "Have heart disease" ? "text-red-600" : "text-green-600"}`}>
                            {p.result === "Have heart disease"
                              ? <AlertCircle className="w-3 h-3" />
                              : <CheckCircle2 className="w-3 h-3" />}
                            {p.result === "Have heart disease" ? "Berisiko" : "Aman"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{p.confidence !== null ? `${p.confidence}%` : "-"}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(p.createdAt).toLocaleDateString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default withAuth(AdminPage, { requiredRole: "admin" });
