"use client";

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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator";
import { 
  Activity,
  SquaresIntersect,
  Brain, 
  Heart, 
  Save, 
  Network, 
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Waypoints,
  User,
  LogIn,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser, TokenPayload } from "@/lib/auth";

export default function Home() {
  const [modelReady, setModelReady] = useState(true);
  const [result, setResult] = useState<number | undefined>(undefined);
  const [selectedModel, setSelectedModel] = useState<"cnn-lstm" | "random-forest" | "mi">("mi");
  const selectedFields = featureMap[selectedModel ?? "cnn-lstm"];
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Cek apakah user sudah login (untuk tampilkan navbar yang sesuai)
  const [loggedInUser, setLoggedInUser] = useState<TokenPayload | null>(null);
  useEffect(() => { setLoggedInUser(getCurrentUser()); }, []);

  useEffect(() => {
    toast.success(`${selectedModel === "cnn-lstm" ? "CNN-LSTM" : selectedModel === "random-forest" ? "Random Forest" : "Mutual Information"} model ready (API-based)`);
  }, [selectedModel]);

  const handleDownload = () => {
    const allValues = form.getValues();
    const nama = allValues["nama"];
    const filledFields = selectedFields.map((key) => {
      const value = allValues[key as keyof typeof allValues];
      return `${key}: ${value}`;
    });
    const hasil = `Hasil: ${predictionResult}\nConfidence: ${confidence ?? "N/A"}`;
    const content = [`Nama: ${nama}`, ...filledFields, hasil].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hasil_prediksi.txt";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const [formSchema, setFormSchema] = useState(createSchema("mi"));

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: "",
      ...Object.fromEntries(featureMap["mi"].map((field) => [field, ""]))
    }
  });

  const [confidence, setConfidence] = useState<number | null>(null);
  const [predictionResult, setPredictionResult] = useState<string | null>(null);

  const isFieldEnabled = (fieldName: string) => {
    const selectedFields = featureMap[selectedModel];
    if (!selectedFields) return true;
    return selectedFields.includes(fieldName);
  };

  useEffect(() => {
    const schema = createSchema(selectedModel);
    setFormSchema(schema);
    form.reset({
      nama: "",
      ...Object.fromEntries(featureMap[selectedModel].map(field => [field, ""]))
    });
  }, [selectedModel, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted:", values);
    setIsSubmitting(true);

    const endpointMap = {
      "cnn-lstm": "/predict/full",
      "random-forest": "/predict/rf",
      "mi": "/predict/mi",
    };

    const v = values as Record<string, string>;
    const selectedFields = featureMap[(selectedModel ?? "cnn-lstm") as keyof typeof featureMap];
    const filteredData = selectedFields.reduce((acc, key) => {
      const value = v[key];
      if (value === "" || value === null || value === undefined) {
        acc[key] = 0;
      } else {
        const num = parseFloat(value);
        acc[key] = isNaN(num) ? 0 : num;
      }
      return acc;
    }, {} as Record<string, number>);

    try {
      const res = await fetch(`https://chd-backend-production.up.railway.app${endpointMap[selectedModel]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filteredData),
      });

      const resultJson = await res.json();

      if (resultJson.error) {
        toast.error("Error: " + resultJson.error);
        setIsSubmitting(false);
        return;
      }

      setResult(resultJson.prediction);
      let conf = null;
        if (resultJson.probability !== undefined) {
            if (resultJson.prediction === 1) {
                conf = Number((resultJson.probability * 100).toFixed(2));
            } else {
                conf = Number(((1 - resultJson.probability) * 100).toFixed(2));
            }
        }
      setConfidence(conf);
      const hasilPrediksiText = resultJson.prediction === 1 ? "Have heart disease" : "No heart disease";
      setPredictionResult(hasilPrediksiText);

      // Simpan ke Google Sheet & DB
      try {
        await fetch("/api/save-to-sheets", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedModel, hasilPrediksi: hasilPrediksiText, confidence: conf, ...values }),
        });
      } catch (e) {}
      try {
        await fetch("/api/save-to-prisma-db", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedModel, hasilPrediksi: hasilPrediksiText, confidence: conf, ...values }),
        });
      } catch (e) {}

      toast.success(`Prediksi: ${hasilPrediksiText}`);
    } catch (error) {
      toast.error("Gagal prediksi");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-red-200 to-pink-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8 md:px-6 lg:px-8">

        {/* ── Navbar ─────────────────────────────────────────── */}
        <div className="flex justify-between items-center mb-6 bg-white/80 backdrop-blur rounded-2xl shadow-sm px-5 py-3 border border-gray-100">
          <div className="flex items-center gap-2">
            <Image src="/logoUMY.png" alt="Logo UMY" width={32} height={32} className="object-contain" />
            <span className="font-semibold text-gray-700 text-sm hidden sm:block">MyHeartD</span>
          </div>
          <div className="flex items-center gap-2">
            {loggedInUser ? (
              /* User sudah login → arahkan ke dashboard */
              <Link href={loggedInUser.role === "admin" ? "/admin" : "/dashboard"}>
                <Button size="sm" className="gap-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {loggedInUser.role === "admin" ? "Admin Panel" : "Dashboard"}
                </Button>
              </Link>
            ) : (
              /* Guest → tampilkan tombol Login dan Daftar */
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs border-gray-200 hover:border-blue-400">
                    <LogIn className="w-3.5 h-3.5" /> Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="gap-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <UserPlus className="w-3.5 h-3.5" /> Daftar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        {/* ── End Navbar ──────────────────────────────────────── */}

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-xl opacity-30"></div>
              <Image src="/logoUMY.png" alt="Logo UMY" width={80} height={80} className="relative w-20 h-20 object-contain" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Deteksi Dini Penyakit Jantung Koroner</h1>
          <p className="text-gray-600 text-sm md:text-base">Program Studi Teknologi Informasi</p>
          <Separator className="max-w-[300px] mx-auto my-6 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          <p className="text-gray-500 max-w-2xl mx-auto">Silakan isi form berikut dengan data Anda untuk mendapatkan prediksi risiko penyakit jantung koroner</p>
        </div>

        {/* Model Selection */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl"><Brain className="w-5 h-5 text-white" /></div>
              <h3 className="text-lg font-semibold text-gray-800">Pilih Model Prediksi</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: "mi", label: "Mutual Info", desc: "10 fitur MI", icon: SquaresIntersect, color: "from-emerald-500 to-teal-500" },
                { value: "random-forest", label: "Random Forest", desc: "10 fitur RF", icon: Network, color: "from-orange-500 to-red-500" },
                { value: "cnn-lstm", label: "CNN-LSTM", desc: "39 fitur lengkap", icon: Waypoints, color: "from-purple-500 to-pink-500" }
              ].map((item) => (
                <button key={item.value} onClick={() => setSelectedModel(item.value as any)}
                  className={`relative group p-4 rounded-xl transition-all duration-300 ${selectedModel === item.value ? `bg-gradient-to-r ${item.color} shadow-lg scale-105` : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200"}`}>
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`p-2 rounded-lg transition-colors ${selectedModel === item.value ? "bg-white/20" : "bg-gray-200"}`}><item.icon className={`w-5 h-5 ${selectedModel === item.value ? "text-white" : "text-gray-600"}`} /></div>
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
              <div className="flex items-center gap-2"><Stethoscope className="w-5 h-5 text-white" /><h2 className="text-white font-semibold">Form Data Pasien</h2></div>
            </div>
            <div className="p-6 md:p-8">
              <Form {...form} key={selectedModel}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                    <FormField control={form.control} name="nama" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold flex items-center gap-2"><User className="w-4 h-4 text-blue-500" />Nama Lengkap</FormLabel>
                        <FormControl><Input placeholder="Masukkan nama lengkap Anda" {...field} className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white" /></FormControl>
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
                                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!isFieldEnabled(fieldName)}>
                                    <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white"><SelectValue placeholder={`Pilih ${meta?.label || fieldName}`} /></SelectTrigger>
                                    <SelectContent>{Array.isArray(meta?.options) && meta.options.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
                                  </Select>
                                ) : (
                                  <Input {...field} placeholder={meta?.label || fieldName} disabled={!isFieldEnabled(fieldName)} className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white" />
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
                    <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg">
                      {isSubmitting ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Memproses...</>) : (<><Heart className="mr-2 h-5 w-5" />Deteksi Sekarang</>)}
                    </Button>
                    <Button onClick={handleDownload} disabled={predictionResult === null} type="button" variant="outline" className="flex-1 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 font-semibold py-6 rounded-xl transition-all duration-300">
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
            <div className={`rounded-2xl shadow-xl overflow-hidden ${predictionResult === "Have heart disease" ? "bg-gradient-to-r from-red-50 to-orange-50 border-l-8 border-red-500" : "bg-gradient-to-r from-green-50 to-emerald-50 border-l-8 border-green-500"}`}>
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${predictionResult === "Have heart disease" ? "bg-red-100" : "bg-green-100"}`}>
                    {predictionResult === "Have heart disease" ? <AlertCircle className="w-8 h-8 text-red-600" /> : <CheckCircle2 className="w-8 h-8 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Hasil Prediksi</h3>
                    <p className="text-2xl md:text-3xl font-bold mb-3">{predictionResult === "Have heart disease" ? (<span className="text-red-600">Berisiko Tinggi</span>) : (<span className="text-green-600">Risiko Rendah</span>)}</p>
                    <p className="text-gray-600 mb-2">{predictionResult === "Have heart disease" ? "Berdasarkan data yang Anda masukkan, terdapat indikasi risiko penyakit jantung koroner. Segera konsultasikan dengan dokter." : "Berdasarkan data yang Anda masukkan, risiko penyakit jantung koroner tergolong rendah."}</p>
                    {confidence !== null && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">Tingkat Keyakinan Model</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2.5"><div className={`h-2.5 rounded-full ${predictionResult === "Have heart disease" ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-green-500 to-emerald-500"}`} style={{ width: `${confidence}%` }}></div></div>
                          <span className="text-sm font-semibold text-gray-700">{confidence}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-12 pb-8">
          <p className="text-xs text-gray-400">!!Prediksi ini bersifat informatif dan tidak menggantikan diagnosis medis profesional. Selalu konsultasikan dengan dokter untuk hasil yang akurat!!</p>
        </div>
      </div>
    </main>
  );
}