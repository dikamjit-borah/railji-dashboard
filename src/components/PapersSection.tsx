'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PageHeader } from './PageHeader'
import { ConfirmDialog } from './ui/confirm-dialog'
import { DepartmentPapersList } from './DepartmentPapersList'
import { API_ENDPOINTS } from '@/lib/api'
import { apiClient, getErrorMessage } from '@/lib/api-client'
import { getSession } from '@/lib/auth'

export function PapersSection() {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<{ paperId: string; deptId: string } | null>(null)

  const handleDeletePaper = async (paperId: string, deptId: string) => {
    setDeleteTarget({ paperId, deptId })
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      const user = getSession()
      if (!user) { toast.error('Not authenticated'); return }
      const result = await apiClient.delete(
        API_ENDPOINTS.deletePaper(deleteTarget.paperId),
        { username: user.username },
      )
      if (!result.success) throw new Error(getErrorMessage(result))
      toast.success('Paper deleted successfully')
      window.location.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete paper')
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleTogglePaper = async (paperId: string) => {
    try {
      const result = await apiClient.patch(API_ENDPOINTS.togglePaper(paperId), { isActive: undefined })
      if (!result.success) throw new Error(getErrorMessage(result))
      toast.success('Paper status updated')
      window.location.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update paper status')
    }
  }

  const handleViewPaper = (paperId: string, departmentId: string) => {
    router.push(`/papers/${departmentId}/${paperId}`)
  }

  return (
    <div className="bg-warm-50 min-h-screen">
      <PageHeader title="Papers" subtitle="Manage papers by department" />

      <div className="px-4 md:px-8 py-6">
        <DepartmentPapersList
          mode="manage"
          onDeletePaper={handleDeletePaper}
          onTogglePaperStatus={handleTogglePaper}
          onViewPaper={handleViewPaper}
        />
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete paper"
        description="This action cannot be undone. The paper and all its questions will be permanently removed."
        confirmLabel="Delete paper"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  )
}
