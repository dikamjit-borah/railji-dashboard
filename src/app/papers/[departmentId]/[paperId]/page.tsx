'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { PaperJsonEditor } from '@/components/PaperJsonEditor'

interface PaperData {
  paperType: 'sectional' | 'full' | 'general' | ''
  department: string
  paperCode: string
  year: string
  shift: 'morning' | 'afternoon' | 'evening' | 'night' | ''
  paperName: string
  paperDescription: string
  passMarks: number | ''
  negativeMarks: number | ''
  duration: number | ''
  isFree: boolean
  jsonFile: {
    name: string
    size: string
    uploadTime: string
    content: any
  } | null
}

interface PaperDetails {
  _id: string
  paperId: string
  paperCode: string | null
  name: string
  description?: string
  departmentId: string
  year?: number
  shift?: string
  totalQuestions?: number
  duration?: number
  passMarks?: number
  negativeMarking?: number
  rating?: number
  isFree?: boolean
  isNew?: boolean
  paperType?: string
  usersAttempted?: number
  createdAt?: string
  updatedAt?: string
}

interface ApiResponse {
  success: boolean
  statusCode: number
  message: string
  data: {
    _id: string
    departmentId: string
    paperId: string
    paperCode: string
    questions: any[]
    paperDetails: PaperDetails
  }
}

export default function PaperDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const departmentId = params.departmentId as string
  const paperId = params.paperId as string

  const [stage, setStage] = useState<'editor' | 'details'>('editor')
  const [currentPaper, setCurrentPaper] = useState<PaperData>({
    paperType: '',
    department: '',
    paperCode: '',
    year: '',
    shift: '',
    paperName: '',
    paperDescription: '',
    passMarks: '',
    negativeMarks: '',
    duration: '',
    isFree: false,
    jsonFile: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingPaper, setUpdatingPaper] = useState(false)

  useEffect(() => {
    if (departmentId && paperId) {
      fetchPaperDetails()
    }
  }, [departmentId, paperId])

  const fetchPaperDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `https://railji-business.onrender.com/business/v1/papers/${departmentId}/${paperId}`
      )
      
      if (!response.ok) throw new Error('Failed to fetch paper details')
      const result: ApiResponse = await response.json()
      
      if (result.success && result.data) {
        const paper = result.data.paperDetails
        const questions = result.data.questions || []
        
        // Populate currentPaper with fetched data
        setCurrentPaper({
          paperType: (paper.paperType as any) || '',
          department: paper.departmentId || '',
          paperCode: paper.paperCode || '',
          year: paper.year ? String(paper.year) : '',
          shift: (paper.shift?.toLowerCase() as any) || '',
          paperName: paper.name || '',
          paperDescription: paper.description || '',
          passMarks: paper.passMarks ?? '',
          negativeMarks: paper.negativeMarking ?? '',
          duration: paper.duration ?? '',
          isFree: paper.isFree || false,
          jsonFile: {
            name: 'questions.json',
            size: `${(JSON.stringify(questions).length / 1024).toFixed(1)} KB`,
            uploadTime: 'loaded from server',
            content: { questions },
          },
        })
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load paper details')
    } finally {
      setLoading(false)
    }
  }

  const updatePaper = async () => {
    if (!currentPaper.jsonFile) {
      alert('No questions data available')
      return
    }

    setUpdatingPaper(true)
    try {
      const questions = currentPaper.jsonFile.content?.questions || []
      const totalQuestions = questions.length

      const payload = {
        departmentId: currentPaper.department || undefined,
        paperCode: currentPaper.paperCode || undefined,
        paperType: currentPaper.paperType,
        name: currentPaper.paperName,
        description: currentPaper.paperDescription,
        year: Number(currentPaper.year),
        shift: currentPaper.shift.charAt(0).toUpperCase() + currentPaper.shift.slice(1),
        totalQuestions,
        passMarks: Number(currentPaper.passMarks),
        negativeMarking: Number(currentPaper.negativeMarks),
        duration: Number(currentPaper.duration),
        isFree: currentPaper.isFree,
        questions,
      }

      const response = await fetch(
        `https://railji-business.onrender.com/business/v1/papers/${departmentId}/${paperId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `API error: ${response.statusText}`)
      }

      const result = await response.json()
      alert('Paper updated successfully!')
      console.log('Paper updated:', result)
      
      // Optionally redirect back to papers list
      router.push('/papers')
    } catch (error) {
      console.error('Failed to update paper:', error)
      alert(`Failed to update paper: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUpdatingPaper(false)
    }
  }

  if (loading) {
    return (
      <div className="ml-56 bg-slate-50 min-h-screen">
        <PageHeader title="Paper Details" subtitle="Loading..." />
        <div className="px-4 md:px-8 py-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ml-56 bg-slate-50 min-h-screen">
        <PageHeader title="Paper Details" subtitle="Error" />
        <div className="px-4 md:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error loading paper</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={() => router.push('/papers')}
                className="text-sm text-red-700 underline mt-2 hover:text-red-900"
              >
                Back to Papers
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {stage === 'editor' ? (
        <PaperJsonEditor
          onBack={() => router.push('/papers')}
          onNext={(updatedData) => {
            // Update the jsonFile content with the edited data
            setCurrentPaper({
              ...currentPaper,
              jsonFile: currentPaper.jsonFile ? {
                ...currentPaper.jsonFile,
                content: updatedData
              } : null
            })
            setStage('details')
          }}
          initialQuestions={currentPaper.jsonFile?.content}
        />
      ) : (
        <div className="ml-56 bg-slate-50 min-h-screen">
          <PageHeader
            title="Paper Details"
            subtitle="Update paper information"
          />
          <div className="px-8 py-12">
            <div className="max-w-2xl space-y-6">
              {/* Paper Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Paper Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentPaper.paperType}
                  onChange={(e) =>
                    setCurrentPaper({
                      ...currentPaper,
                      paperType: e.target.value as 'sectional' | 'full' | 'general' | '',
                    })
                  }
                  className="input-minimal w-full"
                >
                  <option value="">Select paper type</option>
                  <option value="sectional">Sectional</option>
                  <option value="full">Full</option>
                  <option value="general">General</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Department ID
                </label>
                <input
                  type="text"
                  value={currentPaper.department}
                  onChange={(e) =>
                    setCurrentPaper({
                      ...currentPaper,
                      department: e.target.value,
                    })
                  }
                  className="input-minimal w-full"
                  placeholder="e.g., DEPT002"
                />
              </div>

              {/* Paper Code */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Section Code
                </label>
                <input
                  type="text"
                  value={currentPaper.paperCode}
                  onChange={(e) =>
                    setCurrentPaper({
                      ...currentPaper,
                      paperCode: e.target.value,
                    })
                  }
                  className="input-minimal w-full"
                  placeholder="e.g., Test"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 2024"
                  min="2000"
                  max="2100"
                  value={currentPaper.year}
                  onChange={(e) =>
                    setCurrentPaper({
                      ...currentPaper,
                      year: e.target.value,
                    })
                  }
                  className="input-minimal w-full"
                />
              </div>

              {/* Shift */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Shift <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentPaper.shift}
                  onChange={(e) =>
                    setCurrentPaper({
                      ...currentPaper,
                      shift: e.target.value as 'morning' | 'afternoon' | 'evening' | 'night' | '',
                    })
                  }
                  className="input-minimal w-full"
                >
                  <option value="">Select shift</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>

              {/* Paper Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Paper Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter paper name"
                  value={currentPaper.paperName}
                  onChange={(e) =>
                    setCurrentPaper({
                      ...currentPaper,
                      paperName: e.target.value,
                    })
                  }
                  className="input-minimal w-full"
                />
              </div>

              {/* Paper Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Paper Description
                </label>
                <textarea
                  placeholder="Enter paper description"
                  value={currentPaper.paperDescription}
                  onChange={(e) =>
                    setCurrentPaper({
                      ...currentPaper,
                      paperDescription: e.target.value,
                    })
                  }
                  className="input-minimal w-full resize-none"
                  rows={3}
                />
              </div>

              {/* Pass Marks and Negative Marks */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pass Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 40"
                    min="0"
                    value={currentPaper.passMarks}
                    onChange={(e) =>
                      setCurrentPaper({
                        ...currentPaper,
                        passMarks: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="input-minimal w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Negative Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 0.25"
                    step="0.01"
                    min="0"
                    value={currentPaper.negativeMarks}
                    onChange={(e) =>
                      setCurrentPaper({
                        ...currentPaper,
                        negativeMarks: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="input-minimal w-full"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 90"
                  min="1"
                  value={currentPaper.duration}
                  onChange={(e) =>
                    setCurrentPaper({
                      ...currentPaper,
                      duration: e.target.value ? Number(e.target.value) : '',
                    })
                  }
                  className="input-minimal w-full"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentPaper.isFree}
                    onChange={(e) =>
                      setCurrentPaper({
                        ...currentPaper,
                        isFree: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-slate-700">Free</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-8">
                <button
                  onClick={() => setStage('editor')}
                  className="flex-1 py-2 px-4 rounded font-medium btn-minimal-secondary"
                >
                  Back to Editor
                </button>
                <button
                  onClick={updatePaper}
                  disabled={updatingPaper}
                  className={`flex-1 py-2 px-4 rounded font-medium transition-all ${
                    !updatingPaper
                      ? 'btn-minimal-primary'
                      : 'btn-minimal-primary opacity-50 cursor-not-allowed'
                  }`}
                >
                  {updatingPaper ? 'Updating...' : 'Update Paper'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
