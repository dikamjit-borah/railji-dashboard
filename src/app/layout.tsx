import type { Metadata } from 'next'
//import { Sidebar } from '@/components/Sidebar'
import '@/globals.css'
import { LayoutWrapper } from '@/components/LayoutWrapper'

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
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  )
}
