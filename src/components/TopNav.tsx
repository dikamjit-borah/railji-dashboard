'use client'

import { Menu, Search, Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/upload': 'Upload Paper',
  '/papers': 'Papers',
  '/users': 'Users',
  '/subscriptions': 'Subscriptions',
  '/analytics': 'Analytics',
}

interface TopNavProps {
  user?: { username: string } | null
  onMenuClick: () => void
  onSearchClick: () => void
}

export function TopNav({ user, onMenuClick, onSearchClick }: TopNavProps) {
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] ?? 'Dashboard'
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'AD'

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-warm-200 px-4 md:px-6 h-14 flex items-center justify-between flex-shrink-0 shadow-topnav">
      {/* Left: mobile hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-lg text-warm-500 hover:bg-warm-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <nav className="flex items-center gap-1.5 text-sm">
          <span className="text-warm-400 font-medium">Railji</span>
          <span className="text-warm-300 select-none">/</span>
          <span className="font-semibold text-rail-800" style={{ fontFamily: 'var(--font-syne), Syne, system-ui' }}>
            {pageTitle}
          </span>
        </nav>
      </div>

      {/* Right: search, notifications, avatar */}
      <div className="flex items-center gap-1.5">
        {/* Search trigger */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-warm-500 bg-warm-100 hover:bg-warm-200 transition-colors text-sm"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-medium">Search</span>
          <kbd className="hidden sm:inline text-xs px-1.5 py-0.5 bg-white rounded border border-warm-200 font-mono text-warm-400">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-warm-400 hover:bg-warm-100 hover:text-rail-600 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />
        </button>

        {/* User avatar */}
        <div
          className="w-7 h-7 rounded-full bg-rail-700 text-white text-xs font-bold flex items-center justify-center cursor-default select-none flex-shrink-0 ml-1"
          title={user?.username ?? 'Admin'}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
