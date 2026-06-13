'use client'

import { useState } from 'react'
import type { SnapshotRow } from '../types'
import { getSessions } from '../lib/utils'
import { DailyTab } from './DailyTab'
import { WeeklyTab } from './WeeklyTab'
import { MonthlyTab } from './MonthlyTab'

type Tab = 'daily' | 'weekly' | 'monthly'

interface MemberDetailCardProps {
  memberName: string
  memberEmail: string | null
  latestSnapshot: SnapshotRow | null
  memberRows: SnapshotRow[]
}

function UsagePill({ label, pct }: { label: string; pct: number }) {
  const color =
    pct >= 90
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : pct >= 75
        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
        : pct >= 50
          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
          : 'bg-green-500/20 text-green-400 border-green-500/30'
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${color}`}>
      <span className="text-xs font-medium">{label}</span>
      <span className="text-lg font-bold">{pct}%</span>
    </div>
  )
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
]

export function MemberDetailCard({ memberName, memberEmail, latestSnapshot, memberRows }: MemberDetailCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('daily')
  const sessions = getSessions(memberRows)

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">{memberName}</h2>
          {memberEmail && (
            <p className="text-xs text-zinc-500 mt-0.5">{memberEmail}</p>
          )}
        </div>
        {latestSnapshot && (
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
              Current Usage
            </span>
            <div className="flex gap-3 flex-wrap justify-end">
              <UsagePill label="5h Session" pct={latestSnapshot.five_hour_utilization} />
              <UsagePill label="7-day Weekly" pct={latestSnapshot.seven_day_utilization} />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-1 border-b border-zinc-700 pb-0">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors -mb-px border-b-2 ${
              activeTab === t.key
                ? 'text-zinc-100 border-zinc-400'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-70">
        {activeTab === 'daily' && <DailyTab sessions={sessions} />}
        {activeTab === 'weekly' && <WeeklyTab memberRows={memberRows} />}
        {activeTab === 'monthly' && <MonthlyTab memberRows={memberRows} />}
      </div>
    </div>
  )
}
