'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, RefreshCw, Loader2 } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { ToastContainer, useToast } from './Toast'
import { UsersAPI, User as UserType } from '@/lib/users-api'
import { DepartmentPapersList } from './DepartmentPapersList'

interface UserAccessManagementProps {
  userId: string
}

export function UserAccessManagement({ userId }: UserAccessManagementProps) {
  const router = useRouter()
  const toast = useToast()
  
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0) // Add refresh key to force re-render

  useEffect(() => {
    fetchUserData()
  }, [userId])

  const fetchUserData = async () => {
    try {
      const data = await UsersAPI.getUserById(userId)
      if (data.success) {
        setUser(data.data.user)
      } else {
        toast.error('User not found')
        router.push('/users')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      toast.error('Failed to load user data')
      router.push('/users')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDepartmentAccess = async (deptId: string, deptName: string, hasAccess: boolean) => {
    if (!user?.userId) return
    
    try {
      const data = await UsersAPI.updateUserAccess(user.userId, {
        type: 'department',
        resourceId: deptId,
        action: hasAccess ? 'remove' : 'add'
      })

      if (data.success) {
        toast.success(data.message || `Access updated for ${deptName}`)
        // Refresh to get updated access state
        await fetchUserData()
        setRefreshKey(prev => prev + 1) // Force DepartmentPapersList to re-fetch
      } else {
        toast.error(data.message || 'Failed to update department access')
      }
    } catch (error) {
      console.error('Error updating department access:', error)
      toast.error('Error updating department access')
    }
  }

  const handleTogglePaperAccess = async (paperId: string, paperTitle: string, hasAccess: boolean) => {
    if (!user?.userId) return
    
    try {
      const data = await UsersAPI.updateUserAccess(user.userId, {
        type: 'paper',
        resourceId: paperId,
        action: hasAccess ? 'remove' : 'add'
      })

      if (data.success) {
        toast.success(data.message || `Access updated for "${paperTitle}"`)
        // Refresh to get updated access state
        await fetchUserData()
        setRefreshKey(prev => prev + 1) // Force DepartmentPapersList to re-fetch
      } else {
        toast.error(data.message || 'Failed to update paper access')
      }
    } catch (error) {
      console.error('Error updating paper access:', error)
      toast.error('Error updating paper access')
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <PageHeader title="User Access Management" subtitle="Loading..." />
        <div className="px-4 md:px-8 py-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <PageHeader title="User Access Management" subtitle="User not found" />
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageHeader
        title="User Access Management"
        subtitle={
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/users')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Users
            </button>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{user.username}</p>
                <p className="text-sm text-slate-600">{user.email}</p>
              </div>
            </div>
          </div>
        }
        action={{
          label: 'Refresh',
          onClick: handleRefresh,
          icon: RefreshCw
        }}
      />

      <div className="px-4 md:px-8 py-8 md:py-12">
        <DepartmentPapersList
          key={refreshKey}
          mode="access"
          userId={user.userId}
          onToggleDepartmentAccess={handleToggleDepartmentAccess}
          onTogglePaperAccess={handleTogglePaperAccess}
        />
      </div>

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}
