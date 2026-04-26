import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Buat tabel jika belum ada
    await sql`
      CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT NOW(),
        name TEXT,
        model_used TEXT,
        result TEXT,
        confidence FLOAT,
        raw_data JSONB
      )
    `;

    // Simpan data
    await sql`
      INSERT INTO predictions (name, model_used, result, confidence, raw_data)
      VALUES (${data.nama}, ${data.selectedModel}, ${data.hasilPrediksi}, ${data.confidence}, ${JSON.stringify(data)})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}