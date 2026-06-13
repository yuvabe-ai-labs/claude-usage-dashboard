'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { SnapshotRow } from '../types'
import { barColor, tooltipStyle, axisTick } from '../lib/utils'

const WEEKS = [
  { label: 'Week 1', start: 1, end: 7 },
  { label: 'Week 2', start: 8, end: 14 },
  { label: 'Week 3', start: 15, end: 21 },
  { label: 'Week 4', start: 22, end: 31 },
]

interface WeeklyTabProps {
  memberRows: SnapshotRow[]
}

export function WeeklyTab({ memberRows }: WeeklyTabProps) {
  const months = useMemo(() => {
    const set = new Set<string>()
    for (const r of memberRows) set.add(r.recorded_at.slice(0, 7))
    return Array.from(set).sort()
  }, [memberRows])

  const [selectedMonth, setSelectedMonth] = useState(() => months[months.length - 1] ?? '')

  const chartData = useMemo(() => {
    if (!selectedMonth) return []
    const monthRows = memberRows.filter(r => r.recorded_at.startsWith(selectedMonth))
    return WEEKS.map(w => {
      const weekRows = monthRows.filter(r => {
        const day = parseInt(r.recorded_at.slice(8, 10), 10)
        return day >= w.start && day <= w.end
      })
      const peak = weekRows.length > 0 ? Math.max(...weekRows.map(r => r.seven_day_utilization)) : 0
      return { label: w.label, peak, fill: weekRows.length > 0 ? barColor(peak) : '#3f3f46' }
    })
  }, [memberRows, selectedMonth])

  if (months.length === 0) {
    return <p className="text-zinc-500 text-sm py-8 text-center">No data available.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <select
        value={selectedMonth}
        onChange={e => setSelectedMonth(e.target.value)}
        className="w-fit bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-500"
      >
        {months.map(m => (
          <option key={m} value={m}>
            {new Date(`${m}-01`).toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </option>
        ))}
      </select>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
          <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} />
          <Tooltip
            {...tooltipStyle}
            formatter={(val) => [`${val ?? 0}%`, 'Peak 7-day']}
          />
          <Bar dataKey="peak" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
