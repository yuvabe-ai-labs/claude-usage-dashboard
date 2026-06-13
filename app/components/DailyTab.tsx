'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Session } from '../types'
import { barColor, tooltipStyle, axisTick } from '../lib/utils'

const PAGE_SIZE = 7

interface DailyTabProps {
  sessions: Session[]
}

export function DailyTab({ sessions }: DailyTabProps) {
  const months = useMemo(() => {
    const set = new Set<string>()
    for (const s of sessions) {
      set.add(s.end.toISOString().slice(0, 7))
    }
    return Array.from(set).sort()
  }, [sessions])

  const today = new Date()
  const currentMonth = today.toISOString().slice(0, 7)
  const currentDay = today.getDate()

  const [selectedMonth, setSelectedMonth] = useState(() => {
    return months.includes(currentMonth) ? currentMonth : (months[months.length - 1] ?? '')
  })
  const [page, setPage] = useState(() => {
    const defaultMonth = months.includes(currentMonth) ? currentMonth : (months[months.length - 1] ?? '')
    return defaultMonth === currentMonth ? Math.ceil(currentDay / PAGE_SIZE) : 1
  })

  const allDays = useMemo(() => {
    if (!selectedMonth) return []
    const [year, month] = selectedMonth.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`
      const daySessions = sessions.filter(s => s.end.toISOString().slice(0, 10) === dateStr)
      const avg =
        daySessions.length > 0
          ? Math.round(daySessions.reduce((a, b) => a + b.peak, 0) / daySessions.length)
          : 0
      return {
        label: String(day),
        avg,
        fill: daySessions.length > 0 ? barColor(avg) : '#3f3f46',
      }
    })
  }, [sessions, selectedMonth])

  const totalPages = Math.max(1, Math.ceil(allDays.length / PAGE_SIZE))
  const pageData = allDays.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleMonthChange = (m: string) => {
    setSelectedMonth(m)
    setPage(1)
  }

  if (months.length === 0) {
    return <p className="text-zinc-500 text-sm py-8 text-center">No session data available.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={selectedMonth}
          onChange={e => handleMonthChange(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          {months.map(m => (
            <option key={m} value={m}>
              {new Date(`${m}-01`).toLocaleDateString([], { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>
        <span className="text-xs text-zinc-600">
          Page {page} / {totalPages}
        </span>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-md disabled:opacity-40 hover:bg-zinc-700 transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-md disabled:opacity-40 hover:bg-zinc-700 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={pageData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
          <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} />
          <Tooltip
            {...tooltipStyle}
            formatter={(val) => [`${val ?? 0}%`, 'Avg Session']}
          />
          <Bar dataKey="avg" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
