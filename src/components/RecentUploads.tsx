'use client'

import { API_ENDPOINTS } from '@/lib/api'
import { apiClient } from '@/lib/api-client'
import { useEffect, useState } from 'react'
import { FileText, Users, Activity, TrendingUp, Clock, ArrowRight, User } from 'lucide-react'
import Link from 'next/link'

interface Activity {
  _id: string
  username: string
  action: string
  paperId: string
  message: string
  createdAt: string
  updatedAt: string
  __v: number
}

interface UserUploadCount {
  username: string | null
  count: number
}

interface ApiResponse {
  recentActivity: Activity[]
  paperUploadCount: Record<string, number>
  totalPapers: number
  totalUsers: number
}

interface RecentUploadsProps {
  activities?: Activity[]
}

type DateFilter = 'week' | 'month' | 'year'

function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const d = new Date(dateString)
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatDateTime(dateString: string): string {
  const d = new Date(dateString)
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

/* ── Skeleton card ─────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white border border-warm-200 rounded-xl p-5 space-y-3">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton h-7 w-16 rounded" />
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="skeleton w-2 h-2 rounded-full mt-1.5 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-2.5 w-1/3 rounded" />
      </div>
    </div>
  )
}

export function RecentUploads(props: RecentUploadsProps) {
  const [activities, setActivities] = useState<Activity[]>(props.activities || [])
  const [userCounts, setUserCounts] = useState<UserUploadCount[]>([])
  const [totalPapers, setTotalPapers] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(!props.activities)
  const [dateFilter, setDateFilter] = useState<DateFilter>('month')

  const getDateRange = (filter: DateFilter): { startDate: string; endDate: string } => {
    const now = new Date()
    const endDate = now.toISOString().split('T')[0]
    let startDate: Date

    switch (filter) {
      case 'week': {
        startDate = new Date(now)
        const day = startDate.getDay()
        startDate.setDate(startDate.getDate() - day + (day === 0 ? -6 : 1))
        break
      }
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    return { startDate: startDate.toISOString().split('T')[0], endDate }
  }

  useEffect(() => {
    if (props.activities) return

    const fetch = async () => {
      setLoading(true)
      try {
        const { startDate, endDate } = getDateRange(dateFilter)
        const url = `${API_ENDPOINTS.paperLogs}?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
        const result = await apiClient.get(url)
        if (result.success && result.data) {
          const { recentActivity, paperUploadCount, totalPapers, totalUsers } = result.data as ApiResponse
          setActivities(recentActivity || [])
          const counts: UserUploadCount[] = Object.entries(paperUploadCount || {})
            .map(([username, count]) => ({ username: username === 'null' ? null : username, count }))
            .sort((a, b) => b.count - a.count)
          setUserCounts(counts)
          setTotalPapers(totalPapers || 0)
          setTotalUsers(totalUsers || 0)
        }
      } catch (err) {
        console.error('Failed to fetch activities:', err)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.activities, dateFilter])

  const maxCount = userCounts[0]?.count || 1
  const periodLabel = dateFilter === 'week' ? 'this week' : dateFilter === 'month' ? 'this month' : 'this year'

  return (
    <div className="space-y-6">

      {/* ── Date filter tabs ── */}
      <div className="flex items-center gap-1.5 bg-warm-100 p-1 rounded-xl w-fit">
        {(['week', 'month', 'year'] as DateFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setDateFilter(f)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 capitalize ${
              dateFilter === f
                ? 'bg-white text-rail-800 shadow-sm'
                : 'text-warm-500 hover:text-rail-700'
            }`}
          >
            {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : 'This Year'}
          </button>
        ))}
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Papers"
              value={totalPapers}
              icon={FileText}
              iconBg="bg-rail-50"
              iconColor="text-rail-500"
              accent="border-l-2 border-l-rail-400"
            />
            <StatCard
              label="Total Users"
              value={totalUsers}
              icon={Users}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-500"
              accent="border-l-2 border-l-emerald-400"
            />
            <StatCard
              label={`Uploads ${periodLabel}`}
              value={userCounts.reduce((s, u) => s + u.count, 0)}
              icon={TrendingUp}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              accent="border-l-2 border-l-amber-400"
            />
            <StatCard
              label="Recent Events"
              value={activities.length}
              icon={Activity}
              iconBg="bg-purple-50"
              iconColor="text-purple-500"
              accent="border-l-2 border-l-purple-400"
            />
          </>
        )}
      </div>

      {/* ── Two-column data grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top Contributors — bar chart */}
        <div className="bg-white border border-warm-200 rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-warm-100 flex items-center justify-between">
            <div>
              <h3
                className="text-sm font-semibold text-rail-800"
                style={{ fontFamily: 'var(--font-syne), Syne, system-ui' }}
              >
                Top Contributors
              </h3>
              <p className="text-xs text-warm-400 mt-0.5">Papers uploaded by user</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-rail-50 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-rail-400" />
            </div>
          </div>

          <div className="px-5 py-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="skeleton h-2.5 w-28 rounded" />
                    <div className="skeleton h-2 rounded" style={{ width: `${70 - i * 12}%` }} />
                  </div>
                ))}
              </div>
            ) : userCounts.length === 0 ? (
              <EmptyState
                icon={User}
                title="No uploads yet"
                message="Paper uploads will appear here"
              />
            ) : (
              <div className="space-y-3.5">
                {userCounts.slice(0, 7).map((user, idx) => {
                  const name = !user.username || user.username === 'null' ? 'Unknown' : user.username
                  const pct = Math.round((user.count / maxCount) * 100)
                  const isTop = idx === 0
                  return (
                    <div key={idx} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 ${
                              isTop ? 'bg-amber-500' : 'bg-rail-200'
                            }`}
                            style={!isTop ? { color: '#4A6CF7' } : undefined}
                          >
                            {idx + 1}
                          </div>
                          <span className="text-sm font-medium text-rail-800 truncate max-w-[120px]">{name}</span>
                        </div>
                        <span className={`text-xs font-semibold tabular-nums ${isTop ? 'text-amber-600' : 'text-rail-500'}`}>
                          {user.count}
                        </span>
                      </div>
                      {/* Bar */}
                      <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isTop
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                              : 'bg-gradient-to-r from-rail-300 to-rail-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white border border-warm-200 rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-warm-100 flex items-center justify-between">
            <div>
              <h3
                className="text-sm font-semibold text-rail-800"
                style={{ fontFamily: 'var(--font-syne), Syne, system-ui' }}
              >
                Recent Activity
              </h3>
              <p className="text-xs text-warm-400 mt-0.5">Latest uploads and edits</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>

          <div className="px-5 py-4">
            {loading ? (
              <div className="space-y-1">
                {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : activities.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No activity yet"
                message="Events will appear here as users upload and edit papers"
              />
            ) : (
              <div className="space-y-0">
                {activities.slice(0, 8).map((act, idx) => {
                  const isLast = idx === activities.length - 1 || idx === 7
                  return (
                    <div key={act._id} className="flex items-start gap-3 group">
                      {/* Timeline spine */}
                      <div className="flex flex-col items-center flex-shrink-0 pt-1.5">
                        <div className="station-marker w-2 h-2" />
                        {!isLast && (
                          <div className="w-px flex-1 min-h-[24px] mt-1" style={{ background: 'linear-gradient(to bottom, #E0D9CC, transparent)' }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pb-3">
                        <p className="text-sm text-rail-700 leading-snug">
                          <span className="font-semibold text-rail-800">{act.username}</span>
                          {' '}
                          <span className="text-warm-500">{act.message.split(act.username).pop()}</span>
                        </p>
                        <p className="text-xs text-warm-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatRelativeTime(act.createdAt)}
                          <span className="text-warm-300">·</span>
                          <span title={formatDateTime(act.createdAt)} className="cursor-help">
                            {formatDateTime(act.createdAt)}
                          </span>
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="px-5 py-3 border-t border-warm-100 bg-warm-50">
            <Link
              href="/upload"
              className="text-xs font-semibold text-rail-600 hover:text-rail-800 inline-flex items-center gap-1.5 transition-colors group"
            >
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              Upload a new paper
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}

/* ── Internal components ──────────────────────────── */

interface StatCardProps {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  accent: string
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor, accent }: StatCardProps) {
  return (
    <div className={`bg-white border border-warm-200 rounded-xl p-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 ${accent}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-warm-500 truncate">{label}</p>
          <p
            className="text-2xl font-bold text-rail-900 mt-1 tabular-nums"
            style={{ fontFamily: 'var(--font-syne), Syne, system-ui' }}
          >
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`${iconBg} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
    </div>
  )
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  message: string
}

function EmptyState({ icon: Icon, title, message }: EmptyStateProps) {
  return (
    <div className="py-8 text-center">
      <div className="w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-warm-400" />
      </div>
      <p className="text-sm font-medium text-rail-700">{title}</p>
      <p className="text-xs text-warm-400 mt-1 leading-relaxed max-w-[200px] mx-auto">{message}</p>
    </div>
  )
}
