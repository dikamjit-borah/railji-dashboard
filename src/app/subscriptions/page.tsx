'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { Bell, Search, Filter, RefreshCw, User } from 'lucide-react'
import { API_ENDPOINTS } from '@/lib/api'
import { apiClient } from '@/lib/api-client'

interface UserDetails {
  userId: string
  email: string
  isActive: boolean
  userType: string
}

interface Subscription {
  _id: string
  userId: string
  accessType: string
  departmentId: string
  paperIds: string[]
  status: string
  startDate: string
  endDate: string
  description: string
  createdAt: string
  updatedAt: string
  userDetails: UserDetails
}

type StatusVariant = 'success' | 'danger' | 'warning' | 'default'

function getStatusVariant(status: string): StatusVariant {
  const map: Record<string, StatusVariant> = {
    active: 'success',
    expired: 'danger',
    pending: 'warning',
  }
  return map[status] ?? 'default'
}

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  useEffect(() => { fetchSubscriptions() }, [currentPage])

  const fetchSubscriptions = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.subscriptions(currentPage, limit))
      if (response.success && response.data) {
        setSubscriptions(response.data.subscriptions)
        setTotalPages(response.data.pagination.totalPages)
        setTotal(response.data.pagination.total)
      } else {
        toast.error('Failed to fetch subscriptions')
      }
    } catch {
      toast.error('Error connecting to server')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSubscriptions()
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  const activeCount = subscriptions.filter((s) => s.status === 'active').length

  const COLS = '200px 180px 150px 150px 120px 120px 100px'

  if (loading) {
    return (
      <div className="bg-warm-50 min-h-screen">
        <PageHeader title="Subscriptions" subtitle="Loading subscriptions…" />
        <div className="px-4 md:px-8 py-8">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-warm-50 min-h-screen">
      <PageHeader
        title="Subscriptions"
        subtitle={`${total} total · ${activeCount} active`}
        action={{ label: refreshing ? 'Refreshing…' : 'Refresh', onClick: handleRefresh, icon: RefreshCw, disabled: refreshing }}
      />

      <div className="px-4 md:px-8 py-6 space-y-5">
        {/* Search + filter bar */}
        <div className="bg-white rounded-xl border border-warm-200 shadow-card p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search subscriptions…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-minimal w-full pl-9"
              />
            </div>
            <Button variant="outline" size="md" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-warm-200 rounded-xl shadow-card overflow-hidden overflow-x-auto">
          {/* Header */}
          <div
            className="grid gap-4 px-6 py-3 bg-warm-50 border-b border-warm-100 text-xs font-semibold text-warm-500 uppercase tracking-widest"
            style={{ gridTemplateColumns: COLS, minWidth: '1020px' }}
          >
            <div>User</div>
            <div>Department</div>
            <div>Access Type</div>
            <div>Start Date</div>
            <div>End Date</div>
            <div>Status</div>
            <div>User Type</div>
          </div>

          {/* Rows */}
          {subscriptions.map((sub, index) => (
            <div
              key={sub._id}
              className={`grid gap-4 px-6 py-4 items-center hover:bg-warm-50 transition-colors ${
                index !== subscriptions.length - 1 ? 'border-b border-warm-100' : ''
              }`}
              style={{ gridTemplateColumns: COLS, minWidth: '1020px' }}
            >
              <div className="min-w-0 flex items-center gap-3">
                <div className="w-8 h-8 bg-rail-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-rail-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-rail-900 truncate text-sm">{sub.userDetails.email}</p>
                  <p className="text-xs text-warm-400 font-mono truncate">{sub.userId}</p>
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-sm text-rail-700 capitalize truncate">{sub.departmentId}</p>
              </div>

              <div className="min-w-0">
                <p className="text-sm text-rail-700 capitalize truncate">{sub.accessType}</p>
              </div>

              <div className="text-sm text-warm-600">{formatDate(sub.startDate)}</div>
              <div className="text-sm text-warm-600">{formatDate(sub.endDate)}</div>

              <div>
                <Badge variant={getStatusVariant(sub.status)}>{sub.status}</Badge>
              </div>

              <div className="text-sm text-warm-600 capitalize">{sub.userDetails.userType}</div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {subscriptions.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-warm-200">
            <div className="w-12 h-12 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-warm-400" />
            </div>
            <p className="font-medium text-rail-800 mb-1">No subscriptions found</p>
            <p className="text-sm text-warm-400">Subscriptions will appear here once users subscribe</p>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={(page) => { setCurrentPage(page); setLoading(true) }}
        />
      </div>
    </div>
  )
}
