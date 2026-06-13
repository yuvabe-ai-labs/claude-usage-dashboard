'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { SnapshotRow } from '../types'
import { barColor, tooltipStyle, axisTick } from '../lib/utils'

interface MonthlyTabProps {
  memberRows: SnapshotRow[]
}

const WEEK_BANDS = [
  { start: 1, end: 7 },
  { start: 8, end: 14 },
  { start: 15, end: 21 },
  { start: 22, end: 31 },
]

export function MonthlyTab({ memberRows }: MonthlyTabProps) {
  const chartData = useMemo(() => {
    // Group all rows by month
    const byMonth = new Map<string, SnapshotRow[]>()
    for (const r of memberRows) {
      const month = r.recorded_at.slice(0, 7)
      if (!byMonth.has(month)) byMonth.set(month, [])
      byMonth.get(month)!.push(r)
    }

    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, rows]) => {
        // For each week band, find the latest row (= peak, since weekly usage only increases)
        const weekPeaks: number[] = []
        for (const band of WEEK_BANDS) {
          const weekRows = rows.filter(r => {
            const day = parseInt(r.recorded_at.slice(8, 10), 10)
            return day >= band.start && day <= band.end
          })
          if (weekRows.length === 0) continue
          const latest = weekRows.reduce((a, b) =>
            a.recorded_at > b.recorded_at ? a : b
          )
          weekPeaks.push(latest.seven_day_utilization)
        }

        const avg =
          weekPeaks.length > 0
            ? Math.round(weekPeaks.reduce((a, b) => a + b, 0) / weekPeaks.length)
            : 0

        return {
          label: new Date(`${month}-01`).toLocaleDateString([], {
            month: 'short',
            year: '2-digit',
          }),
          value: avg,
          fill: barColor(avg),
        }
      })
  }, [memberRows])

  if (chartData.length === 0) {
    return <p className="text-zinc-500 text-sm py-8 text-center">No data available.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
        <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} />
        <Tooltip
          {...tooltipStyle}
          formatter={(val) => [`${val ?? 0}%`, '7-day Usage']}
        />
        <Bar dataKey="value" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
