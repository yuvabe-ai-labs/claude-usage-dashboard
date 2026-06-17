'use client'

import { useMemo, useState } from 'react'
import type { SnapshotRow } from '../types'
import { roundToHour, barColor } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeeklyTableProps {
  members: { id: string; name: string; email: string | null }[]
  history: SnapshotRow[]
}

const WEEK_MS = 7 * 24 * 3600 * 1000
const COLS_PER_PAGE = 4

function fmtShort(d: Date) {
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' })
}

function cellColor(pct: number) {
  if (pct === 0) return 'text-muted-foreground'
  if (pct >= 90) return 'text-red-400'
  if (pct >= 75) return 'text-orange-400'
  if (pct >= 50) return 'text-yellow-400'
  return 'text-green-400'
}

const ROWS_PER_PAGE = 10

export function WeeklyTable({ members, history }: WeeklyTableProps) {
  const [colPage, setColPage] = useState(0)
  const [rowPage, setRowPage] = useState(0)

  const allRows = useMemo(() =>
    members.map(m => {
      const memberRows = history.filter(r => r.member_id === m.id)
      const byReset = new Map<string, SnapshotRow[]>()
      for (const r of memberRows) {
        const key = roundToHour(r.seven_day_resets_at)
        if (!byReset.has(key)) byReset.set(key, [])
        byReset.get(key)!.push(r)
      }

      const allWeeks = Array.from(byReset.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, rows], i, arr) => {
          const resetDate = new Date(key)
          const startDate = new Date(resetDate.getTime() - WEEK_MS)
          const latest = rows.reduce((a, b) => a.recorded_at > b.recorded_at ? a : b)
          return {
            pct: latest.seven_day_utilization,
            start: fmtShort(startDate),
            end: fmtShort(resetDate),
            isCurrent: i === arr.length - 1,
          }
        })

      return { name: m.name, email: m.email, allWeeks }
    }),
    [members, history]
  )

  const maxWeeks = Math.max(...allRows.map(r => r.allWeeks.length), COLS_PER_PAGE)
  const totalColPages = Math.ceil(maxWeeks / COLS_PER_PAGE)

  const totalRowPages = Math.ceil(allRows.length / ROWS_PER_PAGE)

  // Left-aligned: colPage 0 = weeks[0..3], colPage 1 = weeks[4..7], etc.
  const visibleRows = useMemo(() =>
    allRows
      .slice(rowPage * ROWS_PER_PAGE, (rowPage + 1) * ROWS_PER_PAGE)
      .map(row => {
        const start = colPage * COLS_PER_PAGE
        const weeks = Array.from({ length: COLS_PER_PAGE }, (_, k) => {
          const idx = start + k
          return idx < row.allWeeks.length
            ? row.allWeeks[idx]
            : { pct: 0, start: '', end: '', isCurrent: false }
        })
        return { name: row.name, email: row.email, weeks }
      }),
    [allRows, colPage, rowPage]
  )

  // Column headers: Week 1, 2, 3, 4 on page 0 — Week 5, 6, 7, 8 on page 1, etc.
  const colLabels = Array.from({ length: COLS_PER_PAGE }, (_, k) =>
    `Week ${colPage * COLS_PER_PAGE + k + 1}`
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Usage History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">Name</TableHead>
              <TableHead className="w-10">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setColPage(p => p - 1)}
                  disabled={colPage === 0}
                  className="h-7 w-7 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </TableHead>
              {colLabels.map((label, i) => (
                <TableHead key={i} className="text-center">{label}</TableHead>
              ))}
              <TableHead className="w-10">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setColPage(p => p + 1)}
                  disabled={colPage >= totalColPages - 1}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map(row => (
              <TableRow key={row.name}>
                <TableCell>
                  <p className="text-sm font-semibold">{row.name}</p>
                  {row.email && <p className="text-xs text-muted-foreground mt-0.5">{row.email}</p>}
                </TableCell>
                <TableCell />
                {row.weeks.map((w, i) => (
                  <TableCell key={i} className={cn(w.isCurrent && 'bg-blue-500/5')}>
                    {w.pct > 0 ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* <span className="text-xs text-muted-foreground">{w.start} – {w.end}</span> */}
                          {w.isCurrent && (
                            <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/15 px-1.5 py-0.5 rounded-full">current</span>
                          )}
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${w.pct}%`, backgroundColor: w.isCurrent ? '#60a5fa' : barColor(w.pct) }}
                          />
                        </div>
                        <div className="flex justify-between text-xs font-medium">
                          <span className={w.isCurrent ? 'text-blue-400' : cellColor(w.pct)}>{w.pct}%</span>
                          <span className="text-muted-foreground">Left: {100 - w.pct}%</span>
                        </div>
                      </div>
                    ) : (
                      <span className="block text-center text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                ))}
                <TableCell />
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {totalRowPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
            <span className="text-xs text-muted-foreground">
              {rowPage * ROWS_PER_PAGE + 1}–{Math.min((rowPage + 1) * ROWS_PER_PAGE, allRows.length)} of {allRows.length} members
            </span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" onClick={() => setRowPage(p => p - 1)} disabled={rowPage === 0} className="h-7 w-7 p-0">
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                {rowPage + 1} / {totalRowPages}
              </span>
              <Button size="sm" variant="outline" onClick={() => setRowPage(p => p + 1)} disabled={rowPage >= totalRowPages - 1} className="h-7 w-7 p-0">
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
