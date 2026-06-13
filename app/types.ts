export interface Member {
  id: string
  name: string
  email: string | null
}

export interface SnapshotRow {
  member_id: string
  five_hour_utilization: number
  five_hour_resets_at: string
  seven_day_utilization: number
  seven_day_resets_at: string
  recorded_at: string
}

export interface Session {
  resetsAt: string
  start: Date
  end: Date
  peak: number
}
