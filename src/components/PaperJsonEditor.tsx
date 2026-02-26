'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2, Copy, Check } from 'lucide-react'

interface Question {
  id?: number
  ques?: string
  question?: { en: string; hi: string }
  ques_hi?: string
  options: Array<{ en: string; hi: string }>
  correct: string | number
  details?: Array<{ en: string; hi: string }>
}

interface NormalizedQuestion {
  id?: number
  question: { en: string; hi: string }
  options: Array<{ en: string; hi: string }>
  correct: number
  details: Array<{ en: string; hi: string }>
}

export function PaperJsonEditor({ 
  onBack,
  onNext,
  initialQuestions,
  fileName,
  allowJsonEdit = false
}: { 
  readonly onBack: () => void
  readonly onNext?: (updatedData: any) => void
  readonly initialQuestions?: Question[] | { questions: Question[] }
  readonly fileName?: string
  readonly allowJsonEdit?: boolean
}) {
  // Normalize the questions data for editing
  const normalizeQuestions = (data: any): NormalizedQuestion[] => {
    const questionsArray = Array.isArray(data) ? data : data?.questions || []
    
    return questionsArray.map((q: any) => {
      let correctValue = 0
      
      if (typeof q.correct === 'number') {
        correctValue = q.correct
      } else if (typeof q.correct === 'string' && q.options) {
        const foundIndex = q.options.findIndex((opt: any) => opt.en === q.correct)
        correctValue = foundIndex >= 0 ? foundIndex : 0
      }
      
      return {
        id: q.id,
        question: q.question || { en: q.ques || 'Question', hi: q.ques_hi || 'प्रश्न' },
        options: q.options || [],
        correct: correctValue,
        details: q.details || [],
      }
    })
  }

  const [questions, setQuestions] = useState<NormalizedQuestion[]>(normalizeQuestions(initialQuestions))
  const [copied, setCopied] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [jsonEditMode, setJsonEditMode] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  
  // Use refs to store pending updates without triggering re-renders
  const pendingUpdatesRef = useRef<Map<string, any>>(new Map())
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)
  const jsonUpdateTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Batch updates to reduce re-renders
  const scheduleUpdate = useCallback((key: string, value: any) => {
    pendingUpdatesRef.current.set(key, value)
    
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current)
    }
    
    updateTimerRef.current = setTimeout(() => {
      const updates = new Map(pendingUpdatesRef.current)
      pendingUpdatesRef.current.clear()
      
      setQuestions(prev => {
        let newQuestions = [...prev]
        
        updates.forEach((value, key) => {
          const [type, qIndex, ...rest] = key.split('-')
          const questionIndex = parseInt(qIndex)
          
          if (type === 'question') {
            const lang = rest[0] as 'en' | 'hi'
            newQuestions[questionIndex] = {
              ...newQuestions[questionIndex],
              question: {
                ...newQuestions[questionIndex].question,
                [lang]: value
              }
            }
          } else if (type === 'option') {
            const optionIndex = parseInt(rest[0])
            const lang = rest[1] as 'en' | 'hi'
            const updatedQuestion = { ...newQuestions[questionIndex] }
            updatedQuestion.options = [...updatedQuestion.options]
            updatedQuestion.options[optionIndex] = {
              ...updatedQuestion.options[optionIndex],
              [lang]: value
            }
            newQuestions[questionIndex] = updatedQuestion
          } else if (type === 'detail') {
            const detailIndex = parseInt(rest[0])
            const lang = rest[1] as 'en' | 'hi'
            const updatedQuestion = { ...newQuestions[questionIndex] }
            updatedQuestion.details = [...updatedQuestion.details]
            updatedQuestion.details[detailIndex] = {
              ...updatedQuestion.details[detailIndex],
              [lang]: value
            }
            newQuestions[questionIndex] = updatedQuestion
          }
        })
        
        return newQuestions
      })
    }, 300) // Increased debounce time
  }, [])

  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
      }
      if (jsonUpdateTimerRef.current) {
        clearTimeout(jsonUpdateTimerRef.current)
      }
    }
  }, [])

  // Memoize the original data structure
  const originalData = useMemo(() => {
    const hasQuestionsWrapper = initialQuestions && !Array.isArray(initialQuestions) && 'questions' in initialQuestions
    
    return hasQuestionsWrapper
      ? {
          ...initialQuestions,
          questions: questions.map((q, index) => ({
            id: q.id || ((initialQuestions as any).questions[index]?.id),
            question: q.question,
            options: q.options,
            correct: q.correct,
            details: q.details.length > 0 ? q.details : undefined,
          })),
        }
      : questions.map((q, index) => ({
          id: q.id || index + 1,
          question: q.question,
          options: q.options,
          correct: q.correct,
          details: q.details.length > 0 ? q.details : undefined,
        }))
  }, [questions, initialQuestions])

  // Memoize JSON text with debounced updates
  const generatedJsonText = useMemo(() => JSON.stringify(originalData, null, 2), [originalData])
  
  // Update jsonText when questions change (only if not in edit mode) - debounced
  useEffect(() => {
    if (!jsonEditMode) {
      if (jsonUpdateTimerRef.current) {
        clearTimeout(jsonUpdateTimerRef.current)
      }
      
      jsonUpdateTimerRef.current = setTimeout(() => {
        setJsonText(generatedJsonText)
      }, 500) // Debounce JSON preview updates
    }
  }, [generatedJsonText, jsonEditMode])

  const applyJsonChanges = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText)
      const normalized = normalizeQuestions(parsed)
      setQuestions(normalized)
      setJsonEditMode(false)
      setJsonError(null)
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON format')
    }
  }, [jsonText])

  const cancelJsonEdit = useCallback(() => {
    setJsonText(generatedJsonText)
    setJsonEditMode(false)
    setJsonError(null)
  }, [generatedJsonText])

  const addQuestion = useCallback(() => {
    const newQuestion: NormalizedQuestion = {
      id: questions.length + 1,
      question: { en: 'New Question', hi: 'नया प्रश्न' },
      options: [
        { en: 'Option A', hi: 'विकल्प A' },
        { en: 'Option B', hi: 'विकल्प B' },
        { en: 'Option C', hi: 'विकल्प C' },
        { en: 'Option D', hi: 'विकल्प D' },
      ],
      correct: 0,
      details: [],
    }
    setQuestions(prev => [...prev, newQuestion])
  }, [questions.length])

  const updateQuestion = useCallback((index: number, field: 'correct', value: number) => {
    setQuestions(prev => {
      const newQuestions = [...prev]
      newQuestions[index] = { ...newQuestions[index], [field]: value }
      return newQuestions
    })
  }, [])

  const deleteQuestion = useCallback((index: number) => {
    setQuestions(prev => {
      const filtered = prev.filter((_, i) => i !== index)
      // Re-number the IDs sequentially
      return filtered.map((q, i) => ({ ...q, id: i + 1 }))
    })
    // Close the expanded section when deleting a question
    setExpandedIndex(prev => {
      if (prev === null) return null
      if (prev === index) return null // If deleting the expanded question, close it
      if (prev > index) return prev - 1 // If deleting before expanded, adjust index
      return prev // Otherwise keep the same
    })
  }, [])

  const updateOption = useCallback((qIndex: number, oIndex: number, lang: 'en' | 'hi', value: string) => {
    scheduleUpdate(`option-${qIndex}-${oIndex}-${lang}`, value)
  }, [scheduleUpdate])

  const updateQuestionText = useCallback((qIndex: number, lang: 'en' | 'hi', value: string) => {
    scheduleUpdate(`question-${qIndex}-${lang}`, value)
  }, [scheduleUpdate])

  const updateDetail = useCallback((qIndex: number, dIndex: number, lang: 'en' | 'hi', value: string) => {
    scheduleUpdate(`detail-${qIndex}-${dIndex}-${lang}`, value)
  }, [scheduleUpdate])

  const addDetail = useCallback((qIndex: number) => {
    setQuestions(prev => {
      const newQuestions = [...prev]
      newQuestions[qIndex] = {
        ...newQuestions[qIndex],
        details: [...newQuestions[qIndex].details, { en: '', hi: '' }]
      }
      return newQuestions
    })
  }, [])

  const deleteDetail = useCallback((qIndex: number, dIndex: number) => {
    setQuestions(prev => {
      const newQuestions = [...prev]
      newQuestions[qIndex] = {
        ...newQuestions[qIndex],
        details: newQuestions[qIndex].details.filter((_, i) => i !== dIndex)
      }
      return newQuestions
    })
  }, [])

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(jsonText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [jsonText])

  const getCurrentData = useCallback(() => originalData, [originalData])

  return (
    <div className="fixed inset-0 ml-56 bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Paper Editor</h1>
              <p className="text-sm text-slate-600 mt-1">
                {fileName ? (
                  <>
                    File: <span className="font-semibold text-slate-950 bg-yellow-100 px-2 py-0.5 rounded">{fileName}</span>
                  </>
                ) : (
                  'Edit paper questions and answers in JSON format'
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-950 font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy JSON
                </>
              )}
            </button>
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
            {onNext && (
              <button
                onClick={() => onNext(getCurrentData())}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Next: Paper Details →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 border-r border-slate-200">
            {questions.map((question, qIndex) => (
              <div
                key={`q-${qIndex}`}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors"
              >
                <button
                  onClick={() =>
                    setExpandedIndex(expandedIndex === qIndex ? null : qIndex)
                  }
                  className="w-full p-4 text-left hover:bg-slate-50 transition-colors flex items-start justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-950">
                      Q{question.id || qIndex + 1}: {question.question.en}
                    </p>
                    <p className="font-semibold text-slate-950 text-sm mt-1">
                      {question.question.hi}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      Correct Answer:{' '}
                      <span className="font-medium text-green-700">
                        {String.fromCharCode(65 + question.correct)}
                      </span>
                    </p>
                  </div>
                  <span className="text-slate-400 ml-4">
                    {expandedIndex === qIndex ? '▼' : '▶'}
                  </span>
                </button>

                {expandedIndex === qIndex && (
                  <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-4">
                    {/* Question Text */}
                    <div className="space-y-3">
                      <div>
                        <label
                          htmlFor={`ques-${qIndex}`}
                          className="block text-sm font-semibold text-slate-950 mb-2"
                        >
                          Question Text (English)
                        </label>
                        <input
                          id={`ques-${qIndex}`}
                          type="text"
                          defaultValue={question.question.en}
                          onChange={(e) => updateQuestionText(qIndex, 'en', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-950 focus:outline-none focus:border-slate-400"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`ques-hi-${qIndex}`}
                          className="block text-sm font-semibold text-slate-950 mb-2"
                        >
                          Question Text (Hindi)
                        </label>
                        <input
                          id={`ques-hi-${qIndex}`}
                          type="text"
                          defaultValue={question.question.hi}
                          onChange={(e) => updateQuestionText(qIndex, 'hi', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-950 focus:outline-none focus:border-slate-400"
                        />
                      </div>
                    </div>

                    {/* Options */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-950 mb-3">
                        Options
                      </label>
                      <div className="space-y-3">
                        {question.options.map((option, oIndex) => (
                          <div
                            key={`o-${qIndex}-${oIndex}`}
                            className={`p-3 rounded-lg border ${
                              oIndex === question.correct
                                ? 'bg-green-50 border-green-300'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-semibold text-slate-500 w-6">
                                {String.fromCodePoint(65 + oIndex)}.
                              </span>
                              <input
                                type="text"
                                placeholder="English"
                                defaultValue={option.en}
                                onChange={(e) =>
                                  updateOption(qIndex, oIndex, 'en', e.target.value)
                                }
                                className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-slate-950 text-sm focus:outline-none focus:border-slate-400"
                              />
                              {oIndex === question.correct && (
                                <span className="text-xs font-semibold text-green-700 px-2 py-1 bg-green-100 rounded">
                                  Correct
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 ml-8">
                              <input
                                type="text"
                                placeholder="Hindi"
                                defaultValue={option.hi}
                                onChange={(e) =>
                                  updateOption(qIndex, oIndex, 'hi', e.target.value)
                                }
                                className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-slate-950 text-sm focus:outline-none focus:border-slate-400"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Set Correct Answer */}
                    <div>
                      <label
                        htmlFor={`correct-${qIndex}`}
                        className="block text-sm font-semibold text-slate-950 mb-2"
                      >
                        Mark Correct Answer
                      </label>
                      <select
                        id={`correct-${qIndex}`}
                        value={String.fromCharCode(65 + question.correct)}
                        onChange={(e) => {
                          const selectedIndex = e.target.value.charCodeAt(0) - 65
                          updateQuestion(qIndex, 'correct', selectedIndex)
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-950 focus:outline-none focus:border-slate-400"
                      >
                        {question.options.map((_, i) => (
                          <option key={`opt-${i}`} value={String.fromCharCode(65 + i)}>
                            {String.fromCharCode(65 + i)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-slate-950">
                          Details (Optional)
                        </label>
                        <button
                          onClick={() => addDetail(qIndex)}
                          className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                        >
                          + Add Detail
                        </button>
                      </div>
                      {question.details.length > 0 ? (
                        <div className="space-y-3">
                          {question.details.map((detail, dIndex) => (
                            <div
                              key={`d-${qIndex}-${dIndex}`}
                              className="p-3 rounded-lg border bg-blue-50 border-blue-200"
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-semibold text-slate-500 w-6">
                                  {dIndex + 1}.
                                </span>
                                <input
                                  type="text"
                                  placeholder="English"
                                  defaultValue={detail.en}
                                  onChange={(e) =>
                                    updateDetail(qIndex, dIndex, 'en', e.target.value)
                                  }
                                  className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-slate-950 text-sm focus:outline-none focus:border-slate-400"
                                />
                                <button
                                  onClick={() => deleteDetail(qIndex, dIndex)}
                                  className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                                  title="Delete detail"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex items-center gap-3 ml-8">
                                <input
                                  type="text"
                                  placeholder="Hindi"
                                  defaultValue={detail.hi}
                                  onChange={(e) =>
                                    updateDetail(qIndex, dIndex, 'hi', e.target.value)
                                  }
                                  className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-slate-950 text-sm focus:outline-none focus:border-slate-400"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No details added</p>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteQuestion(qIndex)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Question
                    </button>
                  </div>
                )}
              </div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-12 bg-white border border-dashed border-slate-300 rounded-lg">
                <p className="text-slate-600">No questions added yet</p>
                <button
                  onClick={addQuestion}
                  className="mt-4 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
                >
                  Add First Question
                </button>
              </div>
            )}
        </div>

        {/* JSON Preview */}
        <div className="w-1/3 bg-white border-l border-slate-200 p-4 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-950">
              JSON Preview {!allowJsonEdit && '(Read-only)'}
            </h3>
            {allowJsonEdit && !jsonEditMode && (
              <button
                onClick={() => setJsonEditMode(true)}
                className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
              >
                Edit JSON
              </button>
            )}
          </div>
          {jsonError && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {jsonError}
            </div>
          )}
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            readOnly={!jsonEditMode}
            className={`bg-slate-900 rounded-lg p-3 overflow-auto flex-1 text-xs font-mono text-slate-100 resize-none focus:outline-none ${
              jsonEditMode ? 'border-2 border-blue-500' : ''
            }`}
          />
          {jsonEditMode ? (
            <div className="flex gap-2 mt-3">
              <button
                onClick={applyJsonChanges}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-xs"
              >
                <Check className="w-4 h-4" />
                Apply Changes
              </button>
              <button
                onClick={cancelJsonEdit}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-950 rounded-lg font-medium transition-colors text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={copyToClipboard}
              className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-950 rounded-lg font-medium transition-colors text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy JSON
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
