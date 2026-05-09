'use client'

import { PageHeader } from './PageHeader'
import { useToast } from './Toast'
import { useRouter } from 'next/navigation'
import { API_ENDPOINTS } from '@/lib/api'
import { apiClient, getErrorMessage } from '@/lib/api-client'
import { getSession } from '@/lib/auth'
import { DepartmentPapersList } from './DepartmentPapersList'

export function PapersSection() {
  const router = useRouter()
  const toast = useToast()

  const handleDeletePaper = async (paperId: string) => {
    if (!confirm('Are you sure you want to delete this paper?')) return
    
    try {
      const user = getSession()
      if (!user) {
        toast.error('User not authenticated')
        return
      }
      
      const result = await apiClient.delete(API_ENDPOINTS.deletePaper(paperId), { username: user.username })
      if (!result.success) throw new Error(getErrorMessage(result))
      
      toast.success('Paper deleted successfully')
      window.location.reload() // Refresh to update the list
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete paper')
    }
  }

  const handleTogglePaper = async (paperId: string) => {
    try {
      const result = await apiClient.patch(API_ENDPOINTS.togglePaper(paperId), { isActive: undefined })
      if (!result.success) throw new Error(getErrorMessage(result))
      
      toast.success(`Paper status toggled successfully`)
      window.location.reload() // Refresh to update the list
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle paper status')
    }
  }

  const handleViewPaper = (paperId: string, departmentId: string) => {
    router.push(`/papers/${departmentId}/${paperId}`)
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageHeader title="Papers" subtitle="Manage papers by department" />

      <div className="px-4 md:px-8 py-8 md:py-12">
        <DepartmentPapersList
          mode="manage"
          onDeletePaper={handleDeletePaper}
          onTogglePaperStatus={handleTogglePaper}
          onViewPaper={handleViewPaper}
        />
      </div>
    </div>
  )
}
