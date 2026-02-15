'use client'

import { useState, useEffect, useRef } from 'react'
import { Trash2, ChevronDown, ChevronRight, Loader2, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { useRouter } from 'next/navigation'
import { API_ENDPOINTS } from '@/lib/api'

interface Department {
  departmentId: string
  name: string
  description?: string
}

interface Paper {
  _id: string
  paperId: string
  paperCode: string | null
  name: string
  description?: string
  departmentId: string
  year?: number
  shift?: string
  zones?: string
  examType?: string
  totalQuestions?: number
  duration?: number
  passMarks?: number
  negativeMarking?: number
  rating?: number
  isFree?: boolean
  isNew?: boolean
  isActive?: boolean
  paperType?: string
  usersAttempted?: number
  createdAt?: string
  updatedAt?: string
}

export function PapersSection() {
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [papersByDept, setPapersByDept] = useState<Record<string, Paper[]>>({})
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set())
  const [loadingDepts, setLoadingDepts] = useState(true)
  const [loadingPapers, setLoadingPapers] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [deletingPaper, setDeletingPaper] = useState<string | null>(null)
  const [togglingPaper, setTogglingPaper] = useState<string | null>(null)
  const hasFetched = useRef(false)

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
      const response = await fetch(API_ENDPOINTS.departments)
      if (!response.ok) throw new Error('Failed to fetch departments')
      const data = await response.json()
      
      // Handle different response formats
      let depts: Department[] = []
      if (Array.isArray(data)) {
        depts = data
      } else if (data.data && Array.isArray(data.data)) {
        depts = data.data
      } else if (data.departments && Array.isArray(data.departments)) {
        depts = data.departments
      } else {
        console.error('Unexpected response format:', data)
        depts = []
      }
      
      setDepartments(depts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load departments')
    } finally {
      setLoadingDepts(false)
    }
  }

  const fetchPapersForDept = async (deptId: string) => {
    if (papersByDept[deptId]) return // Already loaded
    
    setLoadingPapers(prev => new Set(prev).add(deptId))
    try {
      const response = await fetch(API_ENDPOINTS.papers(deptId))
      if (!response.ok) throw new Error('Failed to fetch papers')
      const result = await response.json()
      
      // Extract papers from nested response structure
      let papers: Paper[] = []
      if (result.data && result.data.papers && Array.isArray(result.data.papers)) {
        papers = result.data.papers
      } else if (result.papers && Array.isArray(result.papers)) {
        papers = result.papers
      } else if (Array.isArray(result.data)) {
        papers = result.data
      } else if (Array.isArray(result)) {
        papers = result
      }
      
      setPapersByDept(prev => ({ ...prev, [deptId]: papers }))
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

  const toggleDepartment = (deptId: string) => {
    const newExpanded = new Set(expandedDepts)
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId)
    } else {
      newExpanded.add(deptId)
      fetchPapersForDept(deptId)
    }
    setExpandedDepts(newExpanded)
  }

  const handleDeletePaper = async (paperId: string, deptId: string) => {
    if (!confirm('Are you sure you want to delete this paper?')) return
    
    setDeletingPaper(paperId)
    try {
      const response = await fetch(API_ENDPOINTS.deletePaper(paperId), {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete paper')
      
      // Remove from local state using paperId
      setPapersByDept(prev => ({
        ...prev,
        [deptId]: prev[deptId].filter(p => p.paperId !== paperId)
      }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete paper')
    } finally {
      setDeletingPaper(null)
    }
  }

  const handleTogglePaper = async (paperId: string, deptId: string, currentStatus: boolean) => {
    setTogglingPaper(paperId)
    try {
      const response = await fetch(API_ENDPOINTS.togglePaper(paperId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      if (!response.ok) throw new Error('Failed to toggle paper status')
      
      // Update local state using paperId
      setPapersByDept(prev => ({
        ...prev,
        [deptId]: prev[deptId].map(p => 
          p.paperId === paperId ? { ...p, isActive: !currentStatus } : p
        )
      }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle paper status')
    } finally {
      setTogglingPaper(null)
    }
  }

  const handleViewPaper = (paperId: string, departmentId: string) => {
    router.push(`/papers/${departmentId}/${paperId}`)
  }

  if (loadingDepts) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <PageHeader title="Papers" subtitle="Manage papers by department" />
        <div className="px-4 md:px-8 py-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <PageHeader title="Papers" subtitle="Manage papers by department" />
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
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageHeader title="Papers" subtitle="Manage papers by department" />

      <div className="px-4 md:px-8 py-8 md:py-12">
        <div className="space-y-3">
          {departments.map((dept) => {
            const isExpanded = expandedDepts.has(dept.departmentId)
            const papers = papersByDept[dept.departmentId] || []
            const isLoadingPapers = loadingPapers.has(dept.departmentId)

            return (
              <div key={dept.departmentId} className="bg-white border border-slate-200 overflow-hidden">
                {/* Department Header */}
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
                  <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
                    {papers.length} {papers.length === 1 ? 'paper' : 'papers'}
                  </span>
                </button>

                {/* Papers List */}
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
                      <div className="divide-y divide-slate-100">
                        {papers.map((paper) => (
                          <div
                            key={paper._id}
                            className="px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-950 truncate">{paper.name}</h4>
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                {paper.paperCode && (
                                  <span>Code: {paper.paperCode}</span>
                                )}
                                {paper.paperType && (
                                  <span className="capitalize">{paper.paperType}</span>
                                )}
                                {paper.updatedAt && (
                                  <span>Updated {new Date(paper.updatedAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleViewPaper(paper.paperId, paper.departmentId)}
                                className="text-sm text-slate-600 hover:text-slate-950 transition-colors px-3 py-1.5 border border-slate-300 hover:border-slate-400"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleTogglePaper(paper.paperId, dept.departmentId, paper.isActive ?? true)}
                                disabled={togglingPaper === paper.paperId}
                                className={`transition-colors p-1.5 disabled:opacity-50 ${
                                  paper.isActive !== false 
                                    ? 'text-green-600 hover:text-green-700' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                                title={paper.isActive !== false ? 'Deactivate paper' : 'Activate paper'}
                              >
                                {togglingPaper === paper.paperId ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : paper.isActive !== false ? (
                                  <ToggleRight className="w-5 h-5" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeletePaper(paper.paperId, dept.departmentId)}
                                disabled={deletingPaper === paper.paperId}
                                className="text-slate-400 hover:text-red-600 transition-colors p-1.5 disabled:opacity-50"
                                title="Delete paper"
                              >
                                {deletingPaper === paper.paperId ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {departments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">No departments found</p>
          </div>
        )}
      </div>
    </div>
  )
}
