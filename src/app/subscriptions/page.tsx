'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Bell, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { ToastContainer, useToast } from '@/components/Toast'
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

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(10)
  const toast = useToast()

  useEffect(() => {
    fetchSubscriptions()
  }, [currentPage])

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
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      setLoading(true)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      expired: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700'
    }
    return styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-700'
  }

  const activeCount = subscriptions.filter((s) => s.status === 'active').length

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <PageHeader
          title="Subscriptions"
          subtitle="Loading subscriptions..."
        />
        <div className="px-4 md:px-8 py-8 md:py-12">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Subscriptions"
        subtitle={`Manage user subscriptions (${total} total, ${activeCount} active)`}
        action={{
          label: refreshing ? 'Refreshing...' : 'Refresh',
          onClick: handleRefresh,
          icon: RefreshCw,
          disabled: refreshing
        }}
      />

      <div className="px-4 md:px-8 py-8 md:py-12">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="space-y-0 border border-slate-200 bg-white overflow-hidden rounded-lg overflow-x-auto">
          {/* Table Header */}
          <div className="grid gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-widest" style={{ gridTemplateColumns: '200px 180px 150px 150px 120px 120px 100px', minWidth: '1020px' }}>
            <div>User</div>
            <div>Department</div>
            <div>Access Type</div>
            <div>Start Date</div>
            <div>End Date</div>
            <div>Status</div>
            <div>User Type</div>
          </div>

          {/* Table Body */}
          {subscriptions.map((subscription, index) => (
            <div
              key={subscription._id}
              className={`grid gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors ${
                index !== subscriptions.length - 1 ? 'border-b border-slate-100' : ''
              }`}
              style={{ gridTemplateColumns: '200px 180px 150px 150px 120px 120px 100px', minWidth: '1020px' }}
            >
              {/* User */}
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-950 truncate text-sm">
                      {subscription.userDetails.email}
                    </p>
                    <p className="text-xs text-slate-500 font-mono truncate">
                      {subscription.userId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Department */}
              <div className="min-w-0">
                <p className="text-sm text-slate-700 capitalize truncate">
                  {subscription.departmentId}
                </p>
              </div>

              {/* Access Type */}
              <div className="min-w-0">
                <p className="text-sm text-slate-700 capitalize truncate">
                  {subscription.accessType}
                </p>
              </div>

              {/* Start Date */}
              <div className="text-sm text-slate-600">
                {formatDate(subscription.startDate)}
              </div>

              {/* End Date */}
              <div className="text-sm text-slate-600">
                {formatDate(subscription.endDate)}
              </div>

              {/* Status */}
              <div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(subscription.status)}`}>
                  {subscription.status}
                </span>
              </div>

              {/* User Type */}
              <div className="text-sm text-slate-600 capitalize">
                {subscription.userDetails.userType}
              </div>
            </div>
          ))}
        </div>

        {subscriptions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
            <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">No subscriptions found</p>
            <p className="text-sm text-slate-500">Subscriptions will appear here once users subscribe</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} subscriptions
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const showPage = 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  
                  const showEllipsis = 
                    (page === currentPage - 2 && currentPage > 3) ||
                    (page === currentPage + 2 && currentPage < totalPages - 2)

                  if (showEllipsis) {
                    return (
                      <span key={page} className="px-2 text-slate-400">
                        ...
                      </span>
                    )
                  }

                  if (!showPage) return null

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}
