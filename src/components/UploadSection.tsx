'use client'

import { useState, useEffect } from 'react'
import { Upload, Check } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { PaperJsonEditor } from './PaperJsonEditor'
import { API_ENDPOINTS } from '@/lib/api'

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
    if (currentPaper.department && currentPaper.paperType === 'sectional') {
      fetchPaperCodes(currentPaper.department, currentPaper.paperType)
    }
  }, [currentPaper.department, currentPaper.paperType])

  // Handle paper type changes
  useEffect(() => {
    if (currentPaper.paperType === 'general') {
      // For general papers, clear department and paper code, then fetch general codes
      setCurrentPaper((prev) => ({
        ...prev,
        department: '',
        paperCode: '',
      }))
      fetchGeneralPaperCodes('general')
    } else if (currentPaper.paperType === 'full') {
      // For full papers, ensure departments are loaded but clear paper code (not applicable)
      if (departments.length === 0) {
        fetchDepartments()
      }
      setPaperCodes([])
      setCurrentPaper((prev) => ({
        ...prev,
        paperCode: '',
      }))
    } else if (currentPaper.paperType === 'sectional') {
      // For sectional papers, ensure departments are loaded
      if (departments.length === 0) {
        fetchDepartments()
      }
      // Clear paper codes until department is selected
      setPaperCodes([])
      setCurrentPaper((prev) => ({
        ...prev,
        paperCode: '',
      }))
    }
  }, [currentPaper.paperType])

  const fetchDepartments = async () => {
    setLoadingDepartments(true)
    try {
      const response = await fetch(API_ENDPOINTS.departments)
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
      const response = await fetch(API_ENDPOINTS.papersByType(departmentId, paperType))
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
      const response = await fetch(API_ENDPOINTS.generalPapersByType(paperType))
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
      
      // Check file size (10 MB limit)
      const maxSize = 10 * 1024 * 1024 // 10 MB in bytes
      if (file.size > maxSize) {
        alert('File is too large. Maximum file size is 10 MB.')
        return
      }
      
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
            setCurrentPaper({ ...currentPaper, jsonFile: fileData })
          } catch (error) {
            alert('Invalid JSON file. Please upload a valid JSON file.')
            console.error('JSON parse error:', error)
          }
        }
        reader.onerror = () => {
          alert('Failed to read file. Please try again.')
        }
        reader.readAsText(file)
      }
    }
  }

  const isPaperComplete = () => {
    const baseFilled =
      currentPaper.paperType &&
      currentPaper.year &&
      currentPaper.shift &&
      currentPaper.paperName.trim() &&
      currentPaper.passMarks !== '' &&
      currentPaper.negativeMarks !== '' &&
      currentPaper.duration !== '' &&
      currentPaper.jsonFile

    // For general papers, department is not required but paperCode is required
    if (currentPaper.paperType === 'general') {
      return baseFilled && currentPaper.paperCode
    }

    // For full papers, department is required but paperCode is not applicable
    if (currentPaper.paperType === 'full') {
      return baseFilled && currentPaper.department
    }

    // For sectional papers, both department and paperCode are required
    return baseFilled && currentPaper.department && currentPaper.paperCode
  }

  const createPaper = async () => {
    if (!isPaperComplete()) {
      alert('Please fill all required fields')
      return
    }

    setCreatingPaper(true)
    try {
      // Extract questions from JSON file
      const questions = currentPaper.jsonFile?.content?.questions || []
      
      // Extract sections and other metadata from JSON
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
        passMarks: Number(currentPaper.passMarks),
        negativeMarking: Number(currentPaper.negativeMarks),
        duration: Number(currentPaper.duration),
        isFree: currentPaper.isFree,
        questions,
      }

      const response = await fetch(API_ENDPOINTS.createPaper, {
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
      setCurrentPaper({
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
      setCurrentPaper({
        ...currentPaper,
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
      
      // Check file size (10 MB limit)
      const maxSize = 10 * 1024 * 1024 // 10 MB in bytes
      if (file.size > maxSize) {
        alert('File is too large. Maximum file size is 10 MB.')
        e.target.value = '' // Reset input
        return
      }
      
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
          setCurrentPaper({ ...currentPaper, jsonFile: fileData })
          e.target.value = '' // Reset input after successful upload
        } catch (error) {
          alert('Invalid JSON file. Please upload a valid JSON file.')
          console.error('JSON parse error:', error)
          e.target.value = '' // Reset input on error
        }
      }
      
      reader.onerror = () => {
        alert('Failed to read file. Please try again.')
        e.target.value = '' // Reset input on error
      }
      
      reader.readAsText(file)
    }
  }

  return (
    <>
      {stage === 'editor' ? (
        <PaperJsonEditor
          onBack={() => setStage('upload')}
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
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentPaper.department}
                  onChange={(e) =>
                    setCurrentPaper({
                      ...currentPaper,
                      department: e.target.value,
                      paperCode: '',
                    })
                  }
                  disabled={!currentPaper.paperType || currentPaper.paperType === 'general' || loadingDepartments}
                  className="input-minimal w-full disabled:opacity-50"
                >
                  <option value="">
                    {!currentPaper.paperType
                      ? 'Select paper type first'
                      : currentPaper.paperType === 'general'
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
                  Section Code {currentPaper.paperType !== 'full' && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={currentPaper.paperCode}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowAddPaperCodeModal(true)
                    } else {
                      setCurrentPaper({
                        ...currentPaper,
                        paperCode: e.target.value,
                      })
                    }
                  }}
                  disabled={
                    !currentPaper.paperType ||
                    currentPaper.paperType === 'full' ||
                    (currentPaper.paperType === 'sectional' && !currentPaper.department) ||
                    loadingCodes
                  }
                  className="input-minimal w-full disabled:opacity-50"
                >
                  <option value="">
                    {!currentPaper.paperType
                      ? 'Select paper type first'
                      : currentPaper.paperType === 'full'
                        ? 'Not applicable for Full papers'
                        : currentPaper.paperType === 'sectional' && !currentPaper.department
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
                  onClick={() => setStage('upload')}
                  className="flex-1 py-2 px-4 rounded font-medium btn-minimal-secondary"
                >
                  Back
                </button>
                <button
                  onClick={createPaper}
                  disabled={!isPaperComplete() || creatingPaper}
                  className={`flex-1 py-2 px-4 rounded font-medium transition-all ${
                    isPaperComplete() && !creatingPaper
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
                  } ${currentPaper.jsonFile ? 'bg-green-50 border-green-300' : ''}`}
                >
                  {currentPaper.jsonFile ? (
                    <div className="text-center">
                      <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-900">
                        {currentPaper.jsonFile.name}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {currentPaper.jsonFile.size}
                      </p>
                      <button
                        onClick={() =>
                          setCurrentPaper({
                            ...currentPaper,
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
                  if (currentPaper.jsonFile) {
                    setStage('editor')
                  }
                }}
                disabled={!currentPaper.jsonFile}
                className={`w-full py-2 px-4 rounded font-medium transition-all ${
                  currentPaper.jsonFile
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
