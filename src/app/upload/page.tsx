import { Metadata } from 'next'
import { UploadSection } from '@/components/UploadSection'

export const metadata: Metadata = {
  title: 'Upload Paper - Railji Dashboard',
}

export default function UploadPage() {
  return (
    <div className="w-full">
      <UploadSection />
    </div>
  )
}
