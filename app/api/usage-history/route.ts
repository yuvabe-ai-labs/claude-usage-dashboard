import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('usage_snapshots')
    .select(
      'member_id, five_hour_utilization, five_hour_resets_at, seven_day_utilization, seven_day_resets_at, recorded_at'
    )
    .order('recorded_at', { ascending: true })
    .limit(2000)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
