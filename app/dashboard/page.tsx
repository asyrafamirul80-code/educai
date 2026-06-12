// LETAK FILE NI DI: app/dashboard/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';

const features = [
  {
    href: '/minit',
    emoji: '📋',
    title: 'Minit Mesyuarat Auto',
    desc: 'Jana minit mesyuarat rasmi format KPM dalam masa 30 saat. Download terus sebagai Word.',
    badge: 'Popular',
    badgeColor: 'bg-blue-100 text-blue-700',
    time: '~30 saat',
    color: 'hover:border-blue-300 hover:shadow-blue-50',
  },
  {
    href: '/uasa',
    emoji: '📝',
    title: 'Penjana Soalan UASA',
    desc: 'Jana soalan peperiksaan Bahagian A & B format UASA mengikut topik. Siap dengan skema jawapan.',
    badge: 'Baru',
    badgeColor: 'bg-green-100 text-green-700',
    time: '~45 saat',
    color: 'hover:border-green-300 hover:shadow-green-50',
  },
  {
    href: '/rph',
    emoji: '📚',
    title: 'Penjana RPH',
    desc: 'Jana Rancangan Pengajaran Harian lengkap dengan objektif, aktiviti, dan pentaksiran.',
    badge: null,
    badgeColor: '',
    time: '~40 saat',
    color: 'hover:border-purple-300 hover:shadow-purple-50',
  },
];

const stats = [
  { label: 'Alat AI', value: '3', icon: '🛠️' },
  { label: 'Masa Jimat / Dokumen', value: '45 min', icon: '⏱️' },
  { label: 'Format Rasmi KPM', value: '100%', icon: '✅' },
];

export default function Dashboard() {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-gray-900 text-lg">EDUC AI</span>
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full ml-1">Beta</span>
          </div>
          <div className="text-sm text-gray-500">Untuk Guru Malaysia 🇲🇾</div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Hero */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Selamat Datang, Cikgu! 👋
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Jimat masa dengan AI. Jana dokumen rasmi sekolah dalam masa kurang 1 minit.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Pilih Alat AI</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Link key={f.href} href={f.href}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={`bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-sm transition-all duration-200 ${f.color} hover:shadow-md hover:-translate-y-0.5 block`}>

              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{f.emoji}</span>
                {f.badge && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${f.badgeColor}`}>
                    {f.badge}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-gray-900 text-base mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.desc}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">⚡ {f.time}</span>
                <span className={`text-sm font-semibold transition-colors ${hover === i ? 'text-blue-600' : 'text-gray-400'}`}>
                  Guna sekarang →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-dashed border-gray-200">
          <p className="text-sm font-semibold text-gray-400 mb-3">🔜 Akan Datang</p>
          <div className="flex flex-wrap gap-2">
            {['Penjana Surat Rasmi','Laporan Murid AI','Jadual Waktu Auto','Slip Markah Digital'].map(item => (
              <span key={item} className="text-xs bg-gray-50 text-gray-400 border border-gray-200 px-3 py-1.5 rounded-full">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-10">
          EDUC AI © 2026 · Dibina khas untuk guru-guru Malaysia 🇲🇾
        </p>
      </div>
    </main>
  );
}
