'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Home, FileText, BookOpen, Users, Bell, BarChart3,
  X, ArrowRight, Search,
} from 'lucide-react'

interface Command {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  href: string
  keywords: string[]
}

const commands: Command[] = [
  { icon: Home,      label: 'Dashboard',     description: 'Overview and analytics',        href: '/',              keywords: ['home', 'overview', 'stats'] },
  { icon: FileText,  label: 'Upload Paper',  description: 'Add a new exam paper',           href: '/upload',        keywords: ['upload', 'add', 'new', 'create'] },
  { icon: BookOpen,  label: 'Papers',        description: 'Browse and manage all papers',   href: '/papers',        keywords: ['papers', 'browse', 'list'] },
  { icon: Users,     label: 'Users',         description: 'Manage system users',            href: '/users',         keywords: ['users', 'people', 'accounts'] },
  { icon: Bell,      label: 'Subscriptions', description: 'View and manage subscriptions',  href: '/subscriptions', keywords: ['subscriptions', 'plans'] },
  { icon: BarChart3, label: 'Analytics',     description: 'Reports and insights',           href: '/analytics',     keywords: ['reports', 'analytics', 'charts'] },
]

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const filtered = query.trim()
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase()) ||
        c.keywords.some(k => k.includes(query.toLowerCase()))
      )
    : commands

  const navigate = useCallback((href: string) => {
    router.push(href)
    onClose()
  }, [router, onClose])

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      const t = setTimeout(() => inputRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Reset selection when results change
  useEffect(() => { setSelectedIndex(0) }, [query])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && filtered[selectedIndex]) navigate(filtered[selectedIndex].href)
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [isOpen, filtered, selectedIndex, navigate, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-rail-900/25 backdrop-blur-[3px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-palette overflow-hidden animate-slide-up">

        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-warm-100">
          <Search className="w-4 h-4 text-warm-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages and actions…"
            className="flex-1 text-sm text-rail-900 placeholder-warm-400 bg-transparent outline-none"
            autoComplete="off"
          />
          <button onClick={onClose} className="p-1 rounded text-warm-300 hover:text-warm-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="py-2 max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-warm-400">No results for <span className="text-rail-600 font-medium">&ldquo;{query}&rdquo;</span></p>
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon
              const isSelected = idx === selectedIndex
              return (
                <button
                  key={cmd.href}
                  onClick={() => navigate(cmd.href)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    isSelected ? 'bg-warm-50' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-rail-100' : 'bg-warm-100'
                  }`}>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-rail-600' : 'text-warm-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isSelected ? 'text-rail-800' : 'text-rail-700'}`}>
                      {cmd.label}
                    </p>
                    <p className="text-xs text-warm-400 truncate">{cmd.description}</p>
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 transition-all ${
                    isSelected ? 'text-rail-400 translate-x-0.5' : 'text-warm-200'
                  }`} />
                </button>
              )
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="px-4 py-2.5 border-t border-warm-100 flex items-center gap-4 bg-warm-50">
          {[
            { keys: '↑↓', hint: 'navigate' },
            { keys: '↵',  hint: 'open' },
            { keys: 'Esc', hint: 'close' },
          ].map(({ keys, hint }) => (
            <span key={hint} className="flex items-center gap-1.5 text-xs text-warm-400">
              <kbd className="font-mono px-1 py-0.5 bg-white border border-warm-200 rounded text-warm-500">{keys}</kbd>
              {hint}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
