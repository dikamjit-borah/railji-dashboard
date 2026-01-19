'use client'

import { useState } from 'react'
import { Upload, X, Check } from 'lucide-react'
import { PageHeader } from './PageHeader'
import { ExamJsonEditor } from './ExamJsonEditor'

interface ExamData {
  questionPaper: {
    name: string
    size: string
    uploadTime: string
  } | null
  answerKey: {
    name: string
    size: string
    uploadTime: string
  } | null
}

export function UploadSection() {
  const [exams, setExams] = useState<ExamData[]>([])
  const [currentExam, setCurrentExam] = useState<ExamData>({
    questionPaper: null,
    answerKey: null,
  })
  const [isDragActive, setIsDragActive] = useState<string | null>(null)
  const [selectedExamType, setSelectedExamType] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [examName, setExamName] = useState('')
  const [selectedExamForEditing, setSelectedExamForEditing] = useState<number | null>(null)

  const examTypes = [
    'RRB NTPC',
    'RRB Group D',
    'RRB JE',
    'RRB ALP',
    'Indian Railways Technician',
  ]

  const departments = [
    'General',
    'Mathematics',
    'General Awareness',
    'Reasoning',
    'English',
  ]

  const currentYear = new Date().getFullYear()
  //const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

  const handleDrag = (e: React.DragEvent, type: 'question' | 'answer') => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(type)
    } else if (e.type === 'dragleave') {
      setIsDragActive(null)
    }
  }

  const handleDrop = (e: React.DragEvent, type: 'question' | 'answer') => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(null)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      addFile(file, type)
    }
  }

  const addFile = (file: File, type: 'question' | 'answer') => {
    const fileData = {
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadTime: 'just now',
    }

    if (type === 'question') {
      setCurrentExam({ ...currentExam, questionPaper: fileData })
    } else {
      setCurrentExam({ ...currentExam, answerKey: fileData })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'question' | 'answer') => {
    const files = e.target.files
    if (files && files[0]) {
      addFile(files[0], type)
    }
  }

  const isExamComplete = () => {
    return true
    return currentExam.questionPaper && currentExam.answerKey && examName.trim()
  }

  const submitExam = () => {
    if (isExamComplete()) {
      const newExams = [...exams, { ...currentExam }]
      setExams(newExams)
      setSelectedExamForEditing(newExams.length - 1)
      setCurrentExam({ questionPaper: null, answerKey: null })
      setSelectedExamType('')
      setSelectedDepartment('')
      setSelectedYear('')
      setExamName('')
    }
  }

  const removeExam = (index: number) => {
    setExams(exams.filter((_, i) => i !== index))
  }

  return (
    <>
      {selectedExamForEditing !== null ? (
        <ExamJsonEditor
          onBack={() => setSelectedExamForEditing(null)}
        />
      ) : (
        <div className="bg-slate-50 min-h-screen">
          <PageHeader
            title="Upload Paper"
            subtitle="Add examination papers to the system"
          />

          <div className="px-4 md:px-8 py-8 md:py-12 space-y-12">
            {/* Upload Zone */}
            <section className="max-w-4xl space-y-6">
              {/* Examination Selection Flow */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-950 mb-4">
                  Examination Details
                </label>

                {/* Exam Type Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Select Exam <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedExamType}
                    onChange={(e) => setSelectedExamType(e.target.value)}
                    className="input-minimal w-full text-sm"
                  >
                    <option value="">Choose an exam...</option>
                    {examTypes.map((exam) => (
                      <option key={exam} value={exam}>
                        {exam}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Select Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="input-minimal w-full text-sm"
                  >
                    <option value="">Choose a department...</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Select Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={currentYear - 10}
                    max={currentYear}
                    placeholder="YYYY"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="input-minimal w-full text-sm"
                  />
                </div>

                {/* Paper Name Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Paper Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Morning Shift, Evening Shift"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="input-minimal w-full text-sm"
                  />
                </div>
              </div>

            {/* Two Column Upload - Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Question Paper Upload */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-950">
                  Question Paper <span className="text-red-500">*</span>
                </h3>
                <div
                  onDragEnter={(e) => handleDrag(e, 'question')}
                  onDragLeave={(e) => handleDrag(e, 'question')}
                  onDragOver={(e) => handleDrag(e, 'question')}
                  onDrop={(e) => handleDrop(e, 'question')}
                  className={`border-2 border-dashed p-8 text-center transition-colors min-h-64 flex flex-col items-center justify-center ${
                    isDragActive === 'question'
                      ? 'border-slate-900 bg-slate-100'
                      : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                  } ${currentExam.questionPaper ? 'bg-green-50 border-green-300' : ''}`}
                >
                  {currentExam.questionPaper ? (
                    <div className="text-center">
                      <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-900">
                        {currentExam.questionPaper.name}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {currentExam.questionPaper.size}
                      </p>
                      <button
                        onClick={() =>
                          setCurrentExam({
                            ...currentExam,
                            questionPaper: null,
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
                        Drop question paper here
                      </p>
                      <p className="text-sm text-slate-600 mb-6">
                        or click to browse
                      </p>

                      <label className="inline-block">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleInputChange(e, 'question')}
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

              {/* Answer Key Upload */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-950">
                  Answer Key <span className="text-red-500">*</span>
                </h3>
                <div
                  onDragEnter={(e) => handleDrag(e, 'answer')}
                  onDragLeave={(e) => handleDrag(e, 'answer')}
                  onDragOver={(e) => handleDrag(e, 'answer')}
                  onDrop={(e) => handleDrop(e, 'answer')}
                  className={`border-2 border-dashed p-8 text-center transition-colors min-h-64 flex flex-col items-center justify-center ${
                    isDragActive === 'answer'
                      ? 'border-slate-900 bg-slate-100'
                      : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                  } ${currentExam.answerKey ? 'bg-green-50 border-green-300' : ''}`}
                >
                  {currentExam.answerKey ? (
                    <div className="text-center">
                      <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-900">
                        {currentExam.answerKey.name}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {currentExam.answerKey.size}
                      </p>
                      <button
                        onClick={() =>
                          setCurrentExam({
                            ...currentExam,
                            answerKey: null,
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
                        Drop answer key here
                      </p>
                      <p className="text-sm text-slate-600 mb-6">
                        or click to browse
                      </p>

                      <label className="inline-block">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleInputChange(e, 'answer')}
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
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>• Supported format: PDF only</p>
              <p>• Maximum file size: 50 MB each</p>
              <p>• Both files are mandatory</p>
            </div>

            {isExamComplete() && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={submitExam}
                  disabled={!selectedExamType || !selectedDepartment || !selectedYear || !examName || !currentExam.questionPaper || !currentExam.answerKey}
                  className={`btn-minimal-primary flex-1 ${
                    !selectedExamType || !selectedDepartment || !selectedYear || !examName || !currentExam.questionPaper || !currentExam.answerKey
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  PROCESS
                </button>
                <button
                  onClick={() => {
                    setCurrentExam({ questionPaper: null, answerKey: null })
                    setSelectedExamType('')
                    setSelectedDepartment('')
                    setSelectedYear('')
                    setExamName('')
                  }}
                  className="btn-minimal-secondary flex-1"
                >
                  Clear All
                </button>
              </div>
            )}
          </section>

          {/* Track divider */}
          {exams.length > 0 && <div className="track"></div>}

          {/* Processed Exams */}
          {exams.length > 0 && (
            <section className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Processed Exams
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {exams.length} exam{exams.length !== 1 ? 's' : ''} ready for editing
                </p>
              </div>

              <div className="space-y-3">
                {exams.map((exam, index) => (
                  <div
                    key={index}
                    className="bg-white border border-slate-200 p-6 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-950">
                          {examName}
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600">Question Paper</p>
                            <p className="text-slate-950 font-medium">
                              {exam.questionPaper?.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {exam.questionPaper?.size}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600">Answer Key</p>
                            <p className="text-slate-950 font-medium">
                              {exam.answerKey?.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {exam.answerKey?.size}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setSelectedExamForEditing(index)}
                          className="btn-minimal-primary"
                        >
                          Edit JSON
                        </button>
                        <button
                          onClick={() => removeExam(index)}
                          className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        </div>
      )}
    </>
  )
}
