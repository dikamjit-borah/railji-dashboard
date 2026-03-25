'use client';

import { useEffect } from 'react';

interface TokenExpiredModalProps {
  isOpen: boolean;
  onSignInAgain: () => void;
}

export default function TokenExpiredModal({ isOpen, onSignInAgain }: TokenExpiredModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50">
      {/* Modal */}
      <div className="relative bg-white border border-slate-200 max-w-md w-full mx-4 p-8">
        <div className="text-center">
          {/* Railway-inspired icon */}
          <div className="mx-auto flex items-center justify-center w-12 h-12 mb-6">
            <div className="w-10 h-10 bg-slate-900 flex items-center justify-center">
              <div className="w-1.5 h-5 bg-slate-50 mr-1"></div>
              <div className="w-1.5 h-5 bg-slate-50"></div>
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-slate-950 mb-2">
            Session Expired
          </h3>
          
          {/* Track divider */}
          <div className="track my-4"></div>
          
          {/* Message */}
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Your session has expired for security reasons. Please sign in again to continue using the dashboard.
          </p>
          
          {/* Button */}
          <button
            onClick={onSignInAgain}
            className="w-full py-2.5 px-4 border border-slate-900 text-sm font-medium text-slate-50 bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            Sign In Again
          </button>
        </div>
      </div>
    </div>
  );
}