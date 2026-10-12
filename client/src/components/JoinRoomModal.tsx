import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext.js';
import { X, LogIn, KeyRound, User } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (roomCode: string) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { joinRoom, updateProfileName } = useAuction();

  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('dynasty_display_name') || 'Peter Parker');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCode.trim().toUpperCase();

    if (!cleanCode || cleanCode.length !== 6) {
      setError('Please provide a valid 6-character room code.');
      return;
    }

    if (!displayName.trim()) {
      setError('Please enter your bidder display name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    updateProfileName(displayName.trim());

    const res = await joinRoom(cleanCode, displayName.trim());
    setIsSubmitting(false);

    if (res.success && res.room) {
      onSuccess(res.room.roomCode);
      onClose();
    } else {
      setError(res.error || 'Failed to enter chamber. Please verify the code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#171A23] to-[#0A0C10] border border-[#C6A15B]/40 shadow-[0_0_50px_rgba(198,161,91,0.15)] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#C6A15B]/20 flex items-center justify-between bg-gradient-to-r from-[#111319] to-[#1A1D27]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C6A15B]/20 border border-[#C6A15B] flex items-center justify-center text-[#F0D79A]">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-gold-gradient tracking-wider">
                JOIN AUCTION CHAMBER
              </h2>
              <p className="text-xs text-[#9295A0]">Enter room code to access the high-stakes bidding floor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9295A0] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Room Code */}
          <div>
            <label className="block text-xs uppercase font-semibold text-[#C6A15B] tracking-wider mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Chamber Code (6 Characters)</span>
            </label>
            <input
              type="text"
              maxLength={6}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g. KV8M3P"
              className="w-full px-4 py-3 rounded-xl bg-[#08090D] border border-[#C6A15B]/40 focus:border-[#F0D79A] text-center font-mono text-2xl tracking-[0.3em] font-bold text-[#F0D79A] uppercase focus:outline-none focus:ring-1 focus:ring-[#C6A15B]"
              required
            />
          </div>

          {/* Bidder Name */}
          <div>
            <label className="block text-xs uppercase font-semibold text-[#C6A15B] tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Your Bidder Handle</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Peter Parker, Thor"
              className="w-full px-4 py-2.5 rounded-xl bg-[#08090D] border border-[#C6A15B]/30 focus:border-[#F0D79A] text-sm text-[#F5F0E7] focus:outline-none focus:ring-1 focus:ring-[#C6A15B]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || roomCode.length !== 6}
            className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-[#C6A15B] via-[#F0D79A] to-[#C6A15B] text-[#08090D] font-cinzel font-bold text-sm tracking-widest uppercase hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-[#C6A15B]/20 disabled:opacity-50"
          >
            {isSubmitting ? 'CONNECTING...' : 'ENTER CHAMBER'}
          </button>
        </form>

      </div>
    </div>
  );
};
