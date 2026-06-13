'use client'

interface StatCardsProps {
  totalMembers: number
  atSessionLimit: number
  atWeeklyLimit: number
}

function Card({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-5 py-4">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

export function StatCards({ totalMembers, atSessionLimit, atWeeklyLimit }: StatCardsProps) {
  return (
    <div className="flex gap-4">
      <Card label="Total Members" value={totalMembers} color="text-zinc-100" />
      <Card
        label="At Session Limit (≥90%)"
        value={atSessionLimit}
        color={atSessionLimit > 0 ? 'text-red-400' : 'text-zinc-100'}
      />
      <Card
        label="At Weekly Limit (≥90%)"
        value={atWeeklyLimit}
        color={atWeeklyLimit > 0 ? 'text-red-400' : 'text-zinc-100'}
      />
    </div>
  )
}
