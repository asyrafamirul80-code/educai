// LETAK FILE NI DI: app/rph/page.tsx
// (REPLACE/OVERWRITE fail lama sepenuhnya)

'use client';

import { useState } from 'react';
import {
  Document, Packer, Paragraph, TextRun,
  Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import { createClient } from '@/lib/supabase'; // ← BARU

// ─── Types ────────────────────────────────────────────────────────────────────
interface RPHPeriod {
  kelas: string;
  masa: string;
  subjek: string;
  bilMurid: string;
  bidang: string;
  unit: string;
  topik: string;
  result: RPHResult | null;
  loading: boolean;
  error: string;
  impakMencapai: string;
  impakBelum: string;
  impakTidakHadir: string;
}

interface RPHResult {
  kelas: string;
  masa: string;
  subjek: string;
  bilMurid: string;
  unit: string;
  bidang: string;
  sk: string;
  spKod: string[];
  spTeks: string[];
  objektif: string[];
  aktiviti: string[];
  emk: string;
  penilaian: string;
  bbm: string[];
}

// ─── Word Helpers ─────────────────────────────────────────────────────────────
const FONT = 'Arial';
const SM   = 18;
const BODY = 20;
const HEAD = 26;

const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const tBorders   = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder, insideH: thinBorder, insideV: thinBorder };
const noBorder   = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders  = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideH: noBorder, insideV: noBorder };

function r(text: string, bold = false, size = SM): TextRun {
  return new TextRun({ text, bold, size, font: FONT });
}
function p(
  children: TextRun[],
  align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
  after = 40,
): Paragraph {
  return new Paragraph({ children, alignment: align, spacing: { after } });
}
function gap(): Paragraph {
  return new Paragraph({ children: [r('')], spacing: { after: 20 } });
}
function tc(children: Paragraph[], widthPct: number, bordered = true): TableCell {
  return new TableCell({
    children,
    borders: bordered ? tBorders : noBorders,
    width: { size: widthPct, type: WidthType.PERCENTAGE },
  });
}

// ─── Build one period table ───────────────────────────────────────────────────
function buildPeriodTable(res: RPHResult, impakMencapai: number, impakBelum: number, impakTidakHadir: number): Table {
  const left: Paragraph[] = [
    p([r('Kelas:', true)]), p([r(res.kelas)]), gap(),
    p([r('Masa:', true)]), p([r(res.masa)]), gap(),
    p([r('Subjek:', true)]), p([r(res.subjek)]), gap(),
    p([r('Bil. Murid:', true)]), p([r(res.bilMurid)]),
  ];

  const mid: Paragraph[] = [];
  if (res.unit)   mid.push(p([r(`Unit: ${res.unit}`)], AlignmentType.RIGHT, 10));
  if (res.bidang) mid.push(p([r(`Bidang: ${res.bidang}`)], AlignmentType.RIGHT, 40));

  mid.push(p([r('Standard Kandungan:', true)], AlignmentType.LEFT, 10));
  mid.push(p([r(res.sk)], AlignmentType.LEFT, 10));
  res.spKod.forEach((kod, i) => {
    if (res.spTeks[i]) mid.push(p([r(`${kod} - ${res.spTeks[i]}`)], AlignmentType.LEFT, 6));
  });
  mid.push(gap());

  mid.push(p([r('Standard Pembelajaran :', true)], AlignmentType.LEFT, 10));
  mid.push(p([r('Pada akhir sesi pengajaran dan pembelajaran, murid akan dapat')], AlignmentType.LEFT, 8));
  res.objektif.forEach((o, i) => mid.push(p([r(`${i + 1}. ${o}`)], AlignmentType.LEFT, 6)));
  mid.push(gap());

  mid.push(p([r('Objektif Pembelajaran :', true)], AlignmentType.LEFT, 10));
  res.aktiviti.forEach((a, i) => mid.push(p([r(`L${i + 1}. ${a}`)], AlignmentType.LEFT, 6)));
  mid.push(gap());

  mid.push(p([r('Aktiviti Pengajaran & Pembelajaran:', true)], AlignmentType.LEFT, 20));
  mid.push(p([r('EMK : ', true), r(res.emk)], AlignmentType.LEFT, 8));
  mid.push(p([r('Penilaian P&P: ', true), r(res.penilaian)], AlignmentType.LEFT, 8));

  const bbm: Paragraph[] = [
    p([r('BBM:', true)], AlignmentType.LEFT, 20),
    ...res.bbm.map((b, i) => p([r(`${i + 1}. ${b}`)], AlignmentType.LEFT, 8)),
  ];

  const impakText = `Impak/Refleksi: ${impakMencapai} orang murid mencapai objektif pengajaran dan pembelajaran. ${impakBelum} murid yang belum mencapai objektif pengajaran dan pembelajaran. ${impakTidakHadir} orang murid tidak hadir`;

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tBorders,
    rows: [
      new TableRow({ children: [tc(left, 15), tc(mid, 65), tc(bbm, 20)] }),
      new TableRow({
        children: [new TableCell({ children: [p([r(impakText)])], columnSpan: 3, borders: tBorders })],
      }),
    ],
  });
}

// ─── Build full document ──────────────────────────────────────────────────────
function buildDoc(
  namaGuru: string, penggal: string, minggu: string,
  tarikh: string, hariTarikh: string, tema: string,
  periods: RPHPeriod[],
): Document {
  const kids: Array<Paragraph | Table> = [];

  kids.push(p([r('RANCANGAN PENGAJARAN HARIAN 每日教学计划', true, HEAD)], AlignmentType.CENTER, 60));
  kids.push(p([r(`NAMA: ${namaGuru.toUpperCase()}`, false, BODY)], AlignmentType.LEFT, 30));

  kids.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [new TableRow({
      children: [
        tc([p([r(`学期 / Penggal：${penggal}`, false, BODY)])], 30, false),
        tc([p([r(`周次 / Minggu：${minggu}`, false, BODY)])], 35, false),
        tc([p([r(`日期 / Tarikh：${tarikh} ( ${hariTarikh} )`, false, BODY)])], 35, false),
      ],
    })],
  }));

  kids.push(p([r(`主题/Tema：${tema}`, false, BODY)], AlignmentType.LEFT, 100));

  periods.forEach((period, i) => {
    if (!period.result) return;
    kids.push(buildPeriodTable(
      period.result,
      parseInt(period.impakMencapai) || 0,
      parseInt(period.impakBelum) || 0,
      parseInt(period.impakTidakHadir) || 0,
    ));
    if (i < periods.length - 1) {
      kids.push(p([r('')], AlignmentType.LEFT, 80));
    }
  });

  return new Document({
    styles: { default: { document: { run: { font: FONT, size: SM } } } },
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } } },
      children: kids,
    }],
  });
}

// ─── Default period ───────────────────────────────────────────────────────────
function newPeriod(): RPHPeriod {
  return {
    kelas: '', masa: '', subjek: '', bilMurid: '30',
    bidang: '', unit: '', topik: '',
    result: null, loading: false, error: '',
    impakMencapai: '0', impakBelum: '0', impakTidakHadir: '0',
  };
}

const SUBJEK_LIST = [
  'Pendidikan Islam','Pendidikan Al-Quran & As-Sunnah','Pendidikan Syariah Islamiah',
  'Bahasa Melayu','Bahasa Inggeris','Matematik','Sains','Sejarah',
  'Pendidikan Jasmani','Pendidikan Seni Visual','Muzik','Bahasa Arab',
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RPHGenerator() {
  const [header, setHeader] = useState({
    namaGuru: '', penggal: '1', minggu: '', tarikh: '', hariTarikh: '', tema: '',
  });
  const [periods, setPeriods] = useState<RPHPeriod[]>([newPeriod()]);
  const [downloading, setDownloading] = useState(false);
  const [headerError, setHeaderError] = useState('');

  const setH = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setHeader(h => ({ ...h, [e.target.name]: e.target.value }));

  const updatePeriod = (i: number, patch: Partial<RPHPeriod>) =>
    setPeriods(ps => ps.map((p, idx) => idx === i ? { ...p, ...patch } : p));

  const addPeriod = () => {
    if (periods.length >= 8) return;
    setPeriods(ps => [...ps, newPeriod()]);
  };

  const removePeriod = (i: number) =>
    setPeriods(ps => ps.filter((_, idx) => idx !== i));

  // ─── GENERATE WITH AUTH ───────────────────────────────────────────────────
  const generatePeriod = async (i: number) => {
    const period = periods[i];
    if (!period.kelas || !period.masa || !period.subjek || !period.topik) {
      updatePeriod(i, { error: 'Sila isi Kelas, Masa, Subjek & Topik' });
      return;
    }
    updatePeriod(i, { loading: true, error: '', result: null });
    try {
      // Get auth token
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        updatePeriod(i, { error: 'Sila log masuk untuk menggunakan ciri ini.', loading: false });
        return;
      }

      const res = await fetch('/api/generate-rph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          namaGuru: header.namaGuru,
          penggal: header.penggal,
          minggu: header.minggu,
          tarikh: header.tarikh,
          tema: header.tema,
          kelas: period.kelas,
          masa: period.masa,
          subjek: period.subjek,
          bilMurid: period.bilMurid,
          bidang: period.bidang,
          unit: period.unit,
          topik: period.topik,
        }),
      });
      const json = await res.json();
      if (json.error) {
        updatePeriod(i, { error: json.error, loading: false });
      } else {
        if (!header.hariTarikh && json.data.hariTarikh) {
          setHeader(h => ({ ...h, hariTarikh: json.data.hariTarikh }));
        }
        updatePeriod(i, { result: json.data, loading: false });
      }
    } catch {
      updatePeriod(i, { error: 'Ralat sambungan. Cuba semula.', loading: false });
    }
  };

  const download = async () => {
    if (!header.namaGuru || !header.tarikh) {
      setHeaderError('Sila isi Nama Guru & Tarikh');
      return;
    }
    const readyPeriods = periods.filter(p => p.result);
    if (readyPeriods.length === 0) {
      setHeaderError('Jana sekurang-kurangnya satu period dahulu');
      return;
    }
    setDownloading(true);
    try {
      const doc = buildDoc(
        header.namaGuru, header.penggal, header.minggu,
        header.tarikh, header.hariTarikh || 'Isnin', header.tema,
        readyPeriods,
      );
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `RPH_${header.tarikh.replace(/[/\\:-]/g, '')}.docx`);
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const doneCount = periods.filter(p => p.result).length;

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <a href="/" className="text-blue-600 text-sm hover:underline">← Kembali</a>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">📚 Penjana RPH</h1>
          <p className="text-gray-500 mt-1">Isi maklumat setiap period → Jana AI → Download satu Word</p>
        </div>

        {/* ── SECTION 1: Header Harian ── */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">📋 Maklumat Harian (Sekali Sahaja)</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Guru <span className="text-red-500">*</span></label>
              <input name="namaGuru" value={header.namaGuru} onChange={setH}
                placeholder="Nama penuh guru"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penggal</label>
                <select name="penggal" value={header.penggal} onChange={setH}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="1">Penggal 1</option>
                  <option value="2">Penggal 2</option>
                  <option value="3">Penggal 3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minggu</label>
                <input name="minggu" value={header.minggu} onChange={setH} placeholder="15"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh <span className="text-red-500">*</span></label>
                <input type="date" name="tarikh" value={header.tarikh} onChange={setH}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tema (optional)</label>
              <input name="tema" value={header.tema} onChange={setH} placeholder="Contoh: Interaksi Sihat"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {headerError && <p className="mt-3 text-red-500 text-sm">{headerError}</p>}
        </div>

        {/* ── SECTION 2: Periods ── */}
        {periods.map((period, i) => (
          <div key={i} className={`bg-white rounded-2xl shadow-sm p-6 border-2 ${period.result ? 'border-green-200' : 'border-transparent'}`}>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <p className="font-semibold text-gray-800 text-sm">Period {i + 1}</p>
                {period.result && <span className="text-green-600 text-sm">✅ Siap</span>}
                {period.loading && <span className="text-blue-500 text-sm animate-pulse">⏳ Jana...</span>}
              </div>
              {periods.length > 1 && (
                <button onClick={() => removePeriod(i)}
                  className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors">
                  Buang ✕
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Kelas *</label>
                  <input value={period.kelas} onChange={e => updatePeriod(i, { kelas: e.target.value })}
                    placeholder="Contoh: 2 Amanah"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Masa *</label>
                  <input value={period.masa} onChange={e => updatePeriod(i, { masa: e.target.value })}
                    placeholder="08:15 - 09:15"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subjek *</label>
                  <select value={period.subjek} onChange={e => updatePeriod(i, { subjek: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">-- Pilih --</option>
                    {SUBJEK_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Bil. Murid</label>
                  <input value={period.bilMurid} onChange={e => updatePeriod(i, { bilMurid: e.target.value })}
                    placeholder="30"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Topik / Tajuk Pelajaran *</label>
                <input value={period.topik} onChange={e => updatePeriod(i, { topik: e.target.value })}
                  placeholder="Contoh: Istinja, Solat Fardu, Pecahan..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Bidang (optional)</label>
                  <input value={period.bidang} onChange={e => updatePeriod(i, { bidang: e.target.value })}
                    placeholder="5 - Bidang Ibadat"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unit (optional)</label>
                  <input value={period.unit} onChange={e => updatePeriod(i, { unit: e.target.value })}
                    placeholder="5.2 - Kebersihan Amalnku"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {period.error && <p className="text-red-500 text-xs">{period.error}</p>}

              {period.result && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-2">
                  <p className="text-xs font-semibold text-yellow-700 mb-2">Impak/Refleksi (isi selepas PdP)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'impakMencapai', label: 'Mencapai' },
                      { key: 'impakBelum', label: 'Belum' },
                      { key: 'impakTidakHadir', label: 'Tidak Hadir' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-xs text-gray-500 mb-1">{label}</label>
                        <input type="number" min="0"
                          value={period[key as keyof RPHPeriod] as string}
                          onChange={e => updatePeriod(i, { [key]: e.target.value } as Partial<RPHPeriod>)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => generatePeriod(i)}
                disabled={period.loading}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                  period.result
                    ? 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                {period.loading
                  ? <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>Jana AI...
                    </span>
                  : period.result ? '🔄 Jana Semula' : '✨ Jana AI untuk Period Ini'}
              </button>
            </div>
          </div>
        ))}

        {periods.length < 8 && (
          <button onClick={addPeriod}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 font-medium text-sm transition-colors">
            + Tambah Period ({periods.length}/8)
          </button>
        )}

        {doneCount > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-gray-900">✅ {doneCount}/{periods.length} period siap</p>
                <p className="text-sm text-gray-500">Download akan include semua period yang dah jana</p>
              </div>
            </div>
            <button onClick={download} disabled={downloading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-colors text-base">
              {downloading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>Jana Word...
                  </span>
                : `⬇️ Download RPH (${doneCount} Period) — Word .docx`}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
