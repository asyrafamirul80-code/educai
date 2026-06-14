// LETAK FILE NI DI: app/page.tsx
// (REPLACE/OVERWRITE fail lama sepenuhnya)

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">EDUC AI</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Beta</span>
        </div>
        <Link
          href="/login"
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Cuba Sekarang
        </Link>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm px-3 py-1.5 rounded-full mb-6 font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
          Platform AI Percuma untuk Guru Malaysia
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4 max-w-2xl">
          Jimat Masa.<br />
          <span className="text-blue-600">Jana Dokumen</span> dalam Saat.
        </h1>

        <p className="text-gray-500 text-lg mb-8 max-w-md">
          AI yang faham format KPM. Minit Mesyuarat, Soalan UASA, dan RPH Harian — siap dalam masa kurang 1 minit.
        </p>

        <Link
          href="/register"
          className="bg-blue-600 text-white text-lg font-semibold px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 mb-3"
        >
          Mula Guna Percuma →
        </Link>
        <p className="text-gray-400 text-sm">Percuma. Tiada kad kredit diperlukan.</p>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-3 gap-4 px-6 py-8 bg-gray-50 mx-6 rounded-2xl mb-12">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">45 min</div>
          <div className="text-xs text-gray-500 mt-1">Jimat sehari</div>
        </div>
        <div className="text-center border-x border-gray-200">
          <div className="text-2xl font-bold text-gray-900">100%</div>
          <div className="text-xs text-gray-500 mt-1">Format KPM</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">3 alat</div>
          <div className="text-xs text-gray-500 mt-1">Dalam 1 platform</div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 pb-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Apa yang boleh EDUC AI buat?</h2>

        <div className="flex flex-col gap-4">

          {/* Minit */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Minit Mesyuarat Auto</h3>
            <p className="text-gray-500 text-sm mb-4">
              Isi maklumat mesyuarat → AI jana minit rasmi format KPM lengkap dengan agenda, perbincangan, dan tindakan.
            </p>
            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
              <span>⏱ Siap dalam 30 saat</span>
            </div>
          </div>

          {/* UASA */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:border-purple-200 hover:bg-purple-50/30 transition-all">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Penjana Soalan UASA</h3>
            <p className="text-gray-500 text-sm mb-4">
              Pilih mata pelajaran dan topik → AI jana soalan Bahagian A (objektif) dan Bahagian B (subjektif) lengkap dengan skema jawapan.
            </p>
            <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
              <span>✅ Dengan skema jawapan</span>
            </div>
          </div>

          {/* RPH */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:border-green-200 hover:bg-green-50/30 transition-all">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Penjana RPH Harian</h3>
            <p className="text-gray-500 text-sm mb-4">
              Masukkan topik dan kelas → AI jana RPH lengkap format jadual KPM untuk berbilang period sekaligus.
            </p>
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <span>📄 Download Word terus</span>
            </div>
          </div>

        </div>
      </section>

      {/* CTA BAWAH */}
      <section className="bg-blue-600 mx-6 rounded-2xl p-8 text-center mb-12">
        <h2 className="text-2xl font-bold text-white mb-3">Cuba sekarang — percuma!</h2>
        <p className="text-blue-100 text-sm mb-6">
          Lebih 20 Guru Perintis dah guna. Daftar percuma dalam 30 saat.
        </p>
        <Link
          href="/register"
          className="bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors inline-block"
        >
          Daftar Percuma →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="text-center px-6 py-8 text-gray-400 text-sm border-t border-gray-100 mt-auto">
        <p className="font-medium text-gray-600 mb-1">EDUC AI</p>
        <p>Platform AI khas untuk guru Malaysia 🇲🇾</p>
        <p className="mt-2">© 2026 EDUC AI. Semua hak terpelihara.</p>
      </footer>

    </main>
  );
}
