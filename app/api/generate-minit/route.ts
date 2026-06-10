// LETAK FILE NI DI: app/api/generate-minit/route.ts

import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const {
      namaSekolah, tajukMesyuarat, tarikhMesyuarat, masaMesyuarat,
      tempatMesyuarat, pengerusi, setiausaha, ahliHadir,
      agenda, poinPerbincangan, keputusan, tindakanLanjut,
    } = await request.json();

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `Kau adalah setiausaha profesional sekolah Malaysia. Jana minit mesyuarat rasmi berdasarkan maklumat ini.

MAKLUMAT:
Sekolah: ${namaSekolah || 'SK'}
Tajuk: ${tajukMesyuarat}
Tarikh: ${tarikhMesyuarat}
Masa: ${masaMesyuarat || ''}
Tempat: ${tempatMesyuarat || 'Bilik Mesyuarat'}
Pengerusi: ${pengerusi || ''}
Setiausaha: ${setiausaha || ''}
Ahli Hadir: ${ahliHadir}
Agenda: ${agenda || ''}
Perbincangan: ${poinPerbincangan}
Keputusan: ${keputusan || ''}
Tindakan Lanjut: ${tindakanLanjut || ''}

Balas HANYA JSON sah (tiada markdown, tiada \`\`\`). Format tepat:
{
  "tajuk": "MINIT MESYUARAT [TAJUK] BIL. 1/2026",
  "tarikh": "13 Januari 2026 (Selasa)",
  "masa": "3:30 petang",
  "tempat": "Bilik Mesyuarat",
  "kehadiran": [
    {"bil": 1, "nama": "NAMA PENUH", "jawatan": "PENGERUSI"},
    {"bil": 2, "nama": "NAMA SETIAUSAHA", "jawatan": "SETIAUSAHA"},
    {"bil": 3, "nama": "NAMA AHLI", "jawatan": "GURU MATA PELAJARAN"}
  ],
  "tidakHadir": [],
  "agendas": [
    {
      "no": 1,
      "tajuk": "Ucapan Pengerusi",
      "items": [
        {"no": "1.1", "content": "Pengerusi mengucapkan terima kasih kepada semua ahli yang hadir."},
        {"no": "1.2", "content": "Pengerusi mengingatkan semua ahli tentang kepentingan mesyuarat ini."}
      ],
      "tindakan": "Makluman"
    },
    {
      "no": 2,
      "tajuk": "Membentang dan mengesahkan minit mesyuarat yang lepas",
      "items": [
        {"no": "2.1", "content": "Minit mesyuarat yang lepas dibentangkan oleh setiausaha dan telah disahkan oleh semua ahli."}
      ],
      "tindakan": "Setiausaha"
    },
    {
      "no": 3,
      "tajuk": "Perkara berbangkit",
      "items": [
        {"no": "3.1", "content": "Tiada perkara berbangkit."}
      ],
      "tindakan": null
    },
    {
      "no": 4,
      "tajuk": "Perkara yang dibincangkan",
      "items": [
        {"no": "4.1", "content": "[Tajuk perbincangan pertama berdasarkan maklumat di atas]"},
        {"no": "4.1.1", "content": "[Butiran perbincangan - berdasarkan poinPerbincangan yang diberikan]"},
        {"no": "4.1.2", "content": "[Keputusan atau cadangan yang diambil]"},
        {"no": "4.2", "content": "[Tajuk perbincangan kedua jika ada]"},
        {"no": "4.2.1", "content": "[Butiran]"}
      ],
      "tindakan": "Semua guru"
    },
    {
      "no": 5,
      "tajuk": "Hal-hal lain",
      "items": [
        {"no": "5.1", "content": "[Hal-hal lain berdasarkan keputusan dan tindakan lanjut yang diberikan]"}
      ],
      "tindakan": "Semua guru"
    },
    {
      "no": 6,
      "tajuk": "Ucapan penangguhan",
      "items": [
        {"no": "6.1", "content": "Pengerusi mengucapkan terima kasih kepada semua ahli dan menangguhkan mesyuarat untuk kali ini."},
        {"no": "6.2", "content": "Mesyuarat ditangguhkan pada jam [masa tamat]."}
      ],
      "tindakan": null
    }
  ],
  "disediakanOleh": "${setiausaha || 'Setiausaha'}",
  "disediakanJawatan": "Setiausaha Mesyuarat",
  "disemakanOleh": "${pengerusi || 'Pengerusi'}",
  "disemakanJawatan": "Pengerusi",
  "disahkanOleh": "",
  "disahkanJawatan": "PK Pentadbiran"
}

PENTING: Isi semua content berdasarkan maklumat perbincangan yang diberikan. Tulis dalam Bahasa Malaysia formal.`
      }]
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let data;
    try {
      data = JSON.parse(clean);
    } catch {
      // Fallback: return the raw text if JSON parse fails
      return NextResponse.json({ error: 'Format error. Cuba semula.' }, { status: 500 });
    }

    return NextResponse.json({ data, sekolah: namaSekolah });

  } catch (error) {
    console.error('Error generating minit:', error);
    return NextResponse.json({ error: 'Gagal jana minit mesyuarat' }, { status: 500 });
  }
}