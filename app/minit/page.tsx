// LETAK FILE NI DI: app/minit/page.tsx
// npm install docx file-saver @types/file-saver

'use client';

import { useState } from 'react';
import {
  Document, Packer, Paragraph, TextRun,
  Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle,
  TabStopType,
} from 'docx';
import { saveAs } from 'file-saver';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AgendaItem { no: string; content: string }
interface Agenda { no: number; tajuk: string; items: AgendaItem[]; tindakan: string | null }
interface Hadir { bil: number; nama: string; jawatan: string }
interface MinitData {
  tajuk: string; tarikh: string; masa: string; tempat: string;
  kehadiran: Hadir[]; tidakHadir: Hadir[]; agendas: Agenda[];
  disediakanOleh: string; disediakanJawatan: string;
  disemakanOleh: string; disemakanJawatan: string;
  disahkanOleh: string; disahkanJawatan: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FONT = 'Arial';
const BODY = 22;  // 11pt
const HEAD = 28;  // 14pt
const TAB  = 900;

const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideH: noBorder, insideV: noBorder };

function r(text: string, bold = false, size = BODY): TextRun {
  return new TextRun({ text, bold, size, font: FONT });
}

function para(
  children: TextRun[],
  align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
  afterSpacing = 80,
  withTab = false,
): Paragraph {
  return new Paragraph({
    children,
    alignment: align,
    spacing: { after: afterSpacing },
    ...(withTab ? { tabStops: [{ type: TabStopType.LEFT, position: TAB }] } : {}),
  });
}

function numbered(no: string, text: string, bold = false): Paragraph {
  return new Paragraph({
    children: [r(no + '\t', bold), r(text, bold)],
    alignment: AlignmentType.BOTH,
    spacing: { after: 80 },
    tabStops: [{ type: TabStopType.LEFT, position: TAB }],
  });
}

function empty(): Paragraph {
  return new Paragraph({ children: [r('')], spacing: { after: 60 } });
}

function tindakan(text: string): Paragraph {
  return new Paragraph({
    children: [r('Tindakan : '), r(text, true)],
    alignment: AlignmentType.RIGHT,
    spacing: { after: 120 },
  });
}

function cell(paras: Paragraph[], widthPct?: number): TableCell {
  return new TableCell({
    children: paras,
    ...(widthPct ? { width: { size: widthPct, type: WidthType.PERCENTAGE } } : {}),
  });
}

// ─── Word Builder ─────────────────────────────────────────────────────────────
function buildDoc(sekolah: string, d: MinitData): Document {
  const kids: Array<Paragraph | Table> = [];

  // Header
  kids.push(para([r((sekolah || '').toUpperCase(), true, HEAD)], AlignmentType.CENTER, 80));
  kids.push(para([r(d.tajuk.toUpperCase(), true, HEAD)], AlignmentType.CENTER, 200));

  // Info table
  kids.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [new TableRow({
      children: [
        cell([
          para([r('Tarikh')], AlignmentType.LEFT, 40),
          para([r('Masa')], AlignmentType.LEFT, 40),
          para([r('Tempat')], AlignmentType.LEFT, 40),
        ], 20),
        cell([
          para([r(':')], AlignmentType.LEFT, 40),
          para([r(':')], AlignmentType.LEFT, 40),
          para([r(':')], AlignmentType.LEFT, 40),
        ], 5),
        cell([
          para([r(d.tarikh)], AlignmentType.LEFT, 40),
          para([r(d.masa)], AlignmentType.LEFT, 40),
          para([r(d.tempat)], AlignmentType.LEFT, 40),
        ], 75),
      ],
    })],
  }));

  kids.push(empty());

  // Kehadiran
  kids.push(para([r('Kehadiran\t:\t')], AlignmentType.LEFT, 80, true));
  d.kehadiran.forEach(h => {
    kids.push(new Paragraph({
      children: [r(`${h.bil}.\t`), r(h.nama.toUpperCase()), r('\t\t\t'), r(h.jawatan.toUpperCase())],
      spacing: { after: 60 },
      tabStops: [
        { type: TabStopType.LEFT, position: 600 },
        { type: TabStopType.LEFT, position: 5040 },
      ],
    }));
  });

  if (d.tidakHadir?.length > 0) {
    kids.push(empty());
    kids.push(para([r('Tidak hadir\t:\t')], AlignmentType.LEFT, 80, true));
    d.tidakHadir.forEach(h => {
      kids.push(new Paragraph({
        children: [r(`${h.bil}.\t`), r(h.nama.toUpperCase()), r('\t\t'), r(h.jawatan.toUpperCase())],
        spacing: { after: 60 },
        tabStops: [{ type: TabStopType.LEFT, position: 600 }, { type: TabStopType.LEFT, position: 5040 }],
      }));
    });
  }

  kids.push(empty());

  // Agendas
  d.agendas.forEach(a => {
    kids.push(numbered(String(a.no), a.tajuk, true));
    a.items.forEach(i => kids.push(numbered(i.no, i.content)));
    if (a.tindakan) kids.push(tindakan(a.tindakan));
    kids.push(empty());
  });

  // Tarikh
  kids.push(para([r('Tarikh : ' + d.tarikh)], AlignmentType.LEFT, 400));

  // Signature table
  const sigSpace = para([r('')], AlignmentType.LEFT, 1200);
  kids.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [
      new TableRow({ children: [
        cell([para([r('Disediakan oleh,')])]),
        cell([para([r('Disemak oleh,')])]),
        cell([para([r('')])]),
        cell([para([r('Disahkan oleh,')])]),
      ]}),
      new TableRow({ children: [
        cell([sigSpace]), cell([sigSpace]), cell([sigSpace]), cell([sigSpace]),
      ]}),
      new TableRow({ children: [
        cell([
          para([r(`( ${d.disediakanOleh.toUpperCase()} )`)]),
          para([r('')]),
          para([r(d.disediakanJawatan)]),
        ]),
        cell([
          para([r(`( ${d.disemakanOleh.toUpperCase()} )`)]),
          para([r('')]),
          para([r(d.disemakanJawatan)]),
        ]),
        cell([para([r('')])]),
        cell([
          para([r(d.disahkanOleh ? `( ${d.disahkanOleh.toUpperCase()} )` : '(                         )')]),
          para([r('')]),
          para([r(d.disahkanJawatan)]),
        ]),
      ]}),
    ],
  }));

  return new Document({
    styles: { default: { document: { run: { font: FONT, size: BODY } } } },
    sections: [{
      properties: { page: { margin: { top: 1152, bottom: 1152, left: 1152, right: 1152 } } },
      children: kids,
    }],
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MinitMesyuarat() {
  const [form, setForm] = useState({
    namaSekolah: '', tajukMesyuarat: '', tarikhMesyuarat: '',
    masaMesyuarat: '', tempatMesyuarat: '', pengerusi: '',
    setiausaha: '', ahliHadir: '', agenda: '',
    poinPerbincangan: '', keputusan: '', tindakanLanjut: '',
  });
  const [result, setResult] = useState<{ data: MinitData; sekolah: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const generate = async () => {
    if (!form.tajukMesyuarat || !form.tarikhMesyuarat || !form.poinPerbincangan) {
      return setError('Sila isi: Tajuk, Tarikh, dan Poin Perbincangan');
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/generate-minit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.error) setError(json.error);
      else setResult(json);
    } catch { setError('Ralat sambungan. Cuba semula.'); }
    finally { setLoading(false); }
  };

  const download = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      const doc = buildDoc(result.sekolah, result.data);
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Minit_${result.data.tarikh.replace(/[/\\:]/g, '-')}.docx`);
    } catch (e) { console.error(e); setError('Gagal jana Word.'); }
    finally { setDownloading(false); }
  };

  const inp = (name: keyof typeof form, label: string, ph: string, req = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{req && <span className="text-red-500"> *</span>}
      </label>
      <input name={name} value={form[name]} onChange={set} placeholder={ph}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );

  const txt = (name: keyof typeof form, label: string, ph: string, rows = 3, req = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{req && <span className="text-red-500"> *</span>}
      </label>
      <textarea name={name} value={form[name]} onChange={set} placeholder={ph} rows={rows}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-blue-600 text-sm hover:underline">← Kembali</a>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">📋 Minit Mesyuarat Auto</h1>
          <p className="text-gray-500 mt-1">Isi poin → Jana → Download Word format rasmi KPM</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          {inp('namaSekolah', 'Nama Sekolah', 'Contoh: SK Taman Melati')}
          {inp('tajukMesyuarat', 'Tajuk Mesyuarat', 'Contoh: Mesyuarat Panitia Pendidikan Islam Bil. 1/2026', true)}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh <span className="text-red-500">*</span></label>
              <input type="date" name="tarikhMesyuarat" value={form.tarikhMesyuarat} onChange={set}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {inp('masaMesyuarat', 'Masa', '3:30 petang')}
          </div>

          {inp('tempatMesyuarat', 'Tempat', 'Bilik Mesyuarat')}
          <div className="grid grid-cols-2 gap-4">
            {inp('pengerusi', 'Pengerusi', 'Nama Pengerusi')}
            {inp('setiausaha', 'Setiausaha', 'Nama Setiausaha')}
          </div>
          {txt('ahliHadir', 'Ahli Hadir', 'Satu nama satu baris:\nCikgu Haslinda\nCikgu Razif')}
          {txt('agenda', 'Agenda', '1. Ucapan Pengerusi\n2. Semakan minit lepas')}
          {txt('poinPerbincangan', 'Poin Perbincangan', 'Tulis bebas — AI akan format jadi minit rasmi', 6, true)}
          {txt('keputusan', 'Keputusan (optional)', 'Keputusan yang diambil')}
          {txt('tindakanLanjut', 'Tindakan Lanjut (optional)', 'Siapa perlu buat apa')}

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <button onClick={generate} disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>Jana minit...
                </span>
              : '📋 Jana Minit Mesyuarat'}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">✅ Minit Siap</h2>
              <button onClick={download} disabled={downloading}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2.5 rounded-lg font-semibold disabled:opacity-50 transition-colors">
                {downloading ? 'Jana...' : '⬇️ Download Word (.docx)'}
              </button>
            </div>
            <div className="border border-gray-100 rounded-xl bg-gray-50 p-5 text-sm space-y-1 max-h-[480px] overflow-y-auto">
              <p className="text-center font-bold">{result.sekolah?.toUpperCase()}</p>
              <p className="text-center font-bold mb-3">{result.data.tajuk}</p>
              <p>Tarikh: {result.data.tarikh} | Masa: {result.data.masa} | Tempat: {result.data.tempat}</p>
              <hr className="my-2"/>
              <p className="font-semibold">Kehadiran:</p>
              {result.data.kehadiran.map(h => <p key={h.bil} className="ml-3">{h.bil}. {h.nama} — {h.jawatan}</p>)}
              <hr className="my-2"/>
              {result.data.agendas.map(a => (
                <div key={a.no} className="mb-2">
                  <p className="font-bold">{a.no}. {a.tajuk}</p>
                  {a.items.map(i => <p key={i.no} className="ml-4 text-gray-700">{i.no} {i.content}</p>)}
                  {a.tindakan && <p className="text-right text-blue-600 font-medium text-xs">Tindakan: {a.tindakan}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}