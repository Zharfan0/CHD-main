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

const featureMap = {
  "cnn-lstm": ["sex", "generalhealth", "physicalhealthdays", "mentalhealthdays", "lastcheckuptime",
  "physicalactivities", "sleephours", "removedteeth", "hadstroke", "hadasthma",
  "hadskincancer", "hadcopd", "haddepressivedisorder", "hadkidneydisease", "hadarthritis",
  "haddiabetes", "deaforhardofhearing", "blindorvisiondifficulty", "difficultyconcentrating",
  "difficultywalking", "difficultydressingbathing", "difficultyerrands", "smokerstatus",
  "ecigaretteusage", "chestscan", "raceethnicitycategory", "agecategory", "heightinmeters",
  "bmi", "alcoholdrinkers", "hivtesting", "fluvaxlast12", "pneumovaxever",
  "tetanuslast10tdap", "highrisklastyear", "covidpos"],
    "random-forest": [
      "sex", "generalhealth", "physicalhealthdays", "mentalhealthdays", "sleephours",
      "hadasthma", "haddiabetes", "raceethnicitycategory", "agecategory", "bmi"
    ],
    "mi": [
      "physicalactivities", "hadasthma", "removedteeth", "alcoholdrinkers",
      "fluvaxlast12", "chestscan", "sex", "generalhealth",
      "raceethnicitycategory", "lastcheckuptime"
    ]
  };

export default function Home() {
  const [model, setModel] = useState<tfdf.TFDFModel | boolean | null>(null);
  const [backendReady, setBackendReady] = useState(false);
  const [result, setResult] = useState<number | undefined>(undefined);
  const [selectedModel, setSelectedModel] = useState<"cnn-lstm" | "random-forest" | "mi">("cnn-lstm");
  const selectedFields = featureMap[selectedModel ?? "cnn-lstm"];


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
    // Ambil semua nilai form
    const allValues = form.getValues();
    const nama = allValues["nama"];

    // Format tiap field menjadi "namaField: nilai"
    const filledFields = selectedFields.map((key) => {
      const value = allValues[key as keyof typeof allValues];
      return `${key}: ${value}`;
    });

    // Gabungkan semua data untuk isi file
    const hasil = `Hasil: ${predictionResult}\nConfidence: ${confidence ?? "N/A"}`;
    const content = [`Nama: ${nama}`, ...filledFields, hasil].join("\n");

    // Buat file dan trigger download
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hasil_prediksi.txt";
    a.click();
    window.URL.revokeObjectURL(url);
  };



    const createSchema = (model: string | null) => {
      const selectedFields = featureMap[(model ?? "cnn-lstm") as keyof typeof featureMap];
      return z.object({
        nama: z.string().min(1),
        ...Object.fromEntries(
          selectedFields.map((field) => [field, z.string().min(1).max(50)])
        )
      });
    };


  const [formSchema, setFormSchema] = useState(createSchema("cnn-lstm"));

  const form = useForm<any>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    nama: "",
    ...Object.fromEntries(featureMap["cnn-lstm"].map((field) => [field, ""]))
  }
});



  const [confidence, setConfidence] = useState<number | null>(null);
  const [predictionResult, setPredictionResult] = useState<string | null>(null);

    const isFieldEnabled = (fieldName: string) => {
    const selectedFields = featureMap[selectedModel];
    if (!selectedFields) return true; // default: semua aktif jika belum dipilih
    return selectedFields.includes(fieldName);
  };

  useEffect(() => {
  const newSchema = createSchema(selectedModel ?? "cnn-lstm");
  setFormSchema(newSchema);
  form.reset({}, { keepValues: true });
}, [selectedModel]);

    useEffect(() => {
      const schema = createSchema(selectedModel);
      setFormSchema(schema);
      form.reset({
        nama: "",
        ...Object.fromEntries(featureMap[selectedModel].map(field => [field, ""]))
      });
    }, [selectedModel]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
  console.log("Form submitted:", values);

      if (!model) {
        toast.error("Model belum dimuat");
        return;
      }

      if (selectedModel === "cnn-lstm") {
      console.log("Backend:", tf.getBackend());
    }


    if (selectedModel === "cnn-lstm") {
      // Proses model lokal CNN-LSTM
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
      setConfidence(null); // Tidak ada confidence dari CNN-LSTM
      setPredictionResult(prediction >= 0.5 ? "Have heart disease" : "No heart disease");
      toast.success(`Prediksi berhasil: ${prediction}`);
    } catch (error) {
      console.error("Error executing model:", error);
      toast.error("Gagal menjalankan model CNN-LSTM");
    }

    } else {
      // ✅ Proses model Random Forest dan MI via API
      const endpointMap = {
        "random-forest": "/predict/rf",
        "mi": "/predict/mi",
      };

    const v = values as Record<string, string>;


    const selectedFields = featureMap[(selectedModel ?? "cnn-lstm") as keyof typeof featureMap];
    const filteredData = selectedFields.reduce((acc, key) => {
      acc[key] = parseFloat(v[key]);
      return acc;
    }, {} as Record<string, number>);

    try {
      const res = await fetch(`https://chd-backend-production.up.railway.app${endpointMap[selectedModel]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filteredData),
      });

      const resultJson = await res.json();
      console.log("Prediction result:", resultJson);


      if (resultJson.error) {
        toast.error("Error dari backend: " + resultJson.error);
        return;
      }

      const prediction = resultJson.prediction;
            setResult(prediction);

      if (resultJson.probability !== undefined) {
        const prob = resultJson.probability;
        setConfidence(Math.round(prob * 10000) / 100); // 2 desimal
      } else {
        setConfidence(null); // model tidak sediakan probabilitas
      }

      setPredictionResult(prediction === 1 ? "Have heart disease" : "No heart disease");

      toast.success(`Prediksi berhasil: ${prediction === 1 ? "Positif" : "Negatif"}`);
    } catch (error) {
      console.error("Gagal fetch ke API:", error);
      toast.error("Gagal prediksi melalui backend API");
    }
  }
}



  return (
    <main className="w-full h-full flex flex-col justify-start items-center gap-4 mt-10 md:px-0 px-6">
      
      <header className="flex flex-col items-center justify-center p-4">
        <img src="/logoUMY.png" alt="Logo UMY" className="w-20 h-20" />
        <h1 className="text-2xl font-bold">Deteksi Dini Penyakit Jantung Koroner</h1>
        <p className="text-md">Prodi Teknologi Informasi</p>
      </header>

      <Separator className="max-w-[800px]" />
      <h3 className="text-sm text-gray-500">
        Silahkan isi form berikut untuk mendeteksi penyakit jantung
      </h3>
      <div className="flex flex-col w-fit gap-4">
              <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cnn-lstm">CNN-LSTM (37)</SelectItem>
                  <SelectItem value="random-forest">Random Forest (10)</SelectItem>
                  <SelectItem value="mi">Mutual Info (10)</SelectItem>
                </SelectContent>
              </Select>
        </div>
      <div className="border-2 border-gray-500 px-4 py-2 shadow-lg rounded-lg max-w-[800px]">
        <Form {...form} key={selectedModel}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormDescription>
                        Name
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {selectedFields.map((fieldName) => {
                const meta = fieldMetadata[fieldName];
                const isDropdown = !!meta?.options;

                return (
                  <FormField
                    key={fieldName}
                    control={form.control}
                    name={fieldName}
                    render={({ field }) => (
                      <FormItem>
                        <FormDescription>{meta?.description}</FormDescription>
                        <FormControl>
                          {isDropdown ? (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder={`${meta?.label}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {meta.options?.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input {...field} placeholder={meta?.label} />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              })}


            <div className="flex flex-col w-fit gap-4">
              <Button type="submit" disabled={!model} >Submit</Button>
              <Button onClick={handleDownload} disabled={predictionResult === null}>Simpan Hasil</Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="border-2 border-gray-500 px-4 py-2 shadow-lg rounded-lg max-w-[800px] mb-[100px]">
        {predictionResult !== null && (
          <div>
            <h2 className="text-lg font-semibold">Hasil Prediksi:</h2>
            <p>
              <medium>Result:</medium>{" "}
              {predictionResult === "Have heart disease"
                ? "Have heart disease"
                : predictionResult === "No heart disease"
                ? "Doesn't have Heart Disease"
                : predictionResult}
            </p>
            {confidence !== null && (
              <p>
                <medium>Confidence:</medium> {confidence}%
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
