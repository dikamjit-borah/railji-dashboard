import { Metadata } from 'next'
import { PapersSection } from '@/components/PapersSection'

export const metadata: Metadata = {
  title: 'Papers - Railji Dashboard',
}

export default function PapersPage() {
  return (
    <div className="w-full">
      <PapersSection />
    </div>
  )
}
