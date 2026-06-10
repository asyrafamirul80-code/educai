import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  const { mataPelajaran, tahun, topik, tarikh, masa, bilMurid, tema, minggu, penggal, nama } = await request.json();

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `Buat RPH (Rancangan Pengajaran Harian) format KPM Malaysia yang RINGKAS seperti contoh berikut:

Format output (IKUT TEPAT-TEPAT):

Mata Pelajaran: ${mataPelajaran}
Kelas/Tahun: ${tahun}
Masa: ${masa} minit
Bil. Murid: ${bilMurid || '__'}
Tema: ${tema || '__'}
Penggal: ${penggal || '1'} | Minggu: ${minggu || '__'} | Tarikh: ${tarikh}

---

Standard Kandungan (SK):
[tulis SK yang berkaitan dengan topik ${topik}]

Standard Pembelajaran (SP):
[tulis 2-3 SP yang berkaitan]

Objektif Pembelajaran:
Pada akhir sesi, murid dapat:
1. [objektif 1]
2. [objektif 2]
3. [objektif 3]

Aktiviti PdP:
L1. Set Induksi
L2. Murid mendengar penerangan guru
L3. [aktiviti utama 1 berkaitan ${topik}]
L4. [aktiviti utama 2]
L5. Guru menilai murid

BBM:
1. [bahan 1]
2. [bahan 2]

Nilai: [nilai-nilai murni]
EMK: Bahasa, Nilai Murni, Kemahiran Berfikir
Penilaian P&P: [cara penilaian]

Impak/Refleksi:
___ orang murid mencapai objektif. ___ orang murid belum mencapai objektif. ___ orang murid tidak hadir.

---
Tulis dalam Bahasa Malaysia. RINGKAS dan TEPAT sahaja. Jangan panjangkan.`
    }]
  });

  return NextResponse.json({ 
    rph: message.content[0].type === 'text' ? message.content[0].text : '' 
  });
}