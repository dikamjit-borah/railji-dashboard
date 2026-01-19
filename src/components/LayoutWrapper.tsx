'use client'

import { useState, createContext, useContext, ReactNode } from 'react'
import { Sidebar } from './Sidebar'

const MenuContext = createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
} | null>(null)

export function useMenu() {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenu must be used within LayoutWrapper')
  }
  return context
}

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <MenuContext.Provider value={{ isOpen: isMobileMenuOpen, setIsOpen: setIsMobileMenuOpen }}>
      <div className="flex h-screen bg-slate-50">
        {/* Sidebar - Desktop always visible, Mobile as drawer */}
        <div className="hidden md:block">
          <Sidebar isOpen={true} />
        </div>

        {/* Mobile drawer */}
        <div className="md:hidden">
          <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </div>

        <main className="md:ml-56 flex-1 overflow-auto flex flex-col w-full">
          {children}
        </main>
      </div>
    </MenuContext.Provider>
  )
}
