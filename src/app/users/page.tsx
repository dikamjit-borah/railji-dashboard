import { Metadata } from 'next'
import { UsersSection } from '@/components/UsersSection'

export const metadata: Metadata = {
  title: 'Users - Railji Dashboard',
}

export default function UsersPage() {
  return (
    <div className="w-full">
      <UsersSection />
    </div>
  )
}
