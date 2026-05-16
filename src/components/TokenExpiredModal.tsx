'use client'

import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog'

interface TokenExpiredModalProps {
  isOpen: boolean
  onSignInAgain: () => void
}

export default function TokenExpiredModal({ isOpen, onSignInAgain }: TokenExpiredModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent showClose={false}>
        {/* Railway logo */}
        <div className="flex justify-center mb-2">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#162254' }}
          >
            <div className="flex gap-[5px]">
              {[0, 1].map(c => (
                <div key={c} className="flex flex-col justify-between h-[18px]">
                  {[0, 1, 2].map(r => (
                    <div
                      key={r}
                      className="w-[3px] h-[3px] rounded-full"
                      style={{ backgroundColor: r === 1 ? '#FBBF24' : '#F59E0B' }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogHeader>
          <DialogTitle className="text-center">Session Expired</DialogTitle>
          <DialogDescription className="text-center">
            Your session has expired for security reasons. Please sign in again to continue using the dashboard.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="border-0 mt-4 pt-0">
          <Button variant="primary" size="lg" className="w-full" onClick={onSignInAgain}>
            Sign In Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
