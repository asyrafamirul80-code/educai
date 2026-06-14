// LETAK FILE NI DI: app/api/generate-rph/route.ts
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
    const usage = await checkAndLogUsage(user.id, 'rph');

    if (!usage.allowed) {
      return NextResponse.json({
        error: `Had harian tercapai (${usage.limit}x sehari). Naik taraf ke Pro untuk guna tanpa had! 🚀`,
        limitReached: true,
        used: usage.used,
        limit: usage.limit
      }, { status: 429 });
    }

    const {
      namaGuru, penggal, minggu, tarikh, tema,
      kelas, masa, subjek, bilMurid,
      bidang, unit, topik, catatanGuru,
    } = body;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `Kau adalah guru pakar Malaysia. Jana RPH (Rancangan Pengajaran Harian) berformat rasmi KPM berdasarkan maklumat berikut.

MAKLUMAT:
Nama Guru: ${namaGuru}
Penggal: ${penggal}
Minggu: ${minggu}
Tarikh: ${tarikh}
Tema: ${tema || topik}
Kelas: ${kelas}
Masa: ${masa}
Subjek: ${subjek}
Bil Murid: ${bilMurid}
Bidang: ${bidang || ''}
Unit: ${unit || topik}
Topik: ${topik}
Catatan: ${catatanGuru || ''}

Balas HANYA JSON sah (tiada markdown, tiada \`\`\`):
{
  "namaGuru": "${namaGuru}",
  "penggal": "${penggal}",
  "minggu": "${minggu}",
  "tarikh": "${tarikh}",
  "hariTarikh": "[tentukan hari: Isnin/Selasa/Rabu/Khamis/Jumaat berdasarkan tarikh, atau Rabu jika tidak pasti]",
  "tema": "${tema || topik}",
  "kelas": "${kelas}",
  "masa": "${masa}",
  "subjek": "${subjek}",
  "bilMurid": "${bilMurid}",
  "unit": "${unit || topik}",
  "bidang": "${bidang || ''}",
  "sk": "X.X SK - [Standard Kandungan utama]",
  "spKod": ["X.X.1 SP", "X.X.2 SP", "X.X.3 SP"],
  "spTeks": ["[SP 1]", "[SP 2]", "[SP 3]"],
  "objektif": ["[objektif 1]", "[objektif 2]", "[objektif 3]"],
  "aktiviti": ["Set Induksi", "Penerangan guru", "[Aktiviti utama]", "[Latihan murid]", "Penilaian"],
  "emk": "Bahasa, Nilai Murni, Kemahiran Berfikir",
  "penilaian": "Buku aktiviti, Pemerhatian",
  "bbm": ["Buku aktiviti", "Buku Teks"],
  "impakMencapai": 0,
  "impakBelum": 0,
  "impakTidakHadir": 0
}

Isi semua field berdasarkan topik "${topik}" untuk mata pelajaran "${subjek}". Bahasa Malaysia formal.`,
      }],
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
    console.error('Error generating RPH:', error);
    return NextResponse.json({ error: 'Gagal jana RPH' }, { status: 500 });
  }
}
