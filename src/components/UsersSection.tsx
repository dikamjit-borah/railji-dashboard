'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, ToggleLeft, ToggleRight, Settings, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from './PageHeader'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Pagination } from './ui/pagination'
import { UsersAPI, User as UserType } from '@/lib/users-api'

export function UsersSection() {
  const router = useRouter()
  const [users, setUsers]           = useState<UserType[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]           = useState(0)
  const limit = 10

  useEffect(() => { fetchUsers() }, [currentPage])

  const fetchUsers = async () => {
    try {
      const data = await UsersAPI.getUsers(currentPage, limit)
      if (data.success) {
        setUsers(data.data.users)
        setTotalPages(data.data.totalPages)
        setTotal(data.data.total)
      } else {
        toast.error('Failed to fetch users')
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
    await fetchUsers()
  }

  const toggleUserStatus = async (userId: string, username: string) => {
    try {
      const data = await UsersAPI.toggleUserStatus(userId)
      if (data.success) {
        toast.success(`${username}'s status updated`)
        fetchUsers()
      } else {
        toast.error('Failed to update user status')
      }
    } catch {
      toast.error('Error updating user status')
    }
  }

  const handleManageAccess = (user: UserType) => {
    router.push(`/users/${user._id}/access`)
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })

  const activeCount = users.filter(u => u.isActive !== false).length

  if (loading) {
    return (
      <div className="bg-warm-50 min-h-screen">
        <PageHeader title="Users" subtitle="Loading users…" />
        <div className="px-4 md:px-8 py-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-14 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-warm-50 min-h-screen">
      <PageHeader
        title="Users"
        subtitle={`${total} total · ${activeCount} active`}
        action={{
          label: refreshing ? 'Refreshing…' : 'Refresh',
          onClick: handleRefresh,
          icon: RefreshCw,
          disabled: refreshing,
        }}
      />

      <div className="px-4 md:px-8 py-6 space-y-4">
        {/* Table */}
        <div className="card overflow-hidden overflow-x-auto">
          {/* Header row */}
          <div
            className="grid gap-4 px-6 py-3 bg-warm-50 border-b border-warm-200 text-xs font-semibold text-warm-500 uppercase tracking-wider"
            style={{ gridTemplateColumns: '180px 220px 200px 300px 110px 110px 80px', minWidth: '1240px' }}
          >
            <div>User</div>
            <div>Email</div>
            <div>User ID</div>
            <div>Supabase ID</div>
            <div>Joined</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Body */}
          {users.map((user, index) => (
            <div
              key={user._id}
              className={`grid gap-4 px-6 py-4 items-center hover:bg-warm-50 transition-colors ${
                index !== users.length - 1 ? 'border-b border-warm-100' : ''
              }`}
              style={{ gridTemplateColumns: '180px 220px 200px 300px 110px 110px 80px', minWidth: '1240px' }}
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-rail-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-rail-500" />
                </div>
                <p className="font-medium text-rail-900 truncate">{user.username}</p>
              </div>

              {/* Email */}
              <p className="text-sm text-warm-600 truncate min-w-0">{user.email}</p>

              {/* User ID */}
              <p className="text-sm text-warm-500 font-mono truncate min-w-0">{user.userId}</p>

              {/* Supabase ID */}
              <p className="text-sm text-warm-500 font-mono truncate min-w-0">{user.supabaseId || '—'}</p>

              {/* Joined */}
              <p className="text-sm text-warm-500">{formatDate(user.createdAt)}</p>

              {/* Status toggle */}
              <button
                onClick={() => toggleUserStatus(user._id, user.username)}
                className="flex items-center gap-2 group"
              >
                {user.isActive !== false ? (
                  <>
                    <ToggleRight className="w-5 h-5 text-emerald-500 group-hover:text-emerald-600" />
                    <Badge variant="success">Active</Badge>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5 text-warm-400 group-hover:text-warm-500" />
                    <Badge variant="muted">Inactive</Badge>
                  </>
                )}
              </button>

              {/* Actions */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleManageAccess(user)}
                  title="Manage Access"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {users.length === 0 && (
          <div className="card py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-warm-400" />
            </div>
            <p className="font-semibold text-rail-800 mb-1">No users yet</p>
            <p className="text-sm text-warm-500">Users will appear here once they register</p>
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
