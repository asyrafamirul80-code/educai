// LETAK FILE NI DI: app/register/page.tsx
// (Buat folder 'app/register' kalau belum ada)

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nama, setNama] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Password mestilah sekurang-kurangnya 6 aksara.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nama_penuh: nama }
      }
    })

    if (error) {
      setError('Gagal daftar. Email mungkin sudah digunakan.')
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pendaftaran Berjaya!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Sila semak email anda untuk sahkan akaun, kemudian log masuk.
          </p>
          <Link
            href="/login"
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors inline-block"
          >
            Pergi ke Log Masuk
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">EDUC AI</h1>
          <p className="text-gray-500 text-sm mt-1">Daftar akaun percuma</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nama Penuh</label>
            <input
              type="text"
              value={nama}
              onChange={e => setNama(e.target.value)}
              placeholder="Cikgu Ahmad bin Ali"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="cikgu@sekolah.edu.my"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 aksara"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Sedang mendaftar...' : 'Daftar Percuma'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-400 mt-4">
          Percuma: 2x generate sehari ✅
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Dah ada akaun?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Log masuk
          </Link>
        </p>

      </div>
    </main>
  )
}