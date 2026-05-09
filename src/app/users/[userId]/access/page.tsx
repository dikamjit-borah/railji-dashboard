import { Metadata } from 'next'
import { UserAccessManagement } from '@/components/UserAccessManagement'

export const metadata: Metadata = {
  title: 'User Access Management - Railji Dashboard',
}

interface PageProps {
  params: Promise<{
    userId: string
  }>
}

export default async function UserAccessPage({ params }: PageProps) {
  const { userId } = await params
  
  return (
    <div className="w-full">
      <UserAccessManagement userId={userId} />
    </div>
  )
}