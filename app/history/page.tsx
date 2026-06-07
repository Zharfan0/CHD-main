"use client";
// app/history/page.tsx
import { useEffect, useState } from "react";
import { withAuth } from "@/components/withAuth";
import { TokenPayload } from "@/lib/auth";
import { userApi, HistoryItem } from "@/lib/api";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { History, Heart, AlertCircle, CheckCircle2, ArrowRight, LogOut, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function HistoryPage({ currentUser }: { currentUser: TokenPayload }) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    userApi.getHistory()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const modelLabel: Record<string, string> = {
    "mi": "Mutual Info",
    "random-forest": "Random Forest",
    "cnn-lstm": "CNN-LSTM Full",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-6 bg-white rounded-2xl shadow p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <Image src="/logoUMY.png" alt="Logo" width={40} height={40} className="object-contain" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">{currentUser.fullName || currentUser.username}</p>
              <p className="text-xs text-gray-500">@{currentUser.username}</p>
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Riwayat Prediksi</h1>
            <p className="text-gray-500 text-sm">Semua prediksi yang pernah Anda lakukan</p>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Memuat riwayat...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow border border-gray-100">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Belum ada riwayat prediksi</p>
            <p className="text-gray-400 text-sm mt-1">Lakukan prediksi pertama Anda di dashboard</p>
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button size="sm" className="mt-2">Ke Dashboard</Button>
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id}
                className="bg-white rounded-2xl shadow border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl mt-0.5 ${item.result === "Have heart disease" ? "bg-red-100" : "bg-green-100"}`}>
                    {item.result === "Have heart disease"
                      ? <AlertCircle className="w-5 h-5 text-red-600" />
                      : <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className={`text-sm font-medium ${item.result === "Have heart disease" ? "text-red-600" : "text-green-600"}`}>
                      {item.result === "Have heart disease" ? "Berisiko Tinggi" : "Risiko Rendah"}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {modelLabel[item.modelUsed] || item.modelUsed}
                      </span>
                      {item.confidence !== null && (
                        <span className="text-xs text-gray-400">Confidence: {item.confidence}%</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <Link href={`/history/${item.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-blue-600">
                    Detail <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default withAuth(HistoryPage);
