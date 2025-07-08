"use client";

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

export default function Home() {
  const [selectedModel, setSelectedModel] = useState<keyof typeof featureMap>("cnn-lstm");
  const [model, setModel] = useState<tfdf.TFDFModel | boolean | null>(null);
  const [backendReady, setBackendReady] = useState(false);
  const [result, setResult] = useState<number | undefined>(undefined);

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

  const handleDownload = () => {
    // Ambil semua nilai form
    const allValues = form.getValues();
    const nama = allValues["nama"];

    // Ambil field sesuai model yang dipilih
    const selectedFields = featureMap[selectedModel ?? "cnn-lstm"];

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

    const featureMap = {
      "random-forest": [
        "sex", "generalhealth", "physicalhealthdays", "mentalhealthdays", "sleephours",
        "hadasthma", "haddiabetes", "raceethnicitycategory", "agecategory", "bmi"
      ],
      "mi": [
        "physicalactivities", "hadasthma", "removedteeth", "alcoholdrinkers",
        "fluvaxlast12", "chestscan", "sex", "generalhealth",
        "raceethnicitycategory", "lastcheckuptime"
      ],
    };

    const selectedFields = featureMap[(selectedModel ?? "cnn-lstm") as keyof typeof featureMap];
    const filteredData = selectedFields.reduce((acc, key) => {
      acc[key] = parseFloat(values[key]);
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
              <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as "cnn-lstm" | "random-forest" | "mi")}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cnn-lstm">CNN-LSTM</SelectItem>
                  <SelectItem value="random-forest">Random Forest</SelectItem>
                  <SelectItem value="mi">Mutual Information + RF</SelectItem>
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
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama lengkap" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("sex")}>
                    <FormDescription>
                      Sex of Respondent
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sex" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Female</SelectItem>
                      <SelectItem value="1">Male</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="generalhealth"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("generalhealth")}>
                    <FormDescription>
                      Would you say that in general your health is:
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="General Health" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Excellent</SelectItem>
                      <SelectItem value="4">Very Good</SelectItem>
                      <SelectItem value="2">Good</SelectItem>
                      <SelectItem value="1">Fair</SelectItem>
                      <SelectItem value="3">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="physicalhealthdays"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("physicalhealthdays")}>
                    <FormDescription>
                      Now thinking about your physical health, which includes physical illness and injury, for how many days during the past 30 days was your physical health not good?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Physical Health Days" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0.00">0 Day</SelectItem>
                      <SelectItem value="1.00">1 Day</SelectItem>
                      {Array.from({ length: 29 }, (_, index) => (
                        <SelectItem key={index + 2} value={(index + 2).toFixed(2)}>
                          {index + 2} Days
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mentalhealthdays"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("mentalhealthdays")}>
                    <FormDescription>
                      Now thinking about your mental health, which includes stress, depression, and problems with emotions, for how many days during the past 30 days was your mental health not good?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Mental Health Days" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0.00">0 Day</SelectItem>
                      <SelectItem value="1.00">1 Day</SelectItem>
                      {Array.from({ length: 29 }, (_, index) => (
                        <SelectItem key={index + 2} value={(index + 2).toFixed(2)}>
                          {index + 2} Days
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastcheckuptime"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("lastcheckuptime")}>
                    <FormDescription>
                      About how long has it been since you last visited a doctor for a routine checkup?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Last Check-up time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="3">Within past year (anytime less than 12 months ago)</SelectItem>
                      <SelectItem value="1">Within past 2 years (1 year but less than 2 years ago)</SelectItem>
                      <SelectItem value="2">Within past 5 years (2 years but less than 5 years ago)</SelectItem>
                      <SelectItem value="0">5 or more years ago</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="physicalactivities"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("physicalactivities")}>
                    <FormDescription>
                      During the past month, other than your regular job, did you participate in any physical activities or exercises such as running, calisthenics, golf, gardening, or walking for exercise?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Physical Activities" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sleephours"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("sleephours")}>
                    <FormDescription>
                      On average, how many hours of sleep do you get in a 24-hour period?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sleep Hours" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1.00">1 Hour</SelectItem>
                      {Array.from({ length: 23 }, (_, index) => (
                        <SelectItem key={index + 2} value={(index + 2).toFixed(2)}>
                          {index + 2} Hours
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="removedteeth"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("removedteeth")}>
                    <FormDescription>
                      Not including teeth lost for injury or orthodontics, how many of your permanent teeth have been removed because of tooth decay or gum disease?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Removed Teeth" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="3">None of them</SelectItem>
                      <SelectItem value="0">1 to 5</SelectItem>
                      <SelectItem value="1">6 or more, but not all</SelectItem>
                      <SelectItem value="2">All</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hadstroke"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("hadstroke")}>
                    <FormDescription>
                      (Ever told) (you had) a stroke.
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Had Stroke" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hadasthma"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("hadasthma")}>
                    <FormDescription>
                      (Ever told) (you had) asthma?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Had asthma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hadskincancer"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("hadskincancer")}>
                    <FormDescription>
                      (Ever told) (you had) skin cancer that is not melanoma?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Had Skin Cancer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hadcopd"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("hadcopd")}>
                    <FormDescription>
                      (Ever told) (you had) C.O.P.D. (chronic obstructive pulmonary disease), emphysema or chronic bronchitis?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Had COPD" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="haddepressivedisorder"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("haddepressivedisorder")}>
                    <FormDescription>
                      (Ever told) (you had) a depressive disorder (including depression, major depression, dysthymia, or minor depression)?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Had Depressive Disorder" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hadkidneydisease"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("hadkidneydisease")}>
                    <FormDescription>
                      Not including kidney stones, bladder infection or incontinence, were you ever told you had kidney disease?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Had Kidney Disease" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hadarthritis"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("hadarthritis")}>
                    <FormDescription>
                      (Ever told) (you had) some form of arthritis, rheumatoid arthritis, gout, lupus, or fibromyalgia?  (Arthritis diagnoses include: rheumatism, polymyalgia rheumatica; osteoarthritis (not osteporosis); tendonitis, bursitis, bunion, tennis elbow; carpal tunnel syndrome, tarsal tunnel syndrome; joint infection, etc.)
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Had Arthritis" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="haddiabetes"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("haddiabetes")}>
                    <FormDescription>
                      (Ever told) (you had) diabetes?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Had Diabetes" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deaforhardofhearing"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("deaforhardofhearing")}>
                    <FormDescription>
                      Are you deaf or do you have serious difficulty hearing?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Deaf or hard of hearing" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="blindorvisiondifficulty"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("blindorvisiondifficulty")}>
                    <FormDescription>
                      Are you blind or do you have serious difficulty seeing, even when wearing glasses?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Blind or vision dificulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="difficultyconcentrating"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("difficultyconcentrating")}>
                    <FormDescription>
                      Because of a physical, mental, or emotional condition, do you have serious difficulty concentrating, remembering, or making decisions?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Dificulty Concentrating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="difficultywalking"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("difficultywalking")}>
                    <FormDescription>
                      Do you have serious difficulty walking or climbing stairs?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Dificulty Walking" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="difficultydressingbathing"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("difficultydressingbathing")}>
                    <FormDescription>
                      Do you have difficulty dressing or bathing?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Dificulty dressing/bathing" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="difficultyerrands"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("difficultyerrands")}>
                    <FormDescription>
                      Because of a physical, mental, or emotional condition, do you have difficulty doing errands alone such as visiting a doctor´s office or shopping?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Dificulty Errands" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smokerstatus"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("smokerstatus")}>
                    <FormDescription>
                      Four-level smoker status:  Everyday smoker, Someday smoker, Former smoker, Non-smoker
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Somker Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="3">Never smoked</SelectItem>
                      <SelectItem value="2">Former Smoker</SelectItem>
                      <SelectItem value="1">Current smoker - now smokes some days</SelectItem>
                      <SelectItem value="0">Current smoker - now smokes every day</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ecigaretteusage"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("ecigaretteusage")}>
                    <FormDescription>
                      Would you say you have never used e-cigarettes or other electronic vaping products in your entire life or now use them every day, use them some days, or used them in the past but do not currently use them at all?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="E-Cigarette Usage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Never used e-cigarettes in my entire life</SelectItem>
                      <SelectItem value="1">Not at all (right now)</SelectItem>
                      <SelectItem value="3">Use them some days</SelectItem>
                      <SelectItem value="2">Use them every day</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chestscan"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("chestscan")}>
                    <FormDescription>
                      Have you ever had a CT or CAT scan of your chest area?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chest scan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="raceethnicitycategory"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("raceethnicitycategory")}>
                    <FormDescription>
                      Five-level race/ethnicity category
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Race ethnic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="4">White only, Non-Hispanic</SelectItem>
                      <SelectItem value="0">Black only, Non-Hispanic</SelectItem>
                      <SelectItem value="3">Other race only, Non-Hispanic</SelectItem>
                      <SelectItem value="2">Multiracial, Non-Hispanic</SelectItem>
                      <SelectItem value="1">Hispanic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agecategory"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("agecategory")}>
                    <FormDescription>
                      Fourteen-level age category
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Age category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((value, index) => (
                        <SelectItem key={index} value={value.toString()}>
                          Age {['80 or older', '75 to 79', '70 to 74', '60 to 64', '65 to 69', '55 to 59', '50 to 54', '45 to 49', '40 to 44', '35 to 39', '30 to 34', '25 to 29', '18 to 24'][value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="heightinmeters"
              render={({ field }) => (
                <FormItem>
                  <FormDescription>
                    Reported height in centimeters
                  </FormDescription>
                  <Input type="number" placeholder="Height in Centimeter" {...field} disabled={!isFieldEnabled("heightinmeters")}/>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bmi"
              render={({ field }) => (
                <FormItem>
                  <FormDescription>
                    Body Mass Index (BMI) in kg
                  </FormDescription>
                  <Input type="number" placeholder="Body mass index" {...field} disabled={!isFieldEnabled("bmi")}/>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alcoholdrinkers"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("alcoholdrinkers")}>
                    <FormDescription>
                      Adults who reported having had at least one drink of alcohol in the past 30 days.
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Drinker" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hivtesting"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("hivtesting")}>
                    <FormDescription>
                      Adults who have ever been tested for HIV
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="HIV test" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fluvaxlast12"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("fluvaxlast12")}>
                    <FormDescription>
                      During the past 12 months, have you had either flu vaccine that was sprayed in your nose or flu shot injected into your arm?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Flu vaccine" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pneumovaxever"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("pneumovaxever")}>
                    <FormDescription>
                      Have you ever had a pneumonia shot also known as a pneumococcal vaccine?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pneumonia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tetanuslast10tdap"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("tetanuslast10tdap")}>
                    <FormDescription>
                      Have you received a tetanus shot in the past 10 years? Was this Tdap, the tetanus shot that also has pertussis or whooping cough vaccine?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Tetanus" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">No, did not receive any tetanus shot in the past 10 years</SelectItem>
                      <SelectItem value="2">Yes, received tetanus shot but not sure what type</SelectItem>
                      <SelectItem value="3">Yes, received tetanus shot, but not Tdap</SelectItem>
                      <SelectItem value="1">Yes, received Tdap</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="highrisklastyear"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("highrisklastyear")}>
                    <FormDescription>
                      You have injected any drug other than those prescribed for you in the past year. You have been treated for a sexually transmitted disease or STD in the past year. You have given or received money or drugs in exchange for sex in the past year.
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="High Risk" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Yes</SelectItem>
                      <SelectItem value="0">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="covidpos"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}disabled={!isFieldEnabled("covidpos")}>
                    <FormDescription>
                      Has a doctor, nurse, or other health professional ever told you that you tested positive for COVID 19?
                    </FormDescription>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Covid-19 test" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[0, 2, 1].map((value, index) => (
                        <SelectItem key={index} value={value.toString()}>
                          {['No', 'Yes', 'Tested positive using home test without a health professional'][value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col w-fit gap-4">
              <Button type="submit" disabled={!model} >Submit</Button>
              <Button onClick={handleDownload} disabled={predictionResult === null}>Simpan Hasil</Button>
              {predictionResult !== null && (
                <div className="mt-4 p-4 border rounded bg-gray-100">
                  <h2 className="text-lg font-semibold">Hasil Prediksi:</h2>
                  <p>
                    <strong>Result:</strong> {predictionResult}
                  </p>
                  {confidence !== null && (
                    <p>
                      <strong>Confidence:</strong> {confidence}%
                    </p>
                  )}
                </div>
              )}
            </div>
          </form>
        </Form>
      </div>

      <div className="border-2 border-gray-500 px-4 py-2 shadow-lg rounded-lg max-w-[800px] mb-[100px]">
        <p>Result: {result && (result < 0.5 ? "Doesn't have Heart Disease" : "Have heart disease")}</p>
        <p>Confidence: {result && (result < 0.5 ? `${100 - Number((100 * result).toFixed(2))} %` : `${Number((100 * result).toFixed(2))} %`)}</p>
      </div>
    </main>
  );
}
