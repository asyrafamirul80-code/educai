// LETAK FILE NI DI: app/uasa/page.tsx

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
interface Pilihan { A: string; B: string; C: string; D: string }
interface SoalanA { no: number; soalan: string; pilihan: Pilihan; jawapan: string }
interface Pasangan { lajur_a: string; lajur_b: string }
interface SoalanB {
  no: number;
  jenis: 'isi_tempat_kosong' | 'betul_salah' | 'padankan' | 'pendek' | 'susun';
  arahan: string;
  soalan: string;
  pasangan?: Pasangan[];
  jawapan: string;
}
interface UASAData {
  mataPelajaran: string;
  tahun: string;
  topik: string;
  bahagianA: SoalanA[];
  bahagianB: SoalanB[];
}

// ─── Word Helpers ─────────────────────────────────────────────────────────────
const FONT = 'Arial';
const BODY = 22;   // 11pt
const HEAD = 28;   // 14pt
const SUBH = 24;   // 12pt
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideH: noBorder, insideV: noBorder };

function r(text: string, bold = false, size = BODY): TextRun {
  return new TextRun({ text, bold, size, font: FONT });
}
function p(children: TextRun[], align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT, after = 80): Paragraph {
  return new Paragraph({ children, alignment: align, spacing: { after } });
}
function empty(): Paragraph {
  return new Paragraph({ children: [r('')], spacing: { after: 60 } });
}
function cell(paras: Paragraph[], widthPct?: number): TableCell {
  return new TableCell({
    children: paras,
    borders: noBorders,
    ...(widthPct ? { width: { size: widthPct, type: WidthType.PERCENTAGE } } : {}),
  });
}

// ─── Word Builder ─────────────────────────────────────────────────────────────
function buildDoc(d: UASAData, showJawapan: boolean): Document {
  const kids: Array<Paragraph | Table> = [];

  // Header
  kids.push(p([r(d.mataPelajaran.toUpperCase(), true, HEAD)], AlignmentType.CENTER, 40));
  kids.push(p([r(`${d.tahun} | Topik: ${d.topik}`, false, SUBH)], AlignmentType.CENTER, 40));
  kids.push(p([r('Nama: __________________________________ Kelas: ______________')], AlignmentType.LEFT, 200));

  // ─── BAHAGIAN A ───
  kids.push(p([r('BAHAGIAN A', true, SUBH)], AlignmentType.LEFT, 40));
  kids.push(p([r('Bulatkan jawapan yang betul.', false, BODY)], AlignmentType.LEFT, 120));

  d.bahagianA.forEach(s => {
    // Soalan
    kids.push(new Paragraph({
      children: [r(`${s.no}.\t`, true), r(s.soalan)],
      spacing: { after: 60 },
      tabStops: [{ type: TabStopType.LEFT, position: 500 }],
    }));

    // Pilihan dalam 2 kolum
    kids.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorders,
      rows: [
        new TableRow({ children: [
          cell([p([r('A.  ' + s.pilihan.A)])], 50),
          cell([p([r('B.  ' + s.pilihan.B)])], 50),
        ]}),
        new TableRow({ children: [
          cell([p([r('C.  ' + s.pilihan.C)])], 50),
          cell([p([r('D.  ' + s.pilihan.D)])], 50),
        ]}),
      ],
    }));

    if (showJawapan) {
      kids.push(p([r(`[Jawapan: ${s.jawapan}]`, true)], AlignmentType.RIGHT, 40));
    }
    kids.push(empty());
  });

  kids.push(empty());

  // ─── BAHAGIAN B ───
  kids.push(p([r('BAHAGIAN B', true, SUBH)], AlignmentType.LEFT, 80));

  d.bahagianB.forEach(s => {
    kids.push(p([r(`${s.no}.  `, true), r(s.arahan, false, BODY)], AlignmentType.LEFT, 60));
    kids.push(empty());

    if (s.jenis === 'padankan' && s.pasangan) {
      kids.push(p([r(s.soalan)], AlignmentType.LEFT, 80));
      kids.push(new Table({
        width: { size: 80, type: WidthType.PERCENTAGE },
        borders: noBorders,
        rows: s.pasangan.map(pair => new TableRow({
          children: [
            cell([p([r(pair.lajur_a)])], 45),
            cell([p([r('─────────────────')])], 10),
            cell([p([r(pair.lajur_b)])], 45),
          ],
        })),
      }));
    } else if (s.jenis === 'betul_salah') {
      kids.push(new Paragraph({
        children: [r('(   )\t'), r(s.soalan)],
        spacing: { after: 80 },
        tabStops: [{ type: TabStopType.LEFT, position: 400 }],
      }));
    } else {
      kids.push(p([r(s.soalan)], AlignmentType.LEFT, 120));
      // Baris kosong untuk jawapan
      kids.push(p([r('Jawapan: _______________________________________________')], AlignmentType.LEFT, 60));
    }

    if (showJawapan) {
      kids.push(p([r(`[Jawapan: ${s.jawapan}]`, true)], AlignmentType.RIGHT, 40));
    }

    kids.push(empty());
    kids.push(empty());
  });

  return new Document({
    styles: { default: { document: { run: { font: FONT, size: BODY } } } },
    sections: [{
      properties: { page: { margin: { top: 1152, bottom: 1152, left: 1152, right: 1152 } } },
      children: kids,
    }],
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UASAGenerator() {
  const [form, setForm] = useState({
    mataPelajaran: '',
    tahun: 'Tahun 6',
    topik: '',
    bilanganSoalanA: '10',
    bilanganSoalanB: '5',
  });
  const [result, setResult] = useState<UASAData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const generate = async () => {
    if (!form.mataPelajaran || !form.topik) {
      return setError('Sila isi: Mata Pelajaran dan Topik');
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/generate-uasa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.error) setError(json.error);
      else setResult(json.data);
    } catch { setError('Ralat sambungan. Cuba semula.'); }
    finally { setLoading(false); }
  };

  const download = async (showJawapan: boolean) => {
    if (!result) return;
    setDownloading(true);
    try {
      const doc = buildDoc(result, showJawapan);
      const blob = await Packer.toBlob(doc);
      const suffix = showJawapan ? '_Skema' : '_Soalan';
      saveAs(blob, `UASA_${result.topik.replace(/\s+/g, '_')}${suffix}.docx`);
    } catch (e) { console.error(e); setError('Gagal jana Word.'); }
    finally { setDownloading(false); }
  };

  const TAHUN_OPTIONS = ['Tahun 1','Tahun 2','Tahun 3','Tahun 4','Tahun 5','Tahun 6'];
  const SUBJEK_OPTIONS = [
    'Pendidikan Islam','Pendidikan Al-Quran & As-Sunnah',
    'Pendidikan Syariah Islamiah','Pendidikan Akhlak Islamiah',
    'Bahasa Arab','Jawi',
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-blue-600 text-sm hover:underline">← Kembali</a>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">📝 Penjana Soalan UASA</h1>
          <p className="text-gray-500 mt-1">Isi topik → AI jana soalan exam format UASA → Download Word</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">

          {/* Mata Pelajaran */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mata Pelajaran <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select name="mataPelajaran" value={form.mataPelajaran} onChange={set}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">-- Pilih Mata Pelajaran --</option>
                {SUBJEK_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Tahun + Bilangan */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
              <select name="tahun" value={form.tahun} onChange={set}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {TAHUN_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soalan A (MCQ)</label>
              <select name="bilanganSoalanA" value={form.bilanganSoalanA} onChange={set}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {['5','10','15','20'].map(n => <option key={n} value={n}>{n} soalan</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soalan B (Berstruktur)</label>
              <select name="bilanganSoalanB" value={form.bilanganSoalanB} onChange={set}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {['3','5','8','10'].map(n => <option key={n} value={n}>{n} soalan</option>)}
              </select>
            </div>
          </div>

          {/* Topik */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topik / Tajuk <span className="text-red-500">*</span>
            </label>
            <input name="topik" value={form.topik} onChange={set}
              placeholder="Contoh: Rukun Islam, Solat Fardu, Sifat-sifat Allah..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <button onClick={generate} disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>Jana soalan...
                </span>
              : '📝 Jana Soalan UASA'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">✅ Soalan Siap Jana</h2>
                <p className="text-sm text-gray-500">{result.mataPelajaran} | {result.tahun} | {result.topik}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => download(false)} disabled={downloading}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2.5 rounded-lg font-semibold disabled:opacity-50 transition-colors">
                  ⬇️ Download Soalan
                </button>
                <button onClick={() => download(true)} disabled={downloading}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2.5 rounded-lg font-semibold disabled:opacity-50 transition-colors">
                  ⬇️ Download + Skema
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
              {(['A','B'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  Bahagian {tab} {tab === 'A' ? `(${result.bahagianA.length} MCQ)` : `(${result.bahagianB.length} Soalan)`}
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="border border-gray-100 rounded-xl bg-gray-50 p-5 text-sm space-y-4 max-h-[500px] overflow-y-auto">
              {activeTab === 'A' && result.bahagianA.map(s => (
                <div key={s.no} className="border-b border-gray-200 pb-4 last:border-0">
                  <p className="font-medium mb-2">{s.no}. {s.soalan}</p>
                  <div className="grid grid-cols-2 gap-1 ml-4">
                    {(['A','B','C','D'] as const).map(opt => (
                      <p key={opt} className={`${s.jawapan === opt ? 'text-green-600 font-semibold' : 'text-gray-700'}`}>
                        {opt}. {s.pilihan[opt]}
                        {s.jawapan === opt && ' ✓'}
                      </p>
                    ))}
                  </div>
                </div>
              ))}

              {activeTab === 'B' && result.bahagianB.map(s => (
                <div key={s.no} className="border-b border-gray-200 pb-4 last:border-0">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded mb-1">
                    {s.jenis.replace(/_/g,' ').toUpperCase()}
                  </span>
                  <p className="text-gray-500 text-xs mb-1">{s.arahan}</p>
                  <p className="font-medium mb-1">{s.no}. {s.soalan}</p>
                  {s.pasangan && (
                    <div className="ml-4 space-y-1">
                      {s.pasangan.map((pair, i) => (
                        <p key={i} className="text-gray-600">{pair.lajur_a} ←→ {pair.lajur_b}</p>
                      ))}
                    </div>
                  )}
                  <p className="text-green-600 text-xs mt-1">✓ Jawapan: {s.jawapan}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}