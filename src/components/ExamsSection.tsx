'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { PageHeader } from './PageHeader'

interface Exam {
  id: string
  name: string
  status: 'draft' | 'active' | 'completed'
  totalQuestions: number
  createdDate: string
  editingId?: string
}

export function ExamsSection() {
  const [exams, setExams] = useState<Exam[]>([
    {
      id: '1',
      name: 'Junior Engineer',
      status: 'active',
      totalQuestions: 100,
      createdDate: '2024-01-05',
    },
    {
      id: '2',
      name: 'Indian Railways Technician',
      status: 'active',
      totalQuestions: 150,
      createdDate: '2024-01-02',
    },
    {
      id: '3',
      name: 'NTPC Graduate Recruitment',
      status: 'completed',
      totalQuestions: 200,
      createdDate: '2023-12-20',
    },
    {
      id: '4',
      name: 'RRB Group D - General Awareness',
      status: 'draft',
      totalQuestions: 80,
      createdDate: '2024-01-10',
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ name: string; questions: string }>({
    name: '',
    questions: '',
  })

  const statusStyles = {
    draft: 'bg-slate-100 text-slate-700',
    active: 'bg-slate-900 text-slate-50',
    completed: 'bg-slate-200 text-slate-700',
  }

  const handleEdit = (exam: Exam) => {
    setEditingId(exam.id)
    setEditValues({
      name: exam.name,
      questions: exam.totalQuestions.toString(),
    })
  }

  const handleSaveEdit = (id: string) => {
    setExams(
      exams.map((exam) =>
        exam.id === id
          ? {
              ...exam,
              name: editValues.name,
              totalQuestions: parseInt(editValues.questions) || 0,
            }
          : exam
      )
    )
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    setExams(exams.filter((exam) => exam.id !== id))
  }

  const handleAddNew = () => {
    const newExam: Exam = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Examination',
      status: 'draft',
      totalQuestions: 0,
      createdDate: new Date().toISOString().split('T')[0],
    }
    setExams([newExam, ...exams])
    handleEdit(newExam)
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageHeader
        title="Examinations"
        subtitle="Manage examination papers and details"
        action={{
          label: 'New Exam',
          onClick: handleAddNew,
        }}
      />

      <div className="px-8 py-12">
        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors"
            >
              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between bg-slate-50 border-b border-slate-100">
                <div className="flex-1 min-w-0">
                  {editingId === exam.id ? (
                    <input
                      type="text"
                      value={editValues.name}
                      onChange={(e) =>
                        setEditValues({ ...editValues, name: e.target.value })
                      }
                      className="input-minimal"
                    />
                  ) : (
                    <h3 className="font-medium text-slate-950 truncate">
                      {exam.name}
                    </h3>
                  )}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ml-4 capitalize whitespace-nowrap ${
                    statusStyles[exam.status]
                  }`}
                >
                  {exam.status}
                </span>
              </div>

              {/* Details */}
              <div className="px-6 py-4 space-y-3">
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Total Questions</p>
                    {editingId === exam.id ? (
                      <input
                        type="number"
                        value={editValues.questions}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            questions: e.target.value,
                          })
                        }
                        className="input-minimal"
                      />
                    ) : (
                      <p className="font-medium text-slate-950">
                        {exam.totalQuestions}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Created Date</p>
                    <p className="font-medium text-slate-950">{exam.createdDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Actions</p>
                    <div className="flex gap-2">
                      {editingId === exam.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(exam.id)}
                            className="text-xs font-medium text-slate-700 hover:text-slate-950 transition-colors px-2 py-1 border border-slate-300 hover:border-slate-400"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors px-2 py-1"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(exam)}
                            className="text-slate-500 hover:text-slate-700 transition-colors p-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exam.id)}
                            className="text-slate-500 hover:text-slate-700 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Track divider */}
              <div className="h-px bg-slate-100"></div>

              {/* Footer with additional options */}
              <div className="px-6 py-3 flex gap-2 text-xs">
                <button className="text-slate-600 hover:text-slate-950 transition-colors">
                  View Details
                </button>
                <span className="text-slate-300">•</span>
                <button className="text-slate-600 hover:text-slate-950 transition-colors">
                  Duplicate
                </button>
              </div>
            </div>
          ))}
        </div>

        {exams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No examinations created yet</p>
            <button
              onClick={handleAddNew}
              className="btn-minimal-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create First Exam
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
