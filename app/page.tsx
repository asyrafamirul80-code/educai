export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600">EDUC</span>
          <span className="text-2xl font-bold text-gray-800">AI</span>
        </div>
        <a href="#waitlist" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          Daftar Percuma
        </a>
      </nav>

      <section className="text-center px-6 py-20 max-w-3xl mx-auto">
        <div className="inline-block bg-blue-50 text-blue-600 text-sm font-medium px-3 py-1 rounded-full mb-4">
          🎓 Platform AI Pertama Untuk Guru Malaysia
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Jimat 10 Jam Kerja <br />
          <span className="text-blue-600">Setiap Minggu</span>
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          RPH auto, laporan markah, soalan UASA, CPD HRMIS — semua siap dalam minit. Bukan jam.
        </p>
        <a href="#waitlist" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 inline-block">
          Cuba Percuma Sekarang →
        </a>
        <p className="text-gray-400 text-sm mt-3">
          47,000+ guru dah tahu • 20 Guru Perintis dah join • 0 kredit kad diperlukan
        </p>
      </section>

      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Apa Yang EDUC AI Boleh Buat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "📝", title: "RPH Auto-Generator", desc: "Input topik, dapat RPH format KPM dalam 5 minit" },
              { icon: "⏱️", title: "HRMIS CPD Helper", desc: "40 jam log CPD → siap dalam minit" },
              { icon: "📊", title: "Laporan Markah", desc: "Upload Excel, dapat report lengkap dengan analisis" },
              { icon: "❓", title: "UASA Question Generator", desc: "Buat soalan peperiksaan ikut format terkini" },
              { icon: "📋", title: "Minit Mesyuarat Auto", desc: "Record atau taip poin, dapat minit rasmi terus" },
              { icon: "📚", title: "BBM Generator", desc: "Worksheet dan latihan untuk murid dalam sekelip mata" },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-5 flex gap-4 shadow-sm">
                <span className="text-3xl">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="waitlist" className="bg-blue-600 py-16 px-6 text-center text-white">
        <h2 className="text-3xl font-bold mb-3">Jadi Guru Perintis Batch 001</h2>
        <p className="text-blue-100 mb-8 text-lg">Free forever • Early access • 30% komisyen referral</p>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSePFG5P9QxTuX1I3g-Aryul1yJVdjpA42aVUCdGI17U3XMIcg/viewform" target="_blank" rel="noopener noreferrer"
          className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 inline-block">
          Daftar Sekarang — Free 🎓
        </a>
        <p className="text-blue-200 text-sm mt-4">Hanya 20 tempat • Batch 001 hampir penuh</p>
      </section>

      <footer className="text-center py-8 text-gray-400 text-sm">
        © 2026 EDUC AI · Platform AI untuk Guru Malaysia
      </footer>
    </main>
  );
}