'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Copy, Check } from 'lucide-react'

interface Question {
  ques: string
  ques_hi: string
  options: Array<{ en: string; hi: string }>
  correct: string
}

const DUMMY_EXAM_DATA: Question[] = [
  {
    ques: 'What is the capital of India?',
    ques_hi: 'भारत की राजधानी क्या है?',
    options: [
      { en: 'Mumbai', hi: 'मुंबई' },
      { en: 'New Delhi', hi: 'नई दिल्ली' },
      { en: 'Bangalore', hi: 'बेंगलुरु' },
      { en: 'Kolkata', hi: 'कोलकाता' },
    ],
    correct: 'New Delhi',
  },
  {
    ques: 'What is 2 + 2?',
    ques_hi: '2 + 2 क्या है?',
    options: [
      { en: '3', hi: '3' },
      { en: '4', hi: '4' },
      { en: '5', hi: '5' },
      { en: '6', hi: '6' },
    ],
    correct: '4',
  },
  {
    ques: 'What is the largest planet in our solar system?',
    ques_hi: 'हमारे सौर मंडल का सबसे बड़ा ग्रह कौन सा है?',
    options: [
      { en: 'Mars', hi: 'मंगल' },
      { en: 'Jupiter', hi: 'बृहस्पति' },
      { en: 'Saturn', hi: 'शनि' },
      { en: 'Venus', hi: 'शुक्र' },
    ],
    correct: 'Jupiter',
  },
]

export function ExamJsonEditor({ onBack }: { readonly onBack: () => void }) {
  const [questions, setQuestions] = useState<Question[]>(DUMMY_EXAM_DATA)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const addQuestion = () => {
    const newQuestion: Question = {
      ques: 'New Question',
      ques_hi: 'नया प्रश्न',
      options: [
        { en: 'Option A', hi: 'विकल्प A' },
        { en: 'Option B', hi: 'विकल्प B' },
        { en: 'Option C', hi: 'विकल्प C' },
        { en: 'Option D', hi: 'विकल्प D' },
      ],
      correct: 'Option A',
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...questions]
    newQuestions[index] = updatedQuestion
    setQuestions(newQuestions)
  }

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateOption = (qIndex: number, oIndex: number, lang: 'en' | 'hi', value: string) => {
    const updatedQuestion = { ...questions[qIndex] }
    updatedQuestion.options[oIndex][lang] = value
    updateQuestion(qIndex, updatedQuestion)
  }

  const copyToClipboard = () => {
    const jsonString = JSON.stringify(questions, null, 2)
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
              <h1 className="text-2xl font-bold text-slate-950">Exam Editor</h1>
              <p className="text-sm text-slate-600 mt-1">
                Edit exam questions and answers in JSON format
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
                      Q{qIndex + 1}: {question.ques}
                    </p>
                    <p className="font-semibold text-slate-950 text-sm mt-1">
                      {question.ques_hi}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      Correct Answer:{' '}
                      <span className="font-medium text-green-700">
                        {question.correct}
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
                          value={question.ques}
                          onChange={(e) => {
                            const updated = { ...question, ques: e.target.value }
                            updateQuestion(qIndex, updated)
                          }}
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
                          value={question.ques_hi}
                          onChange={(e) => {
                            const updated = { ...question, ques_hi: e.target.value }
                            updateQuestion(qIndex, updated)
                          }}
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
                              option.en === question.correct
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
                                value={option.en}
                                onChange={(e) =>
                                  updateOption(qIndex, oIndex, 'en', e.target.value)
                                }
                                className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-slate-950 text-sm focus:outline-none focus:border-slate-400"
                              />
                              {option.en === question.correct && (
                                <span className="text-xs font-semibold text-green-700 px-2 py-1 bg-green-100 rounded">
                                  Correct
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 ml-8">
                              <input
                                type="text"
                                placeholder="Hindi"
                                value={option.hi}
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
                        value={question.correct}
                        onChange={(e) => {
                          const updated = {
                            ...question,
                            correct: e.target.value,
                          }
                          updateQuestion(qIndex, updated)
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-950 focus:outline-none focus:border-slate-400"
                      >
                        {question.options.map((option, i) => (
                          <option key={`opt-${i}`} value={option.en}>
                            {String.fromCodePoint(65 + i)}. {option.en}
                          </option>
                        ))}
                      </select>
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
          <h3 className="text-sm font-semibold text-slate-950 mb-3">
            JSON Preview
          </h3>
          <div className="bg-slate-900 rounded-lg p-3 overflow-auto flex-1 text-xs font-mono text-slate-100">
            <pre className="whitespace-pre-wrap break-words">{JSON.stringify(questions, null, 2)}</pre>
          </div>
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
        </div>
      </div>
    </div>
  )
}
