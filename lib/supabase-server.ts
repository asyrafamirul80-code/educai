// LETAK FILE NI DI: lib/supabase-server.ts

import { createClient } from '@supabase/supabase-js'

// Server-side client guna service role key
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const FREE_DAILY_LIMIT = 2

export async function checkAndLogUsage(userId: string, feature: string): Promise<{
  allowed: boolean
  used: number
  limit: number
}> {
  const supabase = createServerClient()

  // Check usage hari ni
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString())

  const used = count || 0

  if (used >= FREE_DAILY_LIMIT) {
    return { allowed: false, used, limit: FREE_DAILY_LIMIT }
  }

  // Log usage
  await supabase.from('usage_logs').insert({
    user_id: userId,
    feature,
  })

  return { allowed: true, used: used + 1, limit: FREE_DAILY_LIMIT }
}
