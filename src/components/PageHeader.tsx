'use client'

import { Menu } from 'lucide-react'
import { useMenu } from './LayoutWrapper'

interface PageHeaderProps {
  title: string
  subtitle?: string | React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  const { setIsOpen } = useMenu()

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Hamburger and Title */}
        <div className="w-full md:w-auto flex items-start gap-4 md:gap-0">
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors flex-shrink-0 mt-1"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-950">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            )}
          </div>
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="btn-minimal-primary"
          >
            {action.label}
          </button>
        )}
      </div>
      {/* Subtle track line */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
    </div>
  )
}
