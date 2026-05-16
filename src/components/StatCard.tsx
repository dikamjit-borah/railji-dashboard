interface StatCardProps {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  change: string
  accent?: string
  iconBg?: string
  iconColor?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconBg = 'bg-rail-50',
  iconColor = 'text-rail-500',
  accent = 'border-l-2 border-l-rail-400',
}: StatCardProps) {
  return (
    <div
      className={`bg-white border border-warm-200 rounded-xl p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 ${accent}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-warm-500">{label}</p>
          <p
            className="text-2xl font-bold text-rail-900 mt-1 tabular-nums"
            style={{ fontFamily: 'var(--font-syne), Syne, system-ui' }}
          >
            {value}
          </p>
        </div>
        <div className={`${iconBg} w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4.5 h-4.5 w-[18px] h-[18px] ${iconColor}`} />
        </div>
      </div>

      {/* Track accent */}
      <div className="track-warm mt-4" />
    </div>
  )
}
