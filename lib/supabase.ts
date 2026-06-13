// LETAK FILE NI DI: lib/supabase.ts
// (Buat folder 'lib' dalam root project kalau belum ada)

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}