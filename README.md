🫀 Coronary Heart Disease Early Detection System
📌 Nama Aplikasi

Coronary Heart Disease (CHD) Early Detection Web Application

A web-based application for early detection of coronary heart disease using multiple machine learning models.

📖 Deskripsi Singkat

Aplikasi ini memungkinkan pengguna melakukan prediksi dini penyakit jantung koroner berdasarkan data kesehatan responden. Sistem mendukung tiga pendekatan model machine learning:

CNN-LSTM

Random Forest

Mutual Information + Random Forest

🧑‍💻 Cara Menggunakan Aplikasi

Buka aplikasi melalui browser

Pilih model prediksi:

CNN-LSTM

Random Forest

Mutual Information + Random Forest

Isi seluruh form sesuai data responden

Klik Submit

Sistem menampilkan hasil prediksi dan confidence score

Hasil dapat diunduh dalam bentuk file teks

⚙️ Persyaratan / Requirements
Frontend

Node.js ≥ 18

npm / yarn

Browser modern (Chrome / Edge / Firefox)

Backend (Opsional untuk RF & MI-RF)

Python ≥ 3.9

FastAPI

scikit-learn

pandas

numpy

uvicorn

🛠️ Langkah Instalasi Awal (Initial Setup)
Clone Repository
git clone https://github.com/Zharfan0/CHD-main.git
cd CHD-main

💻 Langkah Pengembangan Lokal (Local Development Steps)
Frontend (Next.js)
npm install
npm run dev


Akses di:

http://localhost:3000

Backend (FastAPI – Optional)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload


Akses API:

http://localhost:8000


Endpoint:

/predict/rf

/predict/mi

🚀 Langkah Deploy untuk Versi Produksi (Production Deployment Steps)
Frontend

Deploy menggunakan Vercel

Build otomatis dari repository GitHub

Backend

Backend tidak dijalankan di browser dan harus dideploy di server terpisah.

Opsi deployment backend:

Server internal kampus

Cloud service (Render, VPS, atau server institusi)

Command produksi:

uvicorn main:app --host 0.0.0.0 --port 8000

🧠 Arsitektur Sistem

Client-side inference: CNN-LSTM (TensorFlow.js)

Server-side inference: Random Forest & MI-RF (FastAPI)

Frontend–Backend communication: REST API (JSON)

🔐 Keamanan

Tidak menyimpan data pengguna

Tidak melakukan training online

Model hanya digunakan untuk inference

Aman untuk deployment institusional

📚 Teknologi yang Digunakan

Next.js

React Hook Form

TensorFlow.js

FastAPI

scikit-learn

Zod

Tailwind CSS

📄 Lisensi

Academic & Research Use Only
