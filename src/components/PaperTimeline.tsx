import { CheckCircle2, AlertCircle } from 'lucide-react'

interface TimelineItem {
  id: string
  paper: string
  status: 'draft' | 'active' | 'completed'
  daysAgo: number
}

const items: TimelineItem[] = [
  { id: '1', paper: 'Junior Engineer', status: 'active', daysAgo: 0 },
  { id: '2', paper: 'Indian Railways Technician', status: 'active', daysAgo: 2 },
  { id: '3', paper: 'NTPC Graduate Recruitment', status: 'completed', daysAgo: 5 },
  { id: '4', paper: 'RRB Group D - General Awareness', status: 'draft', daysAgo: 7 },
]

const statusConfig = {
  draft: { icon: AlertCircle, label: 'Draft', color: 'text-warm-500', bgColor: 'bg-warm-50' },
  active: { icon: CheckCircle2, label: 'Active', color: 'text-rail-700', bgColor: 'bg-warm-50' },
  completed: { icon: CheckCircle2, label: 'Completed', color: 'text-warm-600', bgColor: 'bg-warm-50' },
}

export function PaperTimeline() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-rail-900">Paper Journey</h2>
        <p className="text-sm text-warm-500 mt-1">Track your paper workflow</p>
      </div>

      <div className="space-y-0">
        {items.map((item, index) => {
          const config = statusConfig[item.status]

          return (
            <div key={item.id} className="relative group">
              {index !== items.length - 1 && (
                <div className="absolute left-4 top-12 w-px h-8 bg-warm-200 group-hover:bg-warm-300 transition-colors" />
              )}

              <div className="flex gap-4 p-4 hover:bg-warm-50 transition-colors -mx-4 px-4 rounded-lg">
                <div className="flex flex-col items-center pt-1">
                  <div className={`w-2 h-2 rounded-full ${item.status === 'active' ? 'bg-amber-500 animate-pulse' : 'bg-warm-300'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-rail-900 text-sm">{item.paper}</p>
                      <p className="text-xs text-warm-400 mt-1">
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

      <div className="pt-4 border-t border-warm-100">
        <a href="/papers" className="text-xs font-medium text-rail-700 hover:text-rail-900 inline-flex items-center gap-2 transition-colors">
          View all papers
          <span className="text-warm-400">→</span>
        </a>
      </div>
    </div>
  )
}
