'use client'

import { useState, useEffect } from 'react'
import { Upload, Check } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { ExamJsonEditor } from './ExamJsonEditor'

interface ExamData {
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

interface Department {
  _id: string
  departmentId: string
  slug: string
  name: string
  fullName: string
  description: string
  icon: string
  img: string
  paperCount: number
  materialCount: number
  createdAt: string
  updatedAt: string
}

export function UploadSection() {
  const [stage, setStage] = useState<'upload' | 'editor' | 'details'>('upload')
  const [currentExam, setCurrentExam] = useState<ExamData>({
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
  const [isDragActive, setIsDragActive] = useState<string | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [paperCodes, setPaperCodes] = useState<string[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [loadingCodes, setLoadingCodes] = useState(false)
  const [creatingPaper, setCreatingPaper] = useState(false)
  const [showAddPaperCodeModal, setShowAddPaperCodeModal] = useState(false)
  const [newPaperCode, setNewPaperCode] = useState('')

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments()
  }, [])

  // Fetch paper codes when department or paperType changes
  useEffect(() => {
    if (currentExam.department && currentExam.paperType !== 'general') {
      fetchPaperCodes(currentExam.department, currentExam.paperType)
    }
  }, [currentExam.department, currentExam.paperType])

  // Handle paper type changes
  useEffect(() => {
    if (currentExam.paperType === 'general') {
      // For general papers, clear department and paper code, then fetch general codes
      setCurrentExam((prev) => ({
        ...prev,
        department: '',
        paperCode: '',
      }))
      fetchGeneralPaperCodes('general')
    } else if (currentExam.paperType === 'full' || currentExam.paperType === 'sectional') {
      // For sectional/full papers, ensure departments are loaded
      if (departments.length === 0) {
        fetchDepartments()
      }
      // Clear paper codes until department is selected
      setPaperCodes([])
      setCurrentExam((prev) => ({
        ...prev,
        paperCode: '',
      }))
    }
  }, [currentExam.paperType])

  const fetchDepartments = async () => {
    setLoadingDepartments(true)
    try {
      const response = await fetch('https://railji-business.onrender.com/business/v1/departments')
      const data = await response.json()
      
      if (data.success && data.data) {
        setDepartments(data.data)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
      // Fallback mock data
      setDepartments([
        {
          _id: '1',
          departmentId: 'DEPT001',
          slug: 'civil-engineering',
          name: 'Civil',
          fullName: 'Civil Engineering',
          description: 'Infrastructure, bridges, tracks & construction',
          icon: 'building',
          img: '/images/departments/civil.jpg',
          paperCount: 0,
          materialCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
    } finally {
      setLoadingDepartments(false)
    }
  }

  const fetchPaperCodes = async (departmentId: string, paperType: string) => {
    setLoadingCodes(true)
    try {
      const response = await fetch(
        `https://railji-business.onrender.com/business/v1/papers/${departmentId}?paperType=${paperType}`
      )
      const data = await response.json()

      if (data.success && data.data?.metadata?.paperCodes) {
        // If paperType is general, use general array, else use nonGeneral array
        const codes =
          paperType === 'general'
            ? data.data.metadata.paperCodes.general || []
            : data.data.metadata.paperCodes.nonGeneral || []
        console.log('Paper codes fetched:', codes, 'for paperType:', paperType)
        setPaperCodes(codes)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Failed to fetch paper codes:', error)
      setPaperCodes([])
    } finally {
      setLoadingCodes(false)
    }
  }

  const fetchGeneralPaperCodes = async (paperType: string) => {
    setLoadingCodes(true)
    try {
      // Use a default department ID for general papers
      const response = await fetch(
        `https://railji-business.onrender.com/business/v1/papers/general?paperType=${paperType}`
      )
      const data = await response.json()

      if (data.success && data.data?.metadata?.paperCodes) {
        // For general papers, use general array
        const codes = data.data.metadata.paperCodes.general || []
        console.log('General paper codes fetched:', codes)
        setPaperCodes(codes)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Failed to fetch general paper codes:', error)
      setPaperCodes([])
    } finally {
      setLoadingCodes(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive('question')
    } else if (e.type === 'dragleave') {
      setIsDragActive(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(null)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      // Handle JSON file drop
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const content = JSON.parse(event.target?.result as string)
            const fileData = {
              name: file.name,
              size: `${(file.size / 1024).toFixed(1)} KB`,
              uploadTime: 'just now',
              content: content,
            }
            setCurrentExam({ ...currentExam, jsonFile: fileData })
          } catch (error) {
            alert('Invalid JSON file. Please upload a valid JSON file.')
            console.error('JSON parse error:', error)
          }
        }
        reader.readAsText(file)
      }
    }
  }

  const isExamComplete = () => {
    const baseFilled =
      currentExam.paperType &&
      currentExam.year &&
      currentExam.shift &&
      currentExam.paperName.trim() &&
      currentExam.passMarks !== '' &&
      currentExam.negativeMarks !== '' &&
      currentExam.duration !== '' &&
      currentExam.jsonFile

    // For general papers, department and paperCode are not required
    if (currentExam.paperType === 'general') {
      return baseFilled
    }

    // For sectional and full papers, department and paperCode are required
    return baseFilled && currentExam.department && currentExam.paperCode
  }

  const createPaper = async () => {
    if (!isExamComplete()) {
      alert('Please fill all required fields')
      return
    }

    setCreatingPaper(true)
    try {
      // Extract questions from JSON file
      const questions = currentExam.jsonFile?.content?.questions || []
      
      // Extract sections and other metadata from JSON
      const totalQuestions = questions.length

      const payload = {
        departmentId: currentExam.department || undefined,
        paperCode: currentExam.paperCode || undefined,
        paperType: currentExam.paperType,
        name: currentExam.paperName,
        description: currentExam.paperDescription,
        year: Number(currentExam.year),
        shift: currentExam.shift.charAt(0).toUpperCase() + currentExam.shift.slice(1),
        totalQuestions,
        passMarks: Number(currentExam.passMarks),
        negativeMarking: Number(currentExam.negativeMarks),
        duration: Number(currentExam.duration),
        isFree: currentExam.isFree,
        questions,
      }

      const response = await fetch('https://railji-dashboard.onrender.com/dashboard/v1/create/paper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `API error: ${response.statusText}`)
      }

      const result = await response.json()
      alert('Paper created successfully!')
      console.log('Paper created:', result)

      // Reset form after successful creation
      setCurrentExam({
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
      setStage('upload')
    } catch (error) {
      console.error('Failed to create paper:', error)
      alert(`Failed to create paper: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setCreatingPaper(false)
    }
  }

  const handleAddPaperCode = () => {
    if (newPaperCode.trim()) {
      setPaperCodes([...paperCodes, newPaperCode.trim()])
      setCurrentExam({
        ...currentExam,
        paperCode: newPaperCode.trim(),
      })
      setNewPaperCode('')
      setShowAddPaperCodeModal(false)
    }
  }

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      const file = files[0]
      const reader = new FileReader()
      
      reader.onload = (event) => {
        try {
          const content = JSON.parse(event.target?.result as string)
          const fileData = {
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            uploadTime: 'just now',
            content: content,
          }
          setCurrentExam({ ...currentExam, jsonFile: fileData })
        } catch (error) {
          alert('Invalid JSON file. Please upload a valid JSON file.')
          console.error('JSON parse error:', error)
        }
      }
      
      reader.readAsText(file)
    }
  }

  return (
    <>
      {stage === 'editor' ? (
        <ExamJsonEditor
          onBack={() => setStage('upload')}
          onNext={() => setStage('details')}
          initialQuestions={currentExam.jsonFile?.content}
        />
      ) : stage === 'details' ? (
        <div className="ml-56 bg-slate-50 min-h-screen">
          <PageHeader
            title="Paper Details"
            subtitle="Fill in the paper information"
          />
          <div className="px-8 py-12">
            <div className="max-w-2xl space-y-6">
              {/* Paper Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Paper Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentExam.paperType}
                  onChange={(e) =>
                    setCurrentExam({
                      ...currentExam,
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
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentExam.department}
                  onChange={(e) =>
                    setCurrentExam({
                      ...currentExam,
                      department: e.target.value,
                      paperCode: '',
                    })
                  }
                  disabled={!currentExam.paperType || currentExam.paperType === 'general' || loadingDepartments}
                  className="input-minimal w-full disabled:opacity-50"
                >
                  <option value="">
                    {!currentExam.paperType
                      ? 'Select paper type first'
                      : currentExam.paperType === 'general'
                        ? 'Not applicable for General papers'
                        : loadingDepartments
                          ? 'Loading departments...'
                          : 'Select department'}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept.departmentId}>
                      {dept.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Paper Code */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Section Code <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentExam.paperCode}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowAddPaperCodeModal(true)
                    } else {
                      setCurrentExam({
                        ...currentExam,
                        paperCode: e.target.value,
                      })
                    }
                  }}
                  disabled={
                    !currentExam.paperType ||
                    (currentExam.paperType !== 'general' && !currentExam.department) ||
                    loadingCodes
                  }
                  className="input-minimal w-full disabled:opacity-50"
                >
                  <option value="">
                    {!currentExam.paperType
                      ? 'Select paper type first'
                      : currentExam.paperType !== 'general' && !currentExam.department
                        ? 'Select department first'
                        : loadingCodes
                          ? 'Loading codes...'
                          : 'Select section code'}
                  </option>
                  {paperCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                  <option value="__add_new__">+ Add New Section Code</option>
                </select>
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
                  value={currentExam.year}
                  onChange={(e) =>
                    setCurrentExam({
                      ...currentExam,
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
                  value={currentExam.shift}
                  onChange={(e) =>
                    setCurrentExam({
                      ...currentExam,
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
                  value={currentExam.paperName}
                  onChange={(e) =>
                    setCurrentExam({
                      ...currentExam,
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
                  value={currentExam.paperDescription}
                  onChange={(e) =>
                    setCurrentExam({
                      ...currentExam,
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
                    value={currentExam.passMarks}
                    onChange={(e) =>
                      setCurrentExam({
                        ...currentExam,
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
                    value={currentExam.negativeMarks}
                    onChange={(e) =>
                      setCurrentExam({
                        ...currentExam,
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
                  value={currentExam.duration}
                  onChange={(e) =>
                    setCurrentExam({
                      ...currentExam,
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
                    checked={currentExam.isFree}
                    onChange={(e) =>
                      setCurrentExam({
                        ...currentExam,
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
                  onClick={() => setStage('upload')}
                  className="flex-1 py-2 px-4 rounded font-medium btn-minimal-secondary"
                >
                  Back
                </button>
                <button
                  onClick={createPaper}
                  disabled={!isExamComplete() || creatingPaper}
                  className={`flex-1 py-2 px-4 rounded font-medium transition-all ${
                    isExamComplete() && !creatingPaper
                      ? 'btn-minimal-primary'
                      : 'btn-minimal-primary opacity-50 cursor-not-allowed'
                  }`}
                >
                  {creatingPaper ? 'Creating...' : 'Create Paper'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="ml-56 bg-slate-50 min-h-screen">
          <PageHeader
            title="Upload Paper"
            subtitle="Upload JSON file to get started"
          />
          <div className="px-8 py-12">
            <div className="max-w-2xl space-y-6">
              {/* JSON File Upload */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-950">
                  Questions JSON File <span className="text-red-500">*</span>
                </h3>
                <div
                  onDragEnter={(e) => handleDrag(e)}
                  onDragLeave={(e) => handleDrag(e)}
                  onDragOver={(e) => handleDrag(e)}
                  onDrop={(e) => handleDrop(e)}
                  className={`border-2 border-dashed p-8 text-center transition-colors ${
                    isDragActive === 'question'
                      ? 'border-slate-900 bg-slate-100'
                      : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                  } ${currentExam.jsonFile ? 'bg-green-50 border-green-300' : ''}`}
                >
                  {currentExam.jsonFile ? (
                    <div className="text-center">
                      <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-900">
                        {currentExam.jsonFile.name}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {currentExam.jsonFile.size}
                      </p>
                      <button
                        onClick={() =>
                          setCurrentExam({
                            ...currentExam,
                            jsonFile: null,
                          })
                        }
                        className="mt-3 text-xs text-green-600 hover:text-green-800 underline"
                      >
                        Change file
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                      <p className="text-base font-medium text-slate-950 mb-2">
                        Drop JSON file here
                      </p>
                      <p className="text-sm text-slate-600 mb-6">
                        or click to browse
                      </p>
                      <label className="inline-block">
                        <input
                          type="file"
                          accept=".json"
                          onChange={(e) => handleJsonFileChange(e)}
                          className="hidden"
                        />
                        <span className="btn-minimal-primary cursor-pointer">
                          Choose File
                        </span>
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>• Supported format: JSON only</p>
                <p>• Maximum file size: 10 MB</p>
              </div>

              {/* Button */}
              <button
                onClick={() => {
                  if (currentExam.jsonFile) {
                    setStage('editor')
                  }
                }}
                disabled={!currentExam.jsonFile}
                className={`w-full py-2 px-4 rounded font-medium transition-all ${
                  currentExam.jsonFile
                    ? 'btn-minimal-primary'
                    : 'btn-minimal-primary opacity-50 cursor-not-allowed'
                }`}
              >
                Next: Edit Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Paper Code Modal */}
      {showAddPaperCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-slate-950 mb-4">Add New Section Code</h2>
            <input
              type="text"
              placeholder="Enter section code (e.g., RRB-2024-001)"
              value={newPaperCode}
              onChange={(e) => setNewPaperCode(e.target.value)}
              className="input-minimal w-full mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddPaperCode()
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddPaperCode}
                disabled={!newPaperCode.trim()}
                className={`flex-1 py-2 px-4 rounded font-medium ${
                  newPaperCode.trim()
                    ? 'btn-minimal-primary'
                    : 'btn-minimal-primary opacity-50 cursor-not-allowed'
                }`}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddPaperCodeModal(false)
                  setNewPaperCode('')
                }}
                className="flex-1 py-2 px-4 rounded font-medium btn-minimal-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
