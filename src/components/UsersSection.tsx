'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, ToggleLeft, ToggleRight, Settings, RefreshCw } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { ToastContainer, useToast } from './Toast'
import { UsersAPI, User as UserType } from '@/lib/users-api'

export function UsersSection() {
  const router = useRouter()
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const toast = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await UsersAPI.getUsers()
      if (data.success) {
        setUsers(data.data.users)
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
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
        toast.success(`${username}'s status updated successfully`)
        fetchUsers() // Refresh the list
      } else {
        toast.error('Failed to update user status')
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast.error('Error updating user status')
    }
  }

  const handleManageAccess = (user: UserType) => {
    router.push(`/users/${user._id}/access`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const activeCount = users.filter((u) => u.isActive !== false).length

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <PageHeader
          title="Users"
          subtitle="Loading users..."
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
    <div className="bg-slate-50 min-h-screen">
      <PageHeader
        title="Users"
        subtitle={`Manage platform users (${activeCount} active)`}
        action={{
          label: refreshing ? 'Refreshing...' : 'Refresh',
          onClick: handleRefresh,
          icon: RefreshCw,
          disabled: refreshing
        }}
      />

      <div className="px-4 md:px-8 py-8 md:py-12">
        <div className="space-y-0 border border-slate-200 bg-white overflow-hidden rounded-lg">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-6 px-6 py-4 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-widest">
            <div>User</div>
            <div>Email</div>
            <div>User ID</div>
            <div>Joined</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {/* Table Body */}
          {users.map((user, index) => (
            <div
              key={user._id}
              className={`grid grid-cols-6 gap-6 px-6 py-4 items-center hover:bg-slate-50 transition-colors ${
                index !== users.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              {/* User */}
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-950 truncate">
                      {user.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="min-w-0">
                <p className="text-sm text-slate-700 truncate">{user.email}</p>
              </div>

              {/* User ID */}
              <div className="min-w-0">
                <p className="text-sm text-slate-600 font-mono truncate">{user.userId}</p>
              </div>

              {/* Joined */}
              <div className="text-sm text-slate-600">
                {formatDate(user.createdAt)}
              </div>

              {/* Status */}
              <div>
                <button
                  onClick={() => toggleUserStatus(user._id, user.username)}
                  className="flex items-center gap-2 group"
                >
                  {user.isActive !== false ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                      <span className="text-xs font-medium text-green-700">Active</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-500" />
                      <span className="text-xs font-medium text-slate-500">Inactive</span>
                    </>
                  )}
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleManageAccess(user)}
                  className="text-slate-500 hover:text-slate-700 transition-colors p-2 hover:bg-slate-100 rounded"
                  title="Manage Access"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">No users found</p>
            <p className="text-sm text-slate-500">Users will appear here once they register on the platform</p>
          </div>
        )}
      </div>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}
