'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'bg-white border border-warm-200 text-rail-800 shadow-card rounded-xl font-sans text-sm',
          success: 'border-emerald-200 [&_[data-icon]]:text-emerald-500',
          error:   'border-red-200 [&_[data-icon]]:text-red-500',
          warning: 'border-amber-200 [&_[data-icon]]:text-amber-500',
          title:   'font-semibold text-rail-900',
          description: 'text-warm-500',
          closeButton: 'bg-warm-100 border-warm-200 text-warm-500 hover:bg-warm-200',
        },
      }}
    />
  )
}
