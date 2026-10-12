import React from 'react';
import { useAuction } from '../context/AuctionContext.js';
import { AlertCircle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, dismissToast } = useAuction();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1E1B24] to-[#12141A] border border-[#C6A15B]/50 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#F0D79A] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#F5F0E7] font-medium leading-snug">
            {toastMessage}
          </p>
        </div>
        <button
          onClick={dismissToast}
          className="text-[#9295A0] hover:text-white p-1 rounded-lg transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
