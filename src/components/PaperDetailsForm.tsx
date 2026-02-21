'use client'

import { useState, useEffect } from 'react'
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

interface PaperDetailsFormProps {
  currentPaper: PaperData
  setCurrentPaper: (paper: PaperData) => void
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
  submitButtonText: string
}

export function PaperDetailsForm({
  currentPaper,
  setCurrentPaper,
  onBack,
  onSubmit,
  isSubmitting,
  submitButtonText,
}: PaperDetailsFormProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [paperCodes, setPaperCodes] = useState<string[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [loadingCodes, setLoadingCodes] = useState(false)
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
      fetchGeneralPaperCodes('general')
    } else if (currentPaper.paperType === 'full') {
      if (departments.length === 0) {
        fetchDepartments()
      }
      setPaperCodes([])
    } else if (currentPaper.paperType === 'sectional') {
      if (departments.length === 0) {
        fetchDepartments()
      }
      setPaperCodes([])
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
      setDepartments([])
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
        const codes = data.data.metadata.paperCodes.nonGeneral || []
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
      const response = await fetch(API_ENDPOINTS.generalPapersByType(paperType))
      const data = await response.json()

      if (data.success && data.data?.metadata?.paperCodes) {
        const codes = data.data.metadata.paperCodes.general || []
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

  const isPaperComplete = () => {
    const baseFilled =
      currentPaper.paperType &&
      currentPaper.year &&
      currentPaper.shift &&
      currentPaper.paperName.trim() &&
      currentPaper.passPercentage !== '' &&
      currentPaper.passPercentage >= 0 &&
      currentPaper.passPercentage <= 100 &&
      currentPaper.negativeMarks !== '' &&
      currentPaper.negativeMarks >= 0 &&
      currentPaper.negativeMarks <= 10 &&
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

  return (
    <>
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

        {/* Pass Percentage and Negative Marks */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Pass Percentage (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g., 40"
              min="0"
              max="100"
              value={currentPaper.passPercentage}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : ''
                if (value === '' || (value >= 0 && value <= 100)) {
                  setCurrentPaper({
                    ...currentPaper,
                    passPercentage: value,
                  })
                }
              }}
              className="input-minimal w-full"
            />
            {currentPaper.passPercentage !== '' && 
             (currentPaper.passPercentage < 0 || currentPaper.passPercentage > 100) && (
              <p className="text-xs text-red-600 mt-1">Must be between 0 and 100</p>
            )}
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
              max="10"
              value={currentPaper.negativeMarks}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : ''
                if (value === '' || (value >= 0 && value <= 10)) {
                  setCurrentPaper({
                    ...currentPaper,
                    negativeMarks: value,
                  })
                }
              }}
              className="input-minimal w-full"
            />
            {currentPaper.negativeMarks !== '' && 
             (currentPaper.negativeMarks < 0 || currentPaper.negativeMarks > 10) && (
              <p className="text-xs text-red-600 mt-1">Must be between 0 and 10</p>
            )}
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
            onClick={onBack}
            className="flex-1 py-2 px-4 rounded font-medium btn-minimal-secondary"
          >
            Back
          </button>
          <button
            onClick={onSubmit}
            disabled={!isPaperComplete() || isSubmitting}
            className={`flex-1 py-2 px-4 rounded font-medium transition-all ${
              isPaperComplete() && !isSubmitting
                ? 'btn-minimal-primary'
                : 'btn-minimal-primary opacity-50 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Processing...' : submitButtonText}
          </button>
        </div>
      </div>

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
