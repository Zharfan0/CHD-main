##### **Root Project:**



app/			Frontend Next.js (UI \& form input pengguna)

backend/		Backend FastAPI + Model Machine Learning

components/		Komponen UI (Form, Card, Dropdown, dsb)

lib/			Logic pendukung (schema, featureMap, metadata field)

public/			Asset publik (icon, gambar)

package.json		Dependency frontend

requirements.txt	Dependency backend Python

next.config.mjs		Konfigurasi Next.js

README.md		Dokumentasi proyek



##### folder **backend/**

###### **File               Fungsi**

**main.py			Entry point FastAPI**

**model\_rf.pkl		Model Random Forest**

**model\_mi.pkl		Model Mutual Information + RF**

**model\_mi\_best.pkl	Model terbaik hasil tuning**

**requirements.txt	Library Python (FastAPI, sklearn, dll)**

**\_\_pycache\_\_/		Cache Python (tidak wajib upload ulang)**



**Notulen:**

* Folder backend/ HARUS diupload utuh
* Semua file .pkl WAJIB ada
* Backend dijalankan dengan FastAPI (Uvicorn)



##### **folder untuk Frontend**

Folder ini penting untuk logika dinamis form



###### folder **App/ (Next.js App Router)**

File		**Fungsi**

layout.tsx	Layout utama aplikasi

page.tsx	Halaman utama form prediksi

globals.css	Styling global



###### folder **/lib**

**File**			**Fungsi**

featureMap.ts		Mapping fitur berdasarkan model

fieldMetadata.ts	Label \& deskripsi input

createSchema.ts		Schema validasi form

utils.ts		Helper function



##### **ALUR KERJA SISTEM**

1. Pengguna mengakses website melalui frontend (Next.js).
2. Pengguna mengisi form data kesehatan dan memilih model prediksi.
3. Data dikirim ke backend FastAPI (/backend).
4. Backend memproses data menggunakan model Machine Learning dan mengembalikan hasil prediksi ke frontend.
5. Frontend menampilkan hasil prediksi dan confidence score.
