"use client";
// app/history/[id]/page.tsx
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { withAuth } from "@/components/withAuth";
import { TokenPayload } from "@/lib/auth";
import { userApi, HistoryDetail } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Label tampilan untuk setiap field fitur
const FIELD_LABELS: Record<string, string> = {
  physicalactivities: "Aktivitas Fisik",
  hadasthma: "Pernah Asma",
  removedteeth: "Gigi Dicabut",
  alcoholdrinkers: "Konsumsi Alkohol",
  fluvaxlast12: "Vaksin Flu 12 Bln",
  chestscan: "CT Scan Dada",
  sex: "Jenis Kelamin",
  generalhealth: "Kesehatan Umum",
  raceethnicitycategory: "Ras/Etnis",
  lastcheckuptime: "Terakhir Check-up",
  physicalhealthdays: "Hari Sakit Fisik",
  mentalhealthdays: "Hari Sakit Mental",
  sleephours: "Jam Tidur",
  haddiabetes: "Pernah Diabetes",
  agecategory: "Kategori Usia",
  bmi: "BMI",
  heightinmeters: "Tinggi (m)",
  hadstroke: "Pernah Stroke",
  hadcopd: "Pernah COPD",
  hadarthritis: "Pernah Artritis",
  hadkidneydisease: "Pernah Peny. Ginjal",
  hadskincancer: "Pernah Kanker Kulit",
  haddepressivedisorder: "Gangguan Depresi",
  deaforhardofhearing: "Gangguan Pendengaran",
  blindorvisiondifficulty: "Gangguan Penglihatan",
  difficultyconcentrating: "Sulit Konsentrasi",
  difficultywalking: "Sulit Berjalan",
  difficultydressingbathing: "Sulit Berpakaian",
  difficultyerrands: "Sulit Urusan Sendiri",
  smokerstatus: "Status Merokok",
  ecigaretteusage: "Penggunaan E-Rokok",
  hivtesting: "Pernah Tes HIV",
  pneumovaxever: "Vaksin Pneumonia",
  tetanuslast10tdap: "Vaksin Tetanus",
  highrisklastyear: "Risiko Tinggi Tahun Lalu",
  covidpos: "Pernah COVID Positif",
};

function HistoryDetailPage({ currentUser }: { currentUser: TokenPayload }) {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<HistoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    userApi.getHistoryDetail(id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function downloadCSV() {
    if (!data) return;
    const rows = [
      ["Field", "Nilai"],
      ["Nama", data.name],
      ["Model", data.modelUsed],
      ["Hasil", data.result],
      ["Confidence", data.confidence !== null ? `${data.confidence}%` : "N/A"],
      ["Tanggal", new Date(data.createdAt).toLocaleString("id-ID")],
      ["---", "---"],
      ...Object.entries(FIELD_LABELS).map(([key, label]) => [
        label,
        (data as unknown as Record<string, unknown>)[key] ?? "-",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `prediksi-${id}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/history"><Button variant="outline">Kembali</Button></Link>
      </div>
    </div>
  );

  if (!data) return null;

  const isPositive = data.result === "Have heart disease";

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Link href="/history" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Riwayat
        </Link>

        {/* Hasil utama */}
        <div className={`rounded-2xl shadow-xl overflow-hidden mb-6 ${isPositive
          ? "bg-gradient-to-r from-red-50 to-orange-50 border-l-8 border-red-500"
          : "bg-gradient-to-r from-green-50 to-emerald-50 border-l-8 border-green-500"}`}>
          <div className="p-6 flex items-start gap-4">
            <div className={`p-3 rounded-full ${isPositive ? "bg-red-100" : "bg-green-100"}`}>
              {isPositive
                ? <AlertCircle className="w-8 h-8 text-red-600" />
                : <CheckCircle2 className="w-8 h-8 text-green-600" />}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Hasil Prediksi</h2>
              <p className={`text-2xl font-bold ${isPositive ? "text-red-600" : "text-green-600"}`}>
                {isPositive ? "Berisiko Tinggi" : "Risiko Rendah"}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                <span>Nama: <strong>{data.name}</strong></span>
                <span>Model: <strong>{data.modelUsed}</strong></span>
                {data.confidence !== null && <span>Confidence: <strong>{data.confidence}%</strong></span>}
                <span>Tanggal: <strong>{new Date(data.createdAt).toLocaleString("id-ID")}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail fitur */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
            <h3 className="text-white font-semibold">Detail Data Input</h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(FIELD_LABELS).map(([key, label]) => {
              const val = (data as Record<string, unknown>)[key];
              if (!val) return null;
              return (
                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-800">{String(val)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Download */}
        <Button onClick={downloadCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" /> Download CSV
        </Button>
      </div>
    </main>
  );
}

export default withAuth(HistoryDetailPage);