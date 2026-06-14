// LETAK FILE NI DI: app/api/generate-minit/route.ts
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
    const usage = await checkAndLogUsage(user.id, 'minit');

    if (!usage.allowed) {
      return NextResponse.json({
        error: `Had harian tercapai (${usage.limit}x sehari). Naik taraf ke Pro untuk guna tanpa had! 🚀`,
        limitReached: true,
        used: usage.used,
        limit: usage.limit
      }, { status: 429 });
    }

    const {
      namaSekolah, jenisSekolah, namaMesyuarat, bilMesyuarat,
      tahun, tarikh, masa, tempat, pengerusi, setiausaha, ahliMesyuarat, agenda
    } = body;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Kau adalah setiausaha profesional Malaysia. Jana minit mesyuarat rasmi dalam Bahasa Malaysia berdasarkan maklumat berikut.

MAKLUMAT MESYUARAT:
Nama Sekolah: ${namaSekolah}
Jenis Sekolah: ${jenisSekolah}
Nama Mesyuarat: ${namaMesyuarat}
Bil. Mesyuarat: ${bilMesyuarat}
Tahun: ${tahun}
Tarikh: ${tarikh}
Masa: ${masa}
Tempat: ${tempat}
Pengerusi: ${pengerusi}
Setiausaha: ${setiausaha}
Ahli Mesyuarat: ${ahliMesyuarat}
Agenda: ${agenda}

Jana minit mesyuarat yang lengkap dan formal mengikut format KPM. Sertakan semua bahagian standard: ucapan pengerusi, pembentangan agenda, perbincangan, keputusan, dan penangguhan. Gunakan bahasa formal Bahasa Malaysia.`
      }]
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return NextResponse.json({ minit: text, used: usage.used, limit: usage.limit });

  } catch (error) {
    console.error('Error generating minit:', error);
    return NextResponse.json({ error: 'Gagal jana minit mesyuarat' }, { status: 500 });
  }
}
