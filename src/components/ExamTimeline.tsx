import { CheckCircle2, AlertCircle } from 'lucide-react'

interface TimelineItem {
  id: string
  exam: string
  status: 'draft' | 'active' | 'completed'
  daysAgo: number
}

const items: TimelineItem[] = [
  {
    id: '1',
    exam: 'RRB NTPC 2024 - Mathematics',
    status: 'active',
    daysAgo: 0,
  },
  {
    id: '2',
    exam: 'Indian Railways Technician',
    status: 'active',
    daysAgo: 2,
  },
  {
    id: '3',
    exam: 'NTPC Graduate Recruitment',
    status: 'completed',
    daysAgo: 5,
  },
  {
    id: '4',
    exam: 'RRB Group D - General Awareness',
    status: 'draft',
    daysAgo: 7,
  },
]

const statusConfig = {
  draft: {
    icon: AlertCircle,
    label: 'Draft',
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
  },
  active: {
    icon: CheckCircle2,
    label: 'Active',
    color: 'text-slate-900',
    bgColor: 'bg-slate-50',
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
  },
}

export function ExamTimeline() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Exam Journey</h2>
        <p className="text-sm text-slate-600 mt-1">Track your examination workflow</p>
      </div>

      <div className="space-y-0">
        {items.map((item, index) => {
          const config = statusConfig[item.status]

          return (
            <div key={item.id} className="relative group">
              {/* Timeline connection line */}
              {index !== items.length - 1 && (
                <div className="absolute left-4 top-12 w-px h-8 bg-slate-200 group-hover:bg-slate-300 transition-colors"></div>
              )}

              <div className="flex gap-4 p-4 hover:bg-slate-100 transition-colors -mx-4 px-4">
                {/* Station marker */}
                <div className="flex flex-col items-center pt-1">
                  <div className={`w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-slate-900 animate-pulse' : 'bg-slate-400'}`}></div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-950 text-sm">
                        {item.exam}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.daysAgo === 0 ? 'Today' : `${item.daysAgo}d ago`}
                      </p>
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <a
          href="/exams"
          className="text-xs font-medium text-slate-700 hover:text-slate-950 inline-flex items-center gap-2 transition-colors"
        >
          View all exams
          <span className="text-slate-400">→</span>
        </a>
      </div>
    </div>
  )
}
