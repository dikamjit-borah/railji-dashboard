'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, BookOpen, Users, Home, BarChart3 } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <aside className="w-56 bg-slate-900 text-slate-50 border-r border-slate-800 flex flex-col fixed h-screen">
      {/* Logo/Header */}
      <div className="px-6 py-8 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-sm flex items-center justify-center">
            <div className="w-1 h-4 bg-slate-900 mr-1"></div>
            <div className="w-1 h-4 bg-slate-900"></div>
          </div>
          <h1 className="text-lg font-bold tracking-tight">Railji</h1>
        </div>
        <p className="text-xs text-slate-400 mt-2">Exam Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {/* Main Section */}
        <div className="mb-8">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Station
          </p>
          <NavItem
            href="/"
            icon={Home}
            label="Dashboard"
            isActive={isActive('/')}
          />
        </div>

        {/* Operations Section */}
        <div className="mb-8">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Operations
          </p>
          <NavItem
            href="/upload"
            icon={FileText}
            label="Upload Paper"
            isActive={isActive('/upload')}
          />
          <NavItem
            href="/exams"
            icon={BookOpen}
            label="Exams"
            isActive={isActive('/exams')}
          />
          <NavItem
            href="/users"
            icon={Users}
            label="Users"
            isActive={isActive('/users')}
          />
        </div>

        {/* Analytics Section */}
        <div>
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Analytics
          </p>
          <NavItem
            href="/analytics"
            icon={BarChart3}
            label="Reports"
            isActive={isActive('/analytics')}
          />
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-6 border-t border-slate-700 space-y-2">
        <p className="text-xs text-slate-400">System Status</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-xs text-slate-300">All systems operational</p>
        </div>
      </div>
    </aside>
  )
}

interface NavItemProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive: boolean
}

function NavItem({ href, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <span
        className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors duration-200 ${
          isActive
            ? 'bg-slate-700 text-slate-50'
            : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </span>
    </Link>
  )
}
