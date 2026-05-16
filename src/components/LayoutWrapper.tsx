'use client'

import { useState, createContext, useContext, ReactNode, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { CommandPalette } from './CommandPalette'

const MenuContext = createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
} | null>(null)

export function useMenu() {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error('useMenu must be used within LayoutWrapper')
  return ctx
}

interface LayoutWrapperProps {
  children: ReactNode
  onLogout?: () => void
  user?: { username: string } | null
}

export function LayoutWrapper({ children, onLogout, user }: LayoutWrapperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  // Global Cmd+K listener
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [])

  return (
    <MenuContext.Provider value={{ isOpen: isMobileMenuOpen, setIsOpen: setIsMobileMenuOpen }}>
      <div className="flex h-screen bg-warm-50 overflow-hidden">

        {/* Sidebar — desktop always visible */}
        <div className="hidden md:block flex-shrink-0">
          <Sidebar isOpen={true} onLogout={onLogout} user={user} />
        </div>

        {/* Sidebar — mobile drawer */}
        <div className="md:hidden">
          <Sidebar
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            onLogout={onLogout}
            user={user}
          />
        </div>

        {/* Main area */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopNav
            user={user}
            onMenuClick={() => setIsMobileMenuOpen(true)}
            onSearchClick={() => setIsCommandPaletteOpen(true)}
          />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </MenuContext.Provider>
  )
}
