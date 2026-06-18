import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Nama, email, dan pesan wajib diisi' }, { status: 400 });
    }

    // In production: send email notification, save to DB
    // For Phase 1: acknowledge receipt
    return NextResponse.json({
      success: true,
      data: { message: `Terima kasih ${name}, tim kami akan menghubungi Anda dalam 1x24 jam.` },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
