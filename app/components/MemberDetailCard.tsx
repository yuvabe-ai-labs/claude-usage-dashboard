'use client'

import type { SnapshotRow } from '../types'
import { getSessions } from '../lib/utils'
import { DailyTab } from './DailyTab'
import { WeeklyTab } from './WeeklyTab'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface MemberDetailCardProps {
  memberName: string
  memberEmail: string | null
  latestSnapshot: SnapshotRow | null
  memberRows: SnapshotRow[]
}

function UsageBadge({ label, pct }: { label: string; pct: number }) {
  const color =
    pct >= 90
      ? 'bg-red-500/15 text-red-400 border-red-500/30'
      : pct >= 75
        ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
        : pct >= 50
          ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
          : 'bg-green-500/15 text-green-400 border-green-500/30'
  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium', color)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="text-base font-bold">{pct}%</span>
    </div>
  )
}

export function MemberDetailCard({ memberName, memberEmail, latestSnapshot, memberRows }: MemberDetailCardProps) {
  const sessions = getSessions(memberRows)

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 flex-wrap pb-0">
        <div>
          <p className="font-semibold text-base">{memberName}</p>
          {memberEmail && <p className="text-xs text-muted-foreground mt-0.5">{memberEmail}</p>}
        </div>
        {latestSnapshot && (
          <div className="flex flex-col items-start gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              Current Usage
            </span>
            <div className="flex gap-2 flex-wrap justify-end">
              <UsageBadge label="5h Session" pct={latestSnapshot.five_hour_utilization} />
              <UsageBadge label="7-day Weekly" pct={latestSnapshot.seven_day_utilization} />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="weekly">
          <TabsList className="mb-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>
          <TabsContent value="daily">
            <DailyTab sessions={sessions} />
          </TabsContent>
          <TabsContent value="weekly">
            <WeeklyTab memberRows={memberRows} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
