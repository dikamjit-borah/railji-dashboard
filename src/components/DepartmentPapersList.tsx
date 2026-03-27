'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronRight, ChevronLeft, Loader2, AlertCircle, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { ToastContainer, useToast } from './Toast'
import { API_ENDPOINTS } from '@/lib/api'
import { apiClient, getErrorMessage } from '@/lib/api-client'

interface Department {
  departmentId: string
  name: string
  description?: string
  hasAccess?: boolean
}

interface Paper {
  _id: string
  paperId: string
  paperCode: string | null
  name: string
  description?: string
  departmentId: string
  year?: number
  paperType?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  hasAccess?: boolean
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface DepartmentPapersListProps {
  mode: 'manage' | 'access'
  userId?: string
  userDepartments?: string[]
  userPapers?: string[]
  onToggleDepartmentAccess?: (deptId: string, deptName: string) => Promise<void>
  onTogglePaperAccess?: (paperId: string, paperTitle: string) => Promise<void>
  onDeletePaper?: (paperId: string, deptId: string) => Promise<void>
  onTogglePaperStatus?: (paperId: string, deptId: string, currentStatus: boolean) => Promise<void>
  onViewPaper?: (paperId: string, departmentId: string) => void
}

export function DepartmentPapersList({
  mode,
  userId,
  userDepartments = [],
  userPapers = [],
  onToggleDepartmentAccess,
  onTogglePaperAccess,
  onDeletePaper,
  onTogglePaperStatus,
  onViewPaper
}: DepartmentPapersListProps) {
  const [allDepartments, setAllDepartments] = useState<Department[]>([])
  const [papersByDept, setPapersByDept] = useState<Record<string, Paper[]>>({})
  const [paginationByDept, setPaginationByDept] = useState<Record<string, PaginationInfo>>({})
  const [currentPageByDept, setCurrentPageByDept] = useState<Record<string, number>>({})
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set())
  const [loadingDepts, setLoadingDepts] = useState(true)
  const [loadingPapers, setLoadingPapers] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [togglingItem, setTogglingItem] = useState<string | null>(null)
  const hasFetched = useRef(false)
  const toast = useToast()

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchDepartments()
    }
  }, [])

  const fetchDepartments = async () => {
    setLoadingDepts(true)
    setError(null)
    try {
      const url = mode === 'access' && userId 
        ? `${API_ENDPOINTS.departments}?userId=${userId}`
        : API_ENDPOINTS.departments
      
      const result = await apiClient.get(url)
      if (!result.success) throw new Error(getErrorMessage(result))
      
      let depts: Department[] = []
      if (Array.isArray(result.data)) {
        depts = result.data
      }
      
      const generalDept: Department = {
        departmentId: 'GENERAL',
        name: 'General Papers',
        description: 'Common papers across all departments'
      }
      
      const allDepts = [generalDept, ...depts]
      setAllDepartments(allDepts)
      
      allDepts.forEach(dept => {
        if (dept.departmentId === 'GENERAL') {
          fetchGeneralPapers(1)
        } else {
          fetchPapersForDept(dept.departmentId, 1)
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load departments')
    } finally {
      setLoadingDepts(false)
    }
  }

  const fetchPapersForDept = async (deptId: string, page: number = 1) => {
    setLoadingPapers(prev => new Set(prev).add(deptId))
    try {
      let url = API_ENDPOINTS.papers(deptId, page)
      if (mode === 'access' && userId) {
        url = url;
      }
      
      const result = await apiClient.get(url)
      if (!result.success) throw new Error(getErrorMessage(result))
      
      let papers: Paper[] = []
      let pagination: PaginationInfo | null = null
      
      if (result.data && result.data.papers && Array.isArray(result.data.papers)) {
        papers = result.data.papers
        pagination = result.data.pagination
      }
      
      setPapersByDept(prev => ({ ...prev, [deptId]: papers }))
      if (pagination) {
        setPaginationByDept(prev => ({ ...prev, [deptId]: pagination }))
      }
      setCurrentPageByDept(prev => ({ ...prev, [deptId]: page }))
    } catch (err) {
      console.error(`Failed to load papers for ${deptId}:`, err)
      setPapersByDept(prev => ({ ...prev, [deptId]: [] }))
    } finally {
      setLoadingPapers(prev => {
        const next = new Set(prev)
        next.delete(deptId)
        return next
      })
    }
  }

  const fetchGeneralPapers = async (page: number = 1) => {
    const deptId = 'GENERAL'
    setLoadingPapers(prev => new Set(prev).add(deptId))
    try {
      let url = API_ENDPOINTS.generalPapers(page)
      if (mode === 'access' && userId) {
        url = url
      }
      
      const result = await apiClient.get(url)
      if (!result.success) throw new Error(getErrorMessage(result))
      
      let papers: Paper[] = []
      let pagination: PaginationInfo | null = null
      
      if (result.data && result.data.papers && Array.isArray(result.data.papers)) {
        papers = result.data.papers
        pagination = result.data.pagination
      }
      
      setPapersByDept(prev => ({ ...prev, [deptId]: papers }))
      if (pagination) {
        setPaginationByDept(prev => ({ ...prev, [deptId]: pagination }))
      }
      setCurrentPageByDept(prev => ({ ...prev, [deptId]: page }))
    } catch (err) {
      console.error(`Failed to load general papers:`, err)
      setPapersByDept(prev => ({ ...prev, [deptId]: [] }))
    } finally {
      setLoadingPapers(prev => {
        const next = new Set(prev)
        next.delete(deptId)
        return next
      })
    }
  }

  const toggleDepartment = (deptId: string) => {
    const newExpanded = new Set(expandedDepts)
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId)
    } else {
      newExpanded.add(deptId)
      if (!papersByDept[deptId]) {
        if (deptId === 'GENERAL') {
          fetchGeneralPapers(1)
        } else {
          fetchPapersForDept(deptId, 1)
        }
      }
    }
    setExpandedDepts(newExpanded)
  }

  const handleToggleDepartment = async (deptId: string, deptName: string) => {
    if (mode === 'access' && onToggleDepartmentAccess) {
      setTogglingItem(`dept-${deptId}`)
      await onToggleDepartmentAccess(deptId, deptName)
      setTogglingItem(null)
    }
  }

  const handleTogglePaper = async (paperId: string, paperTitle: string, deptId: string, currentStatus?: boolean) => {
    if (mode === 'access' && onTogglePaperAccess) {
      setTogglingItem(`paper-${paperId}`)
      await onTogglePaperAccess(paperId, paperTitle)
      setTogglingItem(null)
    } else if (mode === 'manage' && onTogglePaperStatus) {
      setTogglingItem(`paper-${paperId}`)
      await onTogglePaperStatus(paperId, deptId, currentStatus ?? true)
      setTogglingItem(null)
    }
  }

  const handlePageChange = (deptId: string, newPage: number) => {
    if (deptId === 'GENERAL') {
      fetchGeneralPapers(newPage)
    } else {
      fetchPapersForDept(deptId, newPage)
    }
  }

  if (loadingDepts) {
    return (
      <div className="px-4 md:px-8 py-12 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 md:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Error loading departments</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchDepartments}
              className="text-sm text-red-700 underline mt-2 hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalPapers = Object.values(paginationByDept).reduce((sum, pagination) => sum + pagination.total, 0)

  return (
    <>
      {mode === 'manage' && (
        <div className="mb-6 bg-white border border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-slate-950">Total Papers</h2>
            <span className="text-2xl font-semibold text-slate-950">{totalPapers}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {allDepartments.map((dept) => {
          const isExpanded = expandedDepts.has(dept.departmentId)
          const papers = papersByDept[dept.departmentId] || []
          const isLoadingPapers = loadingPapers.has(dept.departmentId)
          const pagination = paginationByDept[dept.departmentId]
          const currentPage = currentPageByDept[dept.departmentId] || 1
          const hasAccess = mode === 'access' && userDepartments.includes(dept.departmentId)

          return (
            <div key={dept.departmentId} className="bg-white border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleDepartment(dept.departmentId)}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  )}
                  <div className="text-left">
                    <h3 className="font-medium text-slate-950">{dept.name}</h3>
                    {dept.description && (
                      <p className="text-sm text-slate-600 mt-0.5">{dept.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
                    {isLoadingPapers ? (
                      <Loader2 className="w-3 h-3 animate-spin inline" />
                    ) : pagination ? (
                      `${pagination.total} ${pagination.total === 1 ? 'paper' : 'papers'}`
                    ) : (
                      `${papers.length} ${papers.length === 1 ? 'paper' : 'papers'}`
                    )}
                  </span>
                  {mode === 'access' && onToggleDepartmentAccess && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleDepartment(dept.departmentId, dept.name)
                      }}
                      disabled={togglingItem === `dept-${dept.departmentId}`}
                      className={`transition-colors p-1.5 disabled:opacity-50 ${
                        hasAccess 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title={hasAccess ? 'Remove department access' : 'Grant department access'}
                    >
                      {togglingItem === `dept-${dept.departmentId}` ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : hasAccess ? (
                        <ToggleRight className="w-6 h-6" />
                      ) : (
                        <ToggleLeft className="w-6 h-6" />
                      )}
                    </button>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-200">
                  {isLoadingPapers ? (
                    <div className="px-6 py-8 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    </div>
                  ) : papers.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-slate-500">
                      No papers found in this department
                    </div>
                  ) : (
                    <>
                      <div className="divide-y divide-slate-100">
                      {papers.map((paper) => {
                        const hasPaperAccess = mode === 'access' && userPapers.includes(paper.paperId)
                        
                        return (
                          <div
                            key={paper._id}
                            className="px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-slate-950 truncate">{paper.name}</h4>
                                {paper.paperType && (
                                  <span className="text-xs capitalize bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    {paper.paperType}
                                  </span>
                                )}
                                {paper.paperCode && (
                                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                    {paper.paperCode}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                {paper.createdAt && (
                                  <span>Created {new Date(paper.createdAt).toLocaleDateString()}</span>
                                )}
                                {paper.updatedAt && (
                                  <span>Updated {new Date(paper.updatedAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {mode === 'manage' && (
                                <>
                                  {onViewPaper && (
                                    <button
                                      onClick={() => onViewPaper(paper.paperId, paper.departmentId)}
                                      className="text-sm text-slate-600 hover:text-slate-950 transition-colors px-3 py-1.5 border border-slate-300 hover:border-slate-400"
                                    >
                                      View Details
                                    </button>
                                  )}
                                  {onTogglePaperStatus && (
                                    <button
                                      onClick={() => handleTogglePaper(paper.paperId, paper.name, dept.departmentId, paper.isActive)}
                                      disabled={togglingItem === `paper-${paper.paperId}`}
                                      className={`transition-colors p-1.5 disabled:opacity-50 ${
                                        paper.isActive !== false 
                                          ? 'text-green-600 hover:text-green-700' 
                                          : 'text-slate-400 hover:text-slate-600'
                                      }`}
                                      title={paper.isActive !== false ? 'Deactivate paper' : 'Activate paper'}
                                    >
                                      {togglingItem === `paper-${paper.paperId}` ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : paper.isActive !== false ? (
                                        <ToggleRight className="w-5 h-5" />
                                      ) : (
                                        <ToggleLeft className="w-5 h-5" />
                                      )}
                                    </button>
                                  )}
                                  {onDeletePaper && (
                                    <button
                                      onClick={() => onDeletePaper(paper.paperId, dept.departmentId)}
                                      className="text-slate-400 hover:text-red-600 transition-colors p-1.5"
                                      title="Delete paper"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}
                              {mode === 'access' && onTogglePaperAccess && (
                                <button
                                  onClick={() => handleTogglePaper(paper.paperId, paper.name, dept.departmentId)}
                                  disabled={togglingItem === `paper-${paper.paperId}`}
                                  className={`transition-colors p-1.5 disabled:opacity-50 ${
                                    hasPaperAccess 
                                      ? 'text-green-600 hover:text-green-700' 
                                      : 'text-slate-400 hover:text-slate-600'
                                  }`}
                                  title={hasPaperAccess ? 'Remove paper access' : 'Grant paper access'}
                                >
                                  {togglingItem === `paper-${paper.paperId}` ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : hasPaperAccess ? (
                                    <ToggleRight className="w-5 h-5" />
                                  ) : (
                                    <ToggleLeft className="w-5 h-5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      </div>

                      {/* Pagination Controls */}
                      {pagination && pagination.totalPages > 1 && (
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                          Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} papers
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePageChange(dept.departmentId, currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-sm border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => handlePageChange(dept.departmentId, page)}
                                className={`px-3 py-1.5 text-sm border transition-colors ${
                                  page === currentPage
                                    ? 'bg-slate-950 text-white border-slate-950'
                                    : 'border-slate-300 hover:bg-white'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => handlePageChange(dept.departmentId, currentPage + 1)}
                            disabled={currentPage === pagination.totalPages}
                            className="px-3 py-1.5 text-sm border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {allDepartments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600">No departments found</p>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </>
  )
}
