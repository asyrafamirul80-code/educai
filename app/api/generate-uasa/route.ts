// LETAK FILE NI DI: app/api/generate-uasa/route.ts
// (REPLACE/OVERWRITE fail lama sepenuhnya)

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, checkAndLogUsage } from '@/lib/supabase-server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // CHECK AUTH
    const supabase = createServerClient();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({
        error: 'Sila log masuk untuk menggunakan ciri ini.',
        requireLogin: true
      }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({
        error: 'Sesi tamat. Sila log masuk semula.',
        requireLogin: true
      }, { status: 401 });
    }

    // CHECK USAGE LIMIT
    const usage = await checkAndLogUsage(user.id, 'uasa');

    if (!usage.allowed) {
      return NextResponse.json({
        error: `Had harian tercapai (${usage.limit}x sehari). Naik taraf ke Pro untuk guna tanpa had! 🚀`,
        limitReached: true,
        used: usage.used,
        limit: usage.limit
      }, { status: 429 });
    }

    const { mataPelajaran, tahun, topik, bilanganSoalanA, bilanganSoalanB } = body;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Kau adalah guru pakar Malaysia. Jana soalan peperiksaan format UASA berdasarkan maklumat berikut.

Mata Pelajaran: ${mataPelajaran}
Tahun: ${tahun}
Topik: ${topik}
Bilangan Soalan Bahagian A (Objektif): ${bilanganSoalanA}
Bilangan Soalan Bahagian B (Subjektif): ${bilanganSoalanB}

Balas HANYA JSON sah (tiada markdown, tiada backtick):
{
  "bahagianA": [
    {
      "no": 1,
      "soalan": "teks soalan",
      "pilihan": ["A. pilihan1", "B. pilihan2", "C. pilihan3", "D. pilihan4"],
      "jawapan": "A"
    }
  ],
  "bahagianB": [
    {
      "no": 1,
      "jenis": "isi_tempat_kosong",
      "soalan": "teks soalan dengan ___",
      "jawapan": "jawapan"
    }
  ]
}

Jana ${bilanganSoalanA} soalan objektif (4 pilihan A-D) dan ${bilanganSoalanB} soalan subjektif pelbagai jenis untuk topik ${topik}.`
      }]
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let data;
    try {
      data = JSON.parse(clean);
    } catch {
      return NextResponse.json({ error: 'Format error. Cuba semula.' }, { status: 500 });
    }

    return NextResponse.json({ data, used: usage.used, limit: usage.limit });

  } catch (error) {
    console.error('Error generating UASA:', error);
    return NextResponse.json({ error: 'Gagal jana soalan UASA' }, { status: 500 });
  }
}
