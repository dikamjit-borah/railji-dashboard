'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FileText, BookOpen, Users, Home, BarChart3, X, LogOut, Bell,
} from 'lucide-react'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  onLogout?: () => void
  user?: { username: string } | null
}

const navSections = [
  {
    label: 'Station',
    items: [
      { href: '/',              icon: Home,      label: 'Dashboard',     shortcut: '⌘1' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/upload',        icon: FileText,  label: 'Upload Paper',  shortcut: '' },
      { href: '/papers',        icon: BookOpen,  label: 'Papers',        shortcut: '' },
      { href: '/users',         icon: Users,     label: 'Users',         shortcut: '' },
      { href: '/subscriptions', icon: Bell,      label: 'Subscriptions', shortcut: '' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { href: '/analytics',     icon: BarChart3, label: 'Reports',       shortcut: '' },
    ],
  },
]

export function Sidebar({ isOpen = true, onClose, onLogout, user }: SidebarProps) {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'AD'

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-rail-950/40 backdrop-blur-[2px] md:hidden z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar shell */}
      <aside
        className={`w-60 flex flex-col fixed h-screen z-40 transition-transform duration-300 shadow-sidebar ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:relative md:translate-x-0`}
        style={{ backgroundColor: '#162254' }}
      >
        {/* Amber track accent at top */}
        <div
          className="h-[3px] w-full flex-shrink-0"
          style={{ background: 'linear-gradient(90deg, #D97706 0%, #F59E0B 50%, #FBBF24 100%)' }}
        />

        {/* Mobile close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-3 md:hidden rounded-lg p-1.5 transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Railway track icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <div className="flex gap-[5px]">
              {[0, 1].map(col => (
                <div key={col} className="flex flex-col justify-between h-[18px]">
                  {[0, 1, 2].map(row => (
                    <div
                      key={row}
                      className="w-[3px] h-[3px] rounded-full"
                      style={{ backgroundColor: row === 1 ? '#FBBF24' : '#F59E0B' }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h1
              className="text-white font-bold text-lg leading-none"
              style={{ fontFamily: 'var(--font-syne), Syne, system-ui', letterSpacing: '-0.02em' }}
            >
              Railji
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Admin Platform
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navSections.map(section => (
            <div key={section.label}>
              <p
                className="px-3 text-[10px] font-semibold uppercase tracking-[0.12em] mb-1.5"
                style={{ color: 'rgba(255,255,255,0.28)' }}
              >
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const active = isActive(item.href)
                  return (
                    <NavItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      shortcut={item.shortcut}
                      isActive={active}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 px-3 pb-4 pt-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {/* System status */}
          <div className="flex items-center gap-2.5 px-3 py-1.5">
            <span className="relative flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
              <span className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
            </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              All systems operational
            </span>
          </div>

          {/* User card */}
          {user && (
            <div
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(255,255,255,0.07)' }}
            >
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.username}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Administrator</p>
              </div>
            </div>
          )}

          {/* Sign out */}
          {onLogout && (
            <SidebarFooterButton icon={LogOut} label="Sign Out" onClick={onLogout} />
          )}

          {/* Cmd+K hint */}
          <div className="px-3 pt-1 flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
            <kbd className="font-mono text-[11px]">⌘K</kbd>
            <span className="text-[11px]">Quick search</span>
          </div>
        </div>
      </aside>
    </>
  )
}

/* ── Sub-components ─────────────────────────────────── */

interface NavItemProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  shortcut?: string
  isActive: boolean
}

function NavItem({ href, icon: Icon, label, shortcut, isActive }: NavItemProps) {
  return (
    <Link href={href} className="block">
      <span
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group cursor-pointer ${
          isActive ? 'text-white' : 'text-white/50 hover:text-white/90'
        }`}
        style={isActive ? { background: 'rgba(255,255,255,0.11)' } : undefined}
        onMouseEnter={e => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
        }}
        onMouseLeave={e => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = ''
        }}
      >
        {/* Active left accent */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-amber-400" />
        )}
        <Icon
          className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-white/40 group-hover:text-white/70'} transition-colors`}
        />
        <span className="flex-1">{label}</span>
        {shortcut && (
          <kbd className="text-[10px] font-mono hidden lg:block opacity-30">{shortcut}</kbd>
        )}
      </span>
    </Link>
  )
}

interface FooterBtnProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}

function SidebarFooterButton({ icon: Icon, label, onClick }: FooterBtnProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150"
      style={{ color: 'rgba(255,255,255,0.4)' }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'
        ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'
        ;(e.currentTarget as HTMLElement).style.background = ''
      }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{label}</span>
    </button>
  )
}
