import type { Session, SnapshotRow } from '../types'

export function roundTo5Min(iso: string): string {
  const ms = new Date(iso).getTime()
  return new Date(Math.round(ms / (5 * 60 * 1000)) * (5 * 60 * 1000)).toISOString()
}

export function roundToHour(iso: string): string {
  const ms = new Date(iso).getTime()
  return new Date(Math.round(ms / (60 * 60 * 1000)) * (60 * 60 * 1000)).toISOString()
}

export function getSessions(rows: SnapshotRow[]): Session[] {
  const byKey = new Map<string, SnapshotRow[]>()
  for (const r of rows) {
    const key = roundTo5Min(r.five_hour_resets_at)
    if (!byKey.has(key)) byKey.set(key, [])
    byKey.get(key)!.push(r)
  }
  return Array.from(byKey.entries())
    .map(([k, snaps]) => ({
      resetsAt: k,
      start: new Date(new Date(k).getTime() - 5 * 3600 * 1000),
      end: new Date(k),
      peak: Math.max(...snaps.map(s => s.five_hour_utilization)),
    }))
    .sort((a, b) => a.end.getTime() - b.end.getTime())
}

export function barColor(pct: number): string {
  if (pct >= 90) return '#ef4444'
  if (pct >= 75) return '#f97316'
  if (pct >= 50) return '#eab308'
  return '#22c55e'
}

export const MEMBER_COLORS = [
  '#22c55e', '#3b82f6', '#a855f7', '#f97316',
  '#ec4899', '#14b8a6', '#eab308', '#ef4444',
]

export const tooltipStyle = {
  contentStyle: {
    background: '#18181b',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    fontSize: 12,
    color: '#e5e7eb',
  },
  labelStyle: { color: '#e5e7eb' },
  itemStyle: { color: '#e5e7eb' },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
}

export const axisTick = { fill: '#6b7280', fontSize: 11 }
