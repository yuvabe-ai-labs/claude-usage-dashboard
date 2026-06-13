'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { SnapshotRow } from '../types'
import { barColor, tooltipStyle, axisTick } from '../lib/utils'

const WEEK_BANDS = [
  { start: 1, end: 7 },
  { start: 8, end: 14 },
  { start: 15, end: 21 },
  { start: 22, end: 31 },
]

interface ComparisonChartProps {
  members: { id: string; name: string }[]
  latestByMember: Map<string, SnapshotRow>
  history: SnapshotRow[]
}

function Chart({
  title,
  data,
  tooltipLabel,
  barHeight,
}: {
  title: string
  data: { name: string; value: number; fill: string }[]
  tooltipLabel: string
  barHeight: number
}) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-400 mb-3">{title}</p>
      <ResponsiveContainer width="100%" height={barHeight * data.length + 20}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={(val) => [`${val ?? 0}%`, tooltipLabel]}
          />
          <Bar dataKey="value" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ComparisonChart({ members, latestByMember, history }: ComparisonChartProps) {
  const currentMonth = new Date().toISOString().slice(0, 7)

  const { weeklyData, monthlyData } = useMemo(() => {
    const stats = members.map(m => {
      const latest = latestByMember.get(m.id)
      const weeklyPct = latest?.seven_day_utilization ?? 0

      const memberRows = history.filter(
        r => r.member_id === m.id && r.recorded_at.startsWith(currentMonth)
      )
      const weekPeaks: number[] = []
      for (const band of WEEK_BANDS) {
        const weekRows = memberRows.filter(r => {
          const day = parseInt(r.recorded_at.slice(8, 10), 10)
          return day >= band.start && day <= band.end
        })
        if (weekRows.length === 0) continue
        const latestRow = weekRows.reduce((a, b) =>
          a.recorded_at > b.recorded_at ? a : b
        )
        weekPeaks.push(latestRow.seven_day_utilization)
      }
      const monthlyAvg =
        weekPeaks.length > 0
          ? Math.round(weekPeaks.reduce((a, b) => a + b, 0) / weekPeaks.length)
          : 0

      return { name: m.name, weeklyPct, monthlyAvg }
    })

    const toChartData = (key: 'weeklyPct' | 'monthlyAvg') =>
      [...stats]
        .sort((a, b) => b[key] - a[key])
        .map(s => ({ name: s.name, value: s[key], fill: barColor(s[key]) }))

    return {
      weeklyData: toChartData('weeklyPct'),
      monthlyData: toChartData('monthlyAvg'),
    }
  }, [members, latestByMember, history, currentMonth])

  const BAR_H = 32

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">Team Usage Comparison</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          {new Date(`${currentMonth}-01`).toLocaleDateString([], {
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Chart
          title="Current 7-day Usage"
          data={weeklyData}
          tooltipLabel="7-day"
          barHeight={BAR_H}
        />
        <Chart
          title="Monthly Average (avg of weekly peaks)"
          data={monthlyData}
          tooltipLabel="Monthly avg"
          barHeight={BAR_H}
        />
      </div>
    </div>
  )
}
