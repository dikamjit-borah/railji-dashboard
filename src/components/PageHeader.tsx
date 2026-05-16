'use client'

interface PageHeaderProps {
  title: string
  subtitle?: string | React.ReactNode
  action?: {
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }>
    disabled?: boolean
  }
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="px-5 md:px-8 pt-7 pb-5 flex-shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold text-rail-900"
            style={{ fontFamily: 'var(--font-syne), Syne, system-ui' }}
          >
            {title}
          </h1>
          {subtitle && (
            <div className="mt-1 text-sm text-warm-500">{subtitle}</div>
          )}
        </div>

        {action && (
          <button
            onClick={action.onClick}
            disabled={action.disabled}
            className={`btn-minimal-primary flex-shrink-0 ${
              action.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {action.icon && <action.icon className="w-4 h-4" />}
            {action.label}
          </button>
        )}
      </div>

      {/* Amber track accent */}
      <div className="track-amber mt-5 opacity-60" />
    </div>
  )
}
