'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'

export function SidebarWrapper() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Sidebar - Desktop always visible, Mobile as drawer */}
      <div className="hidden md:block">
        <Sidebar isOpen={true} />
      </div>

      {/* Mobile drawer */}
      <div className="md:hidden">
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Expose menu state for PageHeader */}
      <div className="hidden" data-menu-opener={() => setIsMobileMenuOpen(true)} />
    </>
  )
}
