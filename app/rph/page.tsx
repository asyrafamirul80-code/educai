'use client';
import { useState } from 'react';

export default function RPHGenerator() {
  const [form, setForm] = useState({
    mataPelajaran: '',
    tahun: '',
    topik: '',
    tarikh: '',
    masa: '60',
    bilMurid: '',
    tema: '',
    minggu: '',
    penggal: '1',
    nama: '',
  });
  const [rph, setRph] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setRph('');
    try {
      const res = await fetch('/api/generate-rph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setRph(data.rph);
    } catch (e) {
      setRph('Error: Cuba semula.');
    }
    setLoading(false);
  };

  const copyText = () => navigator.clipboard.writeText(rph);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <a href="/" className="text-blue-600 text-sm">← Balik</a>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">📝 RPH Generator</h1>
        <p className="text-gray-500 text-sm mb-6">Format KPM • Siap dalam 30 saat</p>

        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4 mb-6">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Guru</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="cth: Cikgu Amir"
              value={form.nama}
              onChange={e => setForm({...form, nama: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="cth: Matematik"
                value={form.mataPelajaran}
                onChange={e => setForm({...form, mataPelajaran: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun / Kelas</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.tahun}
                onChange={e => setForm({...form, tahun: e.target.value})}>
                <option value="">Pilih</option>
                {['1','2','3','4','5','6'].map(t => (
                  <option key={t} value={`Tahun ${t}`}>Tahun {t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topik</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="cth: Pecahan"
              value={form.topik}
              onChange={e => setForm({...form, topik: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="cth: Interaksi Sihat"
              value={form.tema}
              onChange={e => setForm({...form, tema: e.target.value})} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.tarikh}
                onChange={e => setForm({...form, tarikh: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minggu</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="cth: 15"
                value={form.minggu}
                onChange={e => setForm({...form, minggu: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bil. Murid</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="cth: 30"
                value={form.bilMurid}
                onChange={e => setForm({...form, bilMurid: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Masa (minit)</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.masa}
                onChange={e => setForm({...form, masa: e.target.value})}>
                <option value="30">30 minit</option>
                <option value="60">60 minit</option>
                <option value="90">90 minit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Penggal</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.penggal}
                onChange={e => setForm({...form, penggal: e.target.value})}>
                <option value="1">Penggal 1</option>
                <option value="2">Penggal 2</option>
                <option value="3">Penggal 3</option>
              </select>
            </div>
          </div>

          <button onClick={generate}
            disabled={loading || !form.mataPelajaran || !form.tahun || !form.topik}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? '⏳ Jana RPH...' : '✨ Jana RPH Sekarang'}
          </button>
        </div>

        {rph && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">✅ RPH Anda</h2>
              <button onClick={copyText}
                className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100">
                📋 Copy
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{rph}</pre>
          </div>
        )}
      </div>
    </main>
  );
}