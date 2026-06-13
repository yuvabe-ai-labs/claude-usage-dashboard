'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { SnapshotRow } from './types'
import { Header } from './components/Header'
import { StatCards } from './components/StatCards'
import { MemberSidebar, getLatestByMember } from './components/MemberSidebar'
import { MemberDetailCard } from './components/MemberDetailCard'

async function fetchHistory(): Promise<SnapshotRow[]> {
  const res = await fetch('/api/usage-history')
  if (!res.ok) throw new Error('Failed to fetch usage history')
  return res.json()
}

async function fetchMembers(): Promise<{ id: string; name: string; email: string | null }[]> {
  const res = await fetch('/api/members')
  if (!res.ok) throw new Error('Failed to fetch members')
  return res.json()
}

export default function DashboardPage() {
  const { data: history = [], dataUpdatedAt, isFetching, refetch } = useQuery({
    queryKey: ['usage-history'],
    queryFn: fetchHistory,
  })

  const { data: memberProfiles = [] } = useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers,
  })

  // keyed by member_id
  const profileById = useMemo(() => {
    const map = new Map<string, { name: string; email: string | null }>()
    for (const m of memberProfiles) map.set(m.id, { name: m.name, email: m.email })
    return map
  }, [memberProfiles])

  const latestByMember = useMemo(() => getLatestByMember(history), [history])

  const members = useMemo(
    () =>
      Array.from(latestByMember.entries())
        .map(([id, snap]) => {
          const profile = profileById.get(id)
          return {
            id,
            name: profile?.name ?? '',
            email: profile?.email ?? null,
            sessionPct: snap.five_hour_utilization,
            weeklyPct: snap.seven_day_utilization,
          }
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [latestByMember, profileById]
  )

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const activeMemberId = selectedMemberId ?? members[0]?.id ?? null
  const activeProfile = members.find(m => m.id === activeMemberId) ?? null

  const memberRows = useMemo(
    () => history.filter(r => r.member_id === activeMemberId),
    [history, activeMemberId]
  )

  const latestSnapshot = activeMemberId ? (latestByMember.get(activeMemberId) ?? null) : null

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt) : null}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />
      {/* <div className="px-6 py-4 border-b border-zinc-800 shrink-0">
        <StatCards
          totalMembers={members.length}
          atSessionLimit={atSessionLimit}
          atWeeklyLimit={atWeeklyLimit}
        />
      </div> */}
      <div className="flex flex-1 overflow-hidden">
        <MemberSidebar
          members={members}
          selectedMemberId={activeMemberId}
          onSelect={setSelectedMemberId}
        />
        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {activeProfile ? (
            <MemberDetailCard
              memberName={activeProfile.name}
              memberEmail={activeProfile.email}
              latestSnapshot={latestSnapshot}
              memberRows={memberRows}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-zinc-600 text-sm">
                {isFetching ? 'Loading…' : 'No data available.'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
