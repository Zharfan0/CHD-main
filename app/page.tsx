"use client";

import { fieldMetadata } from "@/lib/fieldMetadata";
import { createSchema } from "@/lib/createSchema";
import { featureMap } from "@/lib/featureMap";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import * as tf from '@tensorflow/tfjs';
// @ts-ignore
import * as tfdf from '@tensorflow/tfjs-tfdf';
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
  Brain, 
  Heart, 
  Save, 
  Shield, 
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  User,
} from "lucide-react";

export default function Home() {
  const [model, setModel] = useState<tfdf.TFDFModel | boolean | null>(null);
  const [backendReady, setBackendReady] = useState(false);
  const [result, setResult] = useState<number | undefined>(undefined);
  const [selectedModel, setSelectedModel] = useState<"cnn-lstm" | "random-forest" | "mi">("mi");
  const selectedFields = featureMap[selectedModel ?? "cnn-lstm"];
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inisialisasi backend TensorFlow DF
  useEffect(() => {
    const initializeBackend = async () => {
      try {
        tfdf.setLocateFile((path: any, base: any) => {
          return `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tfdf/dist/${path}`;
        });
        console.log('backend ready');
        setBackendReady(true);
      } catch (error) {
        console.error('Failed to initialize backend', error);
      }
    };

    initializeBackend();
  }, []);


  // Load model sesuai pilihan dropdown
  useEffect(() => {
    const loadCNNModel = async () => {
      try {
        const loadedModel = await tfdf.loadTFDFModel(`${window.location.href}tfjs_under_over/model.json`);
        setModel(loadedModel);
        toast.success('CNN-LSTM model loaded successfully');
        console.log("CNN-LSTM model loaded");
      } catch (error) {
        toast.error('Failed to load CNN-LSTM model');
        console.error('Error loading CNN-LSTM model:', error);
      }
    };

    if (selectedModel === "cnn-lstm" && backendReady) {
      loadCNNModel();
    } else if (selectedModel === "random-forest" && backendReady) {
      setModel(true);
      toast.success('Random Forest model ready (API-based)');
      console.log("Random Forest model ready");
    } else if (selectedModel === "mi" && backendReady) {
      setModel(true);
      toast.success('Mutual Information + RF model ready (API-based)');
      console.log("Mutual Information + RF model ready");
    }
  }, [selectedModel, backendReady]);

  
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

      if (!model) {
        toast.error("Model belum dimuat");
        setIsSubmitting(false);
        return;
      }

      if (selectedModel === "cnn-lstm") {
      console.log("Backend:", tf.getBackend());
    }


    if (selectedModel === "cnn-lstm") {
      const v = values as any;
      const inputData = {
        'state': tf.tensor([0], [1], 'int32'),
        'sex': tf.tensor([parseInt(v.sex)], [1], 'int32'),
        'generalhealth': tf.tensor([parseInt(v.generalhealth)], [1], 'int32'),
        'physicalhealthdays': tf.tensor([parseFloat(v.physicalhealthdays)], [1], 'float32'),
        'mentalhealthdays': tf.tensor([parseFloat(v.mentalhealthdays)], [1], 'float32'),
        'lastcheckuptime': tf.tensor([parseInt(v.lastcheckuptime)], [1], 'int32'),
        'physicalactivities': tf.tensor([parseInt(v.physicalactivities)], [1], 'int32'),
        'sleephours': tf.tensor([parseFloat(v.sleephours)], [1], 'float32'),
        'removedteeth': tf.tensor([parseInt(v.removedteeth)], [1], 'int32'),
        'hadstroke': tf.tensor([parseInt(v.hadstroke)], [1], 'int32'),
        'hadasthma': tf.tensor([parseInt(v.hadasthma)], [1], 'int32'),
        'hadskincancer': tf.tensor([parseInt(v.hadskincancer)], [1], 'int32'),
        'hadcopd': tf.tensor([parseInt(v.hadcopd)], [1], 'int32'),
        'haddepressivedisorder': tf.tensor([parseInt(v.haddepressivedisorder)], [1], 'int32'),
        'hadkidneydisease': tf.tensor([parseInt(v.hadkidneydisease)], [1], 'int32'),
        'hadarthritis': tf.tensor([parseInt(v.hadarthritis)], [1], 'int32'),
        'haddiabetes': tf.tensor([parseInt(v.haddiabetes)], [1], 'int32'),
        'deaforhardofhearing': tf.tensor([parseInt(v.deaforhardofhearing)], [1], 'int32'),
        'blindorvisiondifficulty': tf.tensor([parseInt(v.blindorvisiondifficulty)], [1], 'int32'),
        'difficultyconcentrating': tf.tensor([parseInt(v.difficultyconcentrating)], [1], 'int32'),
        'difficultywalking': tf.tensor([parseInt(v.difficultywalking)], [1], 'int32'),
        'difficultydressingbathing': tf.tensor([parseInt(v.difficultydressingbathing)], [1], 'int32'),
        'difficultyerrands': tf.tensor([parseInt(v.difficultyerrands)], [1], 'int32'),
        'smokerstatus': tf.tensor([parseInt(v.smokerstatus)], [1], 'int32'),
        'ecigaretteusage': tf.tensor([parseInt(v.ecigaretteusage)], [1], 'int32'),
        'chestscan': tf.tensor([parseInt(v.chestscan)], [1], 'int32'),
        'raceethnicitycategory': tf.tensor([parseInt(v.raceethnicitycategory)], [1], 'int32'),
        'agecategory': tf.tensor([parseInt(v.agecategory)], [1], 'int32'),
        'heightinmeters': tf.tensor([parseFloat(v.heightinmeters) / 100], [1], 'float32'),
        'bmi': tf.tensor([parseFloat(v.bmi)], [1], 'float32'),
        'alcoholdrinkers': tf.tensor([parseInt(v.alcoholdrinkers)], [1], 'int32'),
        'hivtesting': tf.tensor([parseInt(v.hivtesting)], [1], 'int32'),
        'fluvaxlast12': tf.tensor([parseInt(v.fluvaxlast12)], [1], 'int32'),
        'pneumovaxever': tf.tensor([parseInt(v.pneumovaxever)], [1], 'int32'),
        'tetanuslast10tdap': tf.tensor([parseInt(v.tetanuslast10tdap)], [1], 'int32'),
        'highrisklastyear': tf.tensor([parseInt(v.highrisklastyear)], [1], 'int32'),
        'covidpos': tf.tensor([parseInt(v.covidpos)], [1], 'int32'),
      };

    try {
      const result = await model.executeAsync(inputData);
      const prediction = result.dataSync()[0];
      setResult(prediction);
      const confidenceValue =
        prediction >= 0.5
          ? prediction * 100
          : (1 - prediction) * 100;

      setConfidence(Number(confidenceValue.toFixed(2)));
      setPredictionResult(prediction >= 0.5 ? "Have heart disease" : "No heart disease");
      toast.success(`Prediksi berhasil: ${prediction}`);

      // Simpan ke Google Sheet untuk CNN-LSTM (pakai variabel lokal)
      const hasilPrediksiText = prediction >= 0.5 ? "Have heart disease" : "No heart disease";
      const confidenceValueFinal = prediction >= 0.5
        ? prediction * 100
        : (1 - prediction) * 100;
      const confidenceFinal = Number(confidenceValueFinal.toFixed(2));

      try {
        await fetch("/api/save-to-sheets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: values.nama,
            selectedModel: selectedModel,
            hasilPrediksi: hasilPrediksiText,
            confidence: confidenceFinal,
          }),
        });
        console.log("Data CNN-LSTM saved to Google Sheet");
      } catch (saveError) {
        console.error("Failed to save CNN-LSTM to sheet:", saveError);
      }

    } catch (error) {
      console.error("Error executing model:", error);
      toast.error("Gagal menjalankan model CNN-LSTM");
    } finally {
      setIsSubmitting(false);
    }

    } else {
      const endpointMap = {
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
    console.log("Selected Model:", selectedModel);
    console.log("Data dikirim:", filteredData);

    try {
      const res = await fetch(`https://chd-backend-production-8b5b.up.railway.app${endpointMap[selectedModel]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filteredData),
      });

      const resultJson = await res.json();
      console.log("Prediction result:", resultJson);


      if (resultJson.error) {
        toast.error("Error dari backend: " + resultJson.error);
        setIsSubmitting(false);
        return;
      }

      const prediction = resultJson.prediction;
      setResult(prediction);

      // Hitung confidence dan hasil prediksi terlebih dahulu
      let finalConfidence = null;
      if (resultJson.probability !== undefined) {
        finalConfidence = Number((resultJson.probability * 100).toFixed(2));
        setConfidence(finalConfidence);
      } else {
        setConfidence(null);
      }

      const hasilPrediksiText = prediction === 1 ? "Have heart disease" : "No heart disease";
      setPredictionResult(hasilPrediksiText);

      // Simpan ke Google Sheet PAKAI VARIABEL LOKAL, BUKAN STATE
      try {
        await fetch("/api/save-to-sheets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: values.nama,
            selectedModel: selectedModel,
            hasilPrediksi: hasilPrediksiText,
            confidence: finalConfidence,
          }),
        });
        console.log("Data saved to Google Sheet");
      } catch (saveError) {
        console.error("Failed to save to sheet:", saveError);
      }

      toast.success(`Prediksi berhasil: ${prediction === 1 ? "Positif" : "Negatif"}`);

    } catch (error) {
      console.error("Gagal fetch ke API:", error);
      toast.error("Gagal prediksi melalui backend API");
    } finally {
      setIsSubmitting(false);
    }
  }
}



  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-red-200 to-pink-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8 md:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-xl opacity-30"></div>
              <img src="/logoUMY.png" alt="Logo UMY" className="relative w-20 h-20 object-contain" />
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Deteksi Dini Penyakit Jantung Koroner
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Program Studi Teknologi Informasi
          </p>
          
          <Separator className="max-w-[300px] mx-auto my-6 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          
          <p className="text-gray-500 max-w-2xl mx-auto">
            Silakan isi form berikut dengan data Anda untuk mendapatkan prediksi risiko penyakit jantung koroner
          </p>
        </div>

        {/* Model Selection Card */}
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
                { value: "mi", label: "Mutual Info", desc: "10 fitur terpilih", icon: Activity, color: "from-emerald-500 to-teal-500" },
                { value: "random-forest", label: "Random Forest", desc: "10 fitur utama", icon: Shield, color: "from-orange-500 to-red-500" },
                { value: "cnn-lstm", label: "CNN-LSTM", desc: "37 fitur lengkap", icon: Sparkles, color: "from-purple-500 to-pink-500" }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setSelectedModel(item.value as any)}
                  className={`relative group p-4 rounded-xl transition-all duration-300 ${
                    selectedModel === item.value
                      ? `bg-gradient-to-r ${item.color} shadow-lg scale-105`
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200"
                  }`}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`p-2 rounded-lg transition-colors ${
                      selectedModel === item.value ? "bg-white/20" : "bg-gray-200"
                    }`}>
                      <item.icon className={`w-5 h-5 ${
                        selectedModel === item.value ? "text-white" : "text-gray-600"
                      }`} />
                    </div>
                    <span className={`font-semibold text-sm ${
                      selectedModel === item.value ? "text-white" : "text-gray-700"
                    }`}>
                      {item.label}
                    </span>
                    <span className={`text-xs ${
                      selectedModel === item.value ? "text-white/80" : "text-gray-500"
                    }`}>
                      {item.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Form Card */}
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
                  {/* Nama Field */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                    <FormField
                      control={form.control}
                      name="nama"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500" />
                            Nama Lengkap
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Masukkan nama lengkap Anda" 
                              {...field} 
                              className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dynamic Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {selectedFields.map((fieldName) => {
                      const meta = fieldMetadata[fieldName];
                      const isDropdown = Array.isArray(meta?.options);

                      return (
                        <div key={fieldName} className="group">
                          <FormField
                            control={form.control}
                            name={fieldName}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  {meta?.label || fieldName}
                                </FormLabel>
                                <FormControl>
                                  {isDropdown ? (
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value} 
                                      disabled={!isFieldEnabled(fieldName)}
                                    >
                                      <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white">
                                        <SelectValue placeholder={`Pilih ${meta?.label || fieldName}`} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Array.isArray(meta?.options) &&
                                          meta.options.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                              {opt.label}
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input 
                                      {...field} 
                                      placeholder={meta?.label || fieldName} 
                                      disabled={!isFieldEnabled(fieldName)}
                                      className="border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
                                    />
                                  )}
                                </FormControl>
                                {meta?.description && (
                                  <FormDescription className="text-xs text-gray-500">
                                    {meta.description}
                                  </FormDescription>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                    <Button 
                      type="submit" 
                      disabled={!model || isSubmitting}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <Heart className="mr-2 h-5 w-5" />
                          Deteksi Sekarang
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={handleDownload} 
                      disabled={predictionResult === null}
                      type="button"
                      variant="outline"
                      className="flex-1 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 font-semibold py-6 rounded-xl transition-all duration-300"
                    >
                      <Save className="mr-2 h-5 w-5" />
                      Simpan Hasil
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>

        {/* Result Card */}
        {predictionResult !== null && (
          <div className="max-w-4xl mx-auto mt-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`rounded-2xl shadow-xl overflow-hidden ${
              predictionResult === "Have heart disease" 
                ? "bg-gradient-to-r from-red-50 to-orange-50 border-l-8 border-red-500"
                : "bg-gradient-to-r from-green-50 to-emerald-50 border-l-8 border-green-500"
            }`}>
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    predictionResult === "Have heart disease" 
                      ? "bg-red-100" 
                      : "bg-green-100"
                  }`}>
                    {predictionResult === "Have heart disease" ? (
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    ) : (
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Hasil Prediksi</h3>
                    <p className="text-2xl md:text-3xl font-bold mb-3">
                      {predictionResult === "Have heart disease" ? (
                        <span className="text-red-600">⚠️ Berisiko Tinggi</span>
                      ) : (
                        <span className="text-green-600">✅ Risiko Rendah</span>
                      )}
                    </p>
                    <p className="text-gray-600 mb-2">
                      {predictionResult === "Have heart disease" 
                        ? "Berdasarkan data yang Anda masukkan, terdapat indikasi risiko penyakit jantung koroner. Segera konsultasikan dengan dokter untuk pemeriksaan lebih lanjut."
                        : "Berdasarkan data yang Anda masukkan, risiko penyakit jantung koroner tergolong rendah. Tetaplah menjaga pola hidup sehat."
                      }
                    </p>
                    {confidence !== null && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">Tingkat Keyakinan Model</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full transition-all duration-1000 ${
                                predictionResult === "Have heart disease" 
                                  ? "bg-gradient-to-r from-red-500 to-orange-500" 
                                  : "bg-gradient-to-r from-green-500 to-emerald-500"
                              }`}
                              style={{ width: `${confidence}%` }}
                            ></div>
                          </div>
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

        {/* Footer Note */}
        <div className="text-center mt-12 pb-8">
          <p className="text-xs text-gray-400">
            ⚠️ Prediksi ini bersifat informatif dan tidak menggantikan diagnosis medis profesional. 
            Selalu konsultasikan dengan dokter untuk hasil yang akurat.
          </p>
        </div>
      </div>
    </main>
  );
}