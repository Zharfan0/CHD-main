"use client";
// app/dashboard/page.tsx
// Halaman prediksi untuk user yang sudah login.
// Sama seperti page.tsx (guest), tapi prediksi tersimpan dengan userId.

import { fieldMetadata } from "@/lib/fieldMetadata";
import { createSchema } from "@/lib/createSchema";
import { featureMap } from "@/lib/featureMap";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Form, FormControl, FormDescription, FormField,
  FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Activity, SquaresIntersect, Brain, Heart, Save, Network,
  Stethoscope, AlertCircle, CheckCircle2, Loader2, Waypoints, User,
  History, LogOut, Shield,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { withAuth } from "@/components/withAuth";
import { TokenPayload, logout, getToken } from "@/lib/auth";

function DashboardPage({ currentUser }: { currentUser: TokenPayload }) {
  const [selectedModel, setSelectedModel] = useState<"cnn-lstm" | "random-forest" | "mi">("mi");
  const selectedFields = featureMap[selectedModel];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [predictionResult, setPredictionResult] = useState<string | null>(null);
  const [formSchema, setFormSchema] = useState(createSchema("mi"));

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: currentUser.fullName || currentUser.username,
      ...Object.fromEntries(featureMap["mi"].map((field) => [field, ""])),
    },
  });

  useEffect(() => {
    toast.success(`Model ${selectedModel.toUpperCase()} siap`);
  }, [selectedModel]);

  useEffect(() => {
    const schema = createSchema(selectedModel);
    setFormSchema(schema);
    form.reset({
      nama: currentUser.fullName || currentUser.username,
      ...Object.fromEntries(featureMap[selectedModel].map((f) => [f, ""])),
    });
  }, [selectedModel]);

  const handleDownload = () => {
    const allValues = form.getValues();
    const filledFields = selectedFields.map((key) => `${key}: ${allValues[key as keyof typeof allValues]}`);
    const content = [`Nama: ${allValues["nama"]}`, ...filledFields,
      `Hasil: ${predictionResult}`, `Confidence: ${confidence ?? "N/A"}`].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "hasil_prediksi.txt"; a.click();
    window.URL.revokeObjectURL(url);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const endpointMap = { "cnn-lstm": "/predict/full", "random-forest": "/predict/rf", "mi": "/predict/mi" };
    const v = values as Record<string, string>;
    const filteredData = selectedFields.reduce((acc, key) => {
      const value = v[key]; const num = parseFloat(value);
      acc[key] = isNaN(num) ? 0 : num; return acc;
    }, {} as Record<string, number>);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://chd-backend-production.up.railway.app"}${endpointMap[selectedModel]}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(filteredData) }
      );
      const resultJson = await res.json();
      if (resultJson.error) { toast.error("Error: " + resultJson.error); return; }

      setResult(resultJson);

      const token = getToken();
      const conf = calcConf(resultJson);
      const hasilPrediksiText = resultJson.prediction === 1 ? "Have heart disease" : "No heart disease";

      // Simpan ke Google Sheets (sama seperti page.tsx guest)
      try {
        await fetch("/api/save-to-sheets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedModel, hasilPrediksi: hasilPrediksiText, confidence: conf, ...values }),
        });
      } catch (e) {}

      // Simpan ke DB dengan token (userId akan terkait)
      try {
        await fetch("/api/save-to-prisma-db", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ selectedModel, hasilPrediksi: hasilPrediksiText, confidence: conf, ...values }),
        });
      } catch (e) {}

      toast.success(`Prediksi: ${hasilPrediksiText}`);
    } catch (error) {
      toast.error("Gagal melakukan prediksi");
    } finally {
      setIsSubmitting(false);
    }
  }

  function calcConf(resultJson: { prediction: number; probability: number }) {
    if (resultJson.probability === undefined) return null;
    return resultJson.prediction === 1
      ? Number((resultJson.probability * 100).toFixed(2))
      : Number(((1 - resultJson.probability) * 100).toFixed(2));
  }

  function setResult(resultJson: { prediction: number; probability: number }) {
    const conf = calcConf(resultJson);
    setConfidence(conf);
    setPredictionResult(resultJson.prediction === 1 ? "Have heart disease" : "No heart disease");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-red-200 to-pink-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8 md:px-6 lg:px-8">
        {/* Navbar user */}
        <div className="flex justify-between items-center mb-6 bg-white rounded-2xl shadow p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <Image src="/logoUMY.png" alt="Logo" width={40} height={40} className="object-contain" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                {currentUser.fullName || currentUser.username}
              </p>
              <p className="text-xs text-gray-500">@{currentUser.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentUser.role === "admin" && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <Shield className="w-3 h-3" /> Admin
                </Button>
              </Link>
            )}
            <Link href="/history">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <History className="w-3 h-3" /> Riwayat
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-1 text-xs text-red-500 hover:text-red-700">
              <LogOut className="w-3 h-3" /> Keluar
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Deteksi Dini Penyakit Jantung Koroner
          </h1>
          <p className="text-gray-600 text-sm md:text-base">Program Studi Teknologi Informasi</p>
          <Separator className="max-w-[300px] mx-auto my-6 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          <p className="text-gray-500 max-w-2xl mx-auto text-sm">
            Prediksi Anda akan disimpan ke riwayat akun. Anda dapat melihatnya di{" "}
            <Link href="/history" className="text-blue-600 hover:underline">halaman riwayat</Link>.
          </p>
        </div>

        {/* Model Selection */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Pilih Model Prediksi</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: "mi", label: "Mutual Info", desc: "10 fitur MI", icon: SquaresIntersect, color: "from-emerald-500 to-teal-500" },
                { value: "random-forest", label: "Random Forest", desc: "10 fitur RF", icon: Network, color: "from-orange-500 to-red-500" },
                { value: "cnn-lstm", label: "CNN-LSTM", desc: "39 fitur lengkap", icon: Waypoints, color: "from-purple-500 to-pink-500" },
              ].map((item) => (
                <button key={item.value} onClick={() => setSelectedModel(item.value as any)}
                  className={`relative group p-4 rounded-xl transition-all duration-300 ${selectedModel === item.value
                    ? `bg-gradient-to-r ${item.color} shadow-lg scale-105`
                    : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200"}`}>
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`p-2 rounded-lg ${selectedModel === item.value ? "bg-white/20" : "bg-gray-200"}`}>
                      <item.icon className={`w-5 h-5 ${selectedModel === item.value ? "text-white" : "text-gray-600"}`} />
                    </div>
                    <span className={`font-semibold text-sm ${selectedModel === item.value ? "text-white" : "text-gray-700"}`}>{item.label}</span>
                    <span className={`text-xs ${selectedModel === item.value ? "text-white/80" : "text-gray-500"}`}>{item.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-white" />
                <h2 className="text-white font-semibold">Form Data Pasien</h2>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <Form {...form} key={selectedModel}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                    <FormField control={form.control} name="nama" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-500" />Nama Lengkap
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama lengkap Anda" {...field}
                            className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {selectedFields.map((fieldName) => {
                      const meta = fieldMetadata[fieldName];
                      const isDropdown = Array.isArray(meta?.options);
                      return (
                        <div key={fieldName} className="group">
                          <FormField control={form.control} name={fieldName} render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700">{meta?.label || fieldName}</FormLabel>
                              <FormControl>
                                {isDropdown ? (
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="border-gray-200 focus:border-blue-400 bg-white">
                                      <SelectValue placeholder={`Pilih ${meta?.label || fieldName}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.isArray(meta?.options) && meta.options.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input {...field} placeholder={meta?.label || fieldName}
                                    className="border-gray-200 focus:border-blue-400 bg-white" />
                                )}
                              </FormControl>
                              {meta?.description && <FormDescription className="text-xs text-gray-500">{meta.description}</FormDescription>}
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <Button type="submit" disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl transition-all shadow-lg">
                      {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Memproses...</> : <><Heart className="mr-2 h-5 w-5" />Deteksi Sekarang</>}
                    </Button>
                    <Button onClick={handleDownload} disabled={predictionResult === null} type="button" variant="outline"
                      className="flex-1 border-2 border-gray-300 hover:border-blue-400 font-semibold py-6 rounded-xl">
                      <Save className="mr-2 h-5 w-5" />Simpan Hasil
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>

        {/* Result */}
        {predictionResult !== null && (
          <div className="max-w-4xl mx-auto mt-8 mb-16">
            <div className={`rounded-2xl shadow-xl overflow-hidden ${predictionResult === "Have heart disease"
              ? "bg-gradient-to-r from-red-50 to-orange-50 border-l-8 border-red-500"
              : "bg-gradient-to-r from-green-50 to-emerald-50 border-l-8 border-green-500"}`}>
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${predictionResult === "Have heart disease" ? "bg-red-100" : "bg-green-100"}`}>
                    {predictionResult === "Have heart disease"
                      ? <AlertCircle className="w-8 h-8 text-red-600" />
                      : <CheckCircle2 className="w-8 h-8 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Hasil Prediksi</h3>
                    <p className="text-2xl md:text-3xl font-bold mb-3">
                      {predictionResult === "Have heart disease"
                        ? <span className="text-red-600">Berisiko Tinggi</span>
                        : <span className="text-green-600">Risiko Rendah</span>}
                    </p>
                    <p className="text-gray-600 mb-2 text-sm">
                      {predictionResult === "Have heart disease"
                        ? "Terdapat indikasi risiko penyakit jantung koroner. Segera konsultasikan dengan dokter."
                        : "Risiko penyakit jantung koroner tergolong rendah berdasarkan data yang dimasukkan."}
                    </p>
                    {confidence !== null && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">Tingkat Keyakinan Model</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                            <div className={`h-2.5 rounded-full ${predictionResult === "Have heart disease"
                              ? "bg-gradient-to-r from-red-500 to-orange-500"
                              : "bg-gradient-to-r from-green-500 to-emerald-500"}`}
                              style={{ width: `${confidence}%` }} />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{confidence}%</span>
                        </div>
                      </div>
                    )}
                    <div className="mt-4">
                      <Link href="/history">
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          <History className="w-3 h-3" /> Lihat Riwayat Prediksi
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8 pb-8">
          <p className="text-xs text-gray-400">
            Prediksi ini bersifat informatif dan tidak menggantikan diagnosis medis profesional.
          </p>
        </div>
      </div>
    </main>
  );
}

export default withAuth(DashboardPage);
