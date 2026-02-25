'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { PaperJsonEditor } from '@/components/PaperJsonEditor'
import { PaperDetailsForm } from '@/components/PaperDetailsForm'
import { API_ENDPOINTS } from '@/lib/api'

interface PaperData {
  paperType: 'sectional' | 'full' | 'general' | ''
  department: string
  paperCode: string
  year: string
  shift: 'morning' | 'afternoon' | 'evening' | 'night' | ''
  paperName: string
  paperDescription: string
  passPercentage: number | ''
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
  passPercentage?: number
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
    passPercentage: '',
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
      const response = await fetch(API_ENDPOINTS.paperDetail(departmentId, paperId))
      
      if (!response.ok) throw new Error('Failed to fetch paper details')
      const result: ApiResponse = await response.json()
      
      if (result.success && result.data) {
        const paper = result.data.paperDetails
        let questions = result.data.questions || []
        
        // Fetch answers and merge with questions
        const answersResponse = await fetch(API_ENDPOINTS.paperAnswers(departmentId, paperId))
        if (!answersResponse.ok) {
          throw new Error('Failed to fetch answers')
        }
        
        const answersResult = await answersResponse.json()
        if (!answersResult.success || !answersResult.data?.answers) {
          throw new Error('Invalid answers response format')
        }
        
        const answersMap = new Map(
          answersResult.data.answers.map((ans: { id: number; correct: number }) => [ans.id, ans.correct])
        )
        
        // Map answers to questions
        questions = questions.map((q: any) => ({
          ...q,
          correct: answersMap.get(q.id) ?? q.correct
        }))
        
        // Populate currentPaper with fetched data
        setCurrentPaper({
          paperType: (paper.paperType as any) || '',
          department: paper.departmentId || '',
          paperCode: paper.paperCode || '',
          year: paper.year ? String(paper.year) : '',
          shift: (paper.shift?.toLowerCase() as any) || '',
          paperName: paper.name || '',
          paperDescription: paper.description || '',
          passPercentage: paper.passPercentage ?? '',
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
    setUpdatingPaper(true)
    try {
      const questions = currentPaper.jsonFile?.content?.questions || []
      const totalQuestions = questions.length

      const payload = {
        departmentId: currentPaper.department || undefined,
        paperCode: currentPaper.paperType === 'full' ? undefined : (currentPaper.paperCode || undefined),
        paperType: currentPaper.paperType,
        name: currentPaper.paperName,
        description: currentPaper.paperDescription,
        year: Number(currentPaper.year),
        shift: currentPaper.shift.charAt(0).toUpperCase() + currentPaper.shift.slice(1),
        totalQuestions,
        passPercentage: Number(currentPaper.passPercentage),
        negativeMarking: Number(currentPaper.negativeMarks),
        duration: Number(currentPaper.duration),
        isFree: currentPaper.isFree,
        questions,
      }

      const response = await fetch(
        API_ENDPOINTS.updatePaper(paperId),
        {
          method: 'PATCH',
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
            <PaperDetailsForm
              currentPaper={currentPaper}
              setCurrentPaper={setCurrentPaper}
              onBack={() => setStage('editor')}
              onSubmit={updatePaper}
              isSubmitting={updatingPaper}
              submitButtonText="Update Paper"
            />
          </div>
        </div>
      )}
    </>
  )
}
