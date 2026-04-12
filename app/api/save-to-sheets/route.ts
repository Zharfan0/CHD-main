import { NextResponse } from "next/server";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxcjP62n-TkH9gXYvn_xjyqmcjd3-QXDXx1QwFBRdLaQRDtl5ZIb_mTSbtzehBDYA3O-g/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("Menyimpan data ke Google Sheet:", body);

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    console.log("Response dari Google Apps Script:", result);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      throw new Error(result.error || "Gagal menyimpan ke sheet");
    }
  } catch (error) {
    console.error("Error saving to sheet:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}