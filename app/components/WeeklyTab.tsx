'use client'

import { useMemo, useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import type { SnapshotRow } from '../types'
import { roundToHour, barColor, tooltipStyle, axisTick } from '../lib/utils'

interface WeeklyTabProps {
  memberRows: SnapshotRow[]
}

function fmtShort(d: Date) {
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function WeeklyTab({ memberRows }: WeeklyTabProps) {
  const cycles = useMemo(() => {
    const now = new Date()
    const WEEK_MS = 7 * 24 * 3600 * 1000

    // Build cycle map from actual data
    const byResetKey = new Map<string, SnapshotRow[]>()
    for (const r of memberRows) {
      const key = roundToHour(r.seven_day_resets_at)
      if (!byResetKey.has(key)) byResetKey.set(key, [])
      byResetKey.get(key)!.push(r)
    }

    // Find the latest reset date as anchor for the current week
    const latestRow = memberRows.reduce<SnapshotRow | null>(
      (a, b) => (!a || b.recorded_at > a.recorded_at ? b : a), null
    )
    if (!latestRow) return []

    const anchorReset = new Date(roundToHour(latestRow.seven_day_resets_at))

    // Generate 4 week slots ending at anchor (oldest → newest)
    const slots = Array.from({ length: 4 }, (_, i) => {
      const resetDate = new Date(anchorReset.getTime() - (3 - i) * WEEK_MS)
      const startDate = new Date(resetDate.getTime() - WEEK_MS)
      const key = resetDate.toISOString()
      const rows = byResetKey.get(key) ?? []
      const latest = rows.length
        ? rows.reduce((a, b) => a.recorded_at > b.recorded_at ? a : b)
        : null
      const peak = latest?.seven_day_utilization ?? 0
      const isCurrent = resetDate > now
      return {
        label: fmtShort(startDate),
        tooltip: `${fmtShort(startDate)} – ${fmtShort(resetDate)}`,
        peak,
        fill: peak === 0 ? '#3f3f46' : isCurrent ? '#60a5fa' : barColor(peak),
        currentLabel: isCurrent ? 'current' : '',
        resetDate,
      }
    })

    // Append any older cycles not covered by the 4-slot window
    const slotKeys = new Set(slots.map(s => roundToHour(s.resetDate.toISOString())))
    const extra = Array.from(byResetKey.entries())
      .filter(([key]) => !slotKeys.has(key))
      .map(([key, rows]) => {
        const resetDate = new Date(key)
        const startDate = new Date(resetDate.getTime() - WEEK_MS)
        const latest = rows.reduce((a, b) => a.recorded_at > b.recorded_at ? a : b)
        const peak = latest.seven_day_utilization
        const isCurrent = resetDate > now
        return {
          label: fmtShort(startDate),
          tooltip: `${fmtShort(startDate)} – ${fmtShort(resetDate)}`,
          peak,
          fill: peak === 0 ? '#3f3f46' : isCurrent ? '#60a5fa' : barColor(peak),
          currentLabel: isCurrent ? 'current' : '',
          resetDate,
        }
      })

    return [...extra, ...slots].sort((a, b) => a.resetDate.getTime() - b.resetDate.getTime())
  }, [memberRows])

  const [displayData, setDisplayData] = useState<typeof cycles>([])

  useEffect(() => {
    setDisplayData([])
    const timers = cycles.map((item, i) =>
      setTimeout(() => setDisplayData(prev => [...prev, item]), i * 150)
    )
    return () => timers.forEach(clearTimeout)
  }, [cycles])

  if (cycles.length === 0) {
    return <p className="text-zinc-500 text-sm py-8 text-center">No data available.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={displayData} margin={{ top: 20, right: 8, bottom: 4, left: -16 }}>
        <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} />
        <Tooltip
          {...tooltipStyle}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.tooltip ?? ''}
          formatter={(val) => [`${val ?? 0}%`, 'Peak 7-day']}
        />
        <Bar dataKey="peak" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={400}>
          <LabelList
            dataKey="currentLabel"
            position="top"
            style={{ fill: '#60a5fa', fontSize: 10, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
