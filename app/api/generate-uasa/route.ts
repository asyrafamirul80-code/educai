// LETAK FILE NI DI: app/api/generate-uasa/route.ts

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const {
      mataPelajaran,
      tahun,
      topik,
      bilanganSoalanA,
      bilanganSoalanB,
      tingkatan,
    } = await request.json();

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Kau adalah guru pakar ${mataPelajaran} Malaysia. Jana soalan peperiksaan format UASA (Ujian Akhir Sekolah Agama) berdasarkan maklumat berikut.

MAKLUMAT:
Mata Pelajaran: ${mataPelajaran}
Tahun/Tingkatan: ${tahun || 'Tahun 6'}
Topik: ${topik}
Bilangan Soalan Bahagian A (MCQ): ${bilanganSoalanA || 10}
Bilangan Soalan Bahagian B (Berstruktur): ${bilanganSoalanB || 5}

Jana soalan dalam BAHASA MALAYSIA yang betul, relevan dengan topik, dan sesuai dengan tahap murid.

Balas HANYA JSON sah (tiada markdown, tiada \`\`\`). Format tepat:
{
  "mataPelajaran": "${mataPelajaran}",
  "tahun": "${tahun || 'Tahun 6'}",
  "topik": "${topik}",
  "bahagianA": [
    {
      "no": 1,
      "soalan": "Teks soalan di sini",
      "pilihan": {
        "A": "Pilihan A",
        "B": "Pilihan B",
        "C": "Pilihan C",
        "D": "Pilihan D"
      },
      "jawapan": "A"
    }
  ],
  "bahagianB": [
    {
      "no": 1,
      "jenis": "isi_tempat_kosong",
      "arahan": "Isi tempat kosong dengan jawapan yang betul.",
      "soalan": "________ ialah rukun Islam yang pertama.",
      "jawapan": "Mengucap dua kalimah syahadah"
    },
    {
      "no": 2,
      "jenis": "betul_salah",
      "arahan": "Tandakan (✓) untuk betul dan (✗) untuk salah.",
      "soalan": "Solat Subuh mempunyai dua rakaat.",
      "jawapan": "Betul (✓)"
    },
    {
      "no": 3,
      "jenis": "padankan",
      "arahan": "Padankan perkara di lajur A dengan lajur B.",
      "soalan": "Padankan nama nabi dengan mukjizat masing-masing.",
      "pasangan": [
        {"lajur_a": "Nabi Musa a.s.", "lajur_b": "Membelah laut"},
        {"lajur_a": "Nabi Isa a.s.", "lajur_b": "Menghidupkan orang mati"},
        {"lajur_a": "Nabi Ibrahim a.s.", "lajur_b": "Tidak terbakar api"}
      ],
      "jawapan": "Lihat pasangan di atas"
    },
    {
      "no": 4,
      "jenis": "pendek",
      "arahan": "Jawab soalan berikut dengan lengkap.",
      "soalan": "Nyatakan dua kepentingan membaca Al-Quran.",
      "jawapan": "1. Mendapat pahala daripada Allah SWT\\n2. Mendekatkan diri kepada Allah SWT"
    },
    {
      "no": 5,
      "jenis": "susun",
      "arahan": "Susun semula perkataan berikut untuk membentuk ayat yang betul.",
      "soalan": "beribadah / kepada / wajib / Allah / kita",
      "jawapan": "Kita wajib beribadah kepada Allah"
    }
  ]
}

PENTING:
- Jana TEPAT ${bilanganSoalanA || 10} soalan untuk bahagianA
- Jana TEPAT ${bilanganSoalanB || 5} soalan untuk bahagianB
- Semua soalan mesti berkaitan dengan topik: ${topik}
- Gunakan pelbagai jenis soalan bahagian B (isi_tempat_kosong, betul_salah, padankan, pendek, susun)
- Jawapan mesti tepat dan betul`
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

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Error generating UASA:', error);
    return NextResponse.json({ error: 'Gagal jana soalan UASA' }, { status: 500 });
  }
}