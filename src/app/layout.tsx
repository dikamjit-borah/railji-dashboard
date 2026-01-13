import type { Metadata } from 'next'
import { Sidebar } from '@/components/Sidebar'
import '@/globals.css'

export const metadata: Metadata = {
  title: 'Railji Dashboard',
  description: 'Railway Exam Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex h-screen bg-slate-50">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
