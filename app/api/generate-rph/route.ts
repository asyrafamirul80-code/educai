// LETAK FILE NI DI: app/api/generate-rph/route.ts
// (REPLACE/OVERWRITE fail lama sepenuhnya)

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const {
      namaGuru, penggal, minggu, tarikh, tema,
      kelas, masa, subjek, bilMurid,
      bidang, unit, topik, catatanGuru,
    } = await request.json();

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
  "sk": "X.X SK - [Standard Kandungan utama - satu ayat berkaitan topik ${topik}]",
  "spKod": ["X.X.1 SP", "X.X.2 SP", "X.X.3 SP"],
  "spTeks": [
    "[Standard Pembelajaran 1 - murid dapat ...]",
    "[Standard Pembelajaran 2 - murid dapat ...]",
    "[Standard Pembelajaran 3 - murid dapat ...]"
  ],
  "objektif": [
    "[objektif 1] dengan baik",
    "[objektif 2] dengan betul",
    "[objektif 3] dengan baik"
  ],
  "aktiviti": [
    "Set Induksi",
    "Murid mendengar penerangan guru",
    "[Aktiviti utama berkaitan topik ${topik}]",
    "[Aktiviti latihan/praktis murid]",
    "Guru menilai murid"
  ],
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

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Error generating RPH:', error);
    return NextResponse.json({ error: 'Gagal jana RPH' }, { status: 500 });
  }
}