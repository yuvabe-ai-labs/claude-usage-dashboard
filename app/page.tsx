'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { SnapshotRow } from './types'
import { Header } from './components/Header'
import { WeeklyTable } from './components/WeeklyTable'
import { getLatestByMember } from './components/MemberSidebar'

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

  const profileById = useMemo(() => {
    const map = new Map<string, { name: string; email: string | null }>()
    for (const m of memberProfiles) map.set(m.id, { name: m.name, email: m.email })
    return map
  }, [memberProfiles])

  const latestByMember = useMemo(() => getLatestByMember(history), [history])

  const members = useMemo(
    () =>
      Array.from(latestByMember.entries())
        .filter(([id]) => profileById.has(id))
        .map(([id]) => {
          const profile = profileById.get(id)!
          return { id, name: profile.name, email: profile.email }
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [latestByMember, profileById]
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header
        lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt) : null}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
      />
      <main className="flex-1 overflow-y-auto p-6">
        {isFetching && members.length === 0 ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : (
          <WeeklyTable members={members} history={history} />
        )}
      </main>
    </div>
  )
}
