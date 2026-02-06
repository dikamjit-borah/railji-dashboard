import { Metadata } from 'next'
import { ExamsSection } from '@/components/ExamsSection'

export const metadata: Metadata = {
  title: 'Exams - Railji Dashboard',
}

export default function ExamsPage() {
  return (
    <div className="w-full">
      <ExamsSection />
    </div>
  )
}
