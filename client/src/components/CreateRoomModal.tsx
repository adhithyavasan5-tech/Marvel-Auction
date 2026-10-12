import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext.js';
import { X, Shield, Coins, Users, Timer, Layers, Sparkles } from 'lucide-react';
import { RoomSettings } from '../types/index.js';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (roomCode: string) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createRoom, updateProfileName } = useAuction();

  const [displayName, setDisplayName] = useState(() => localStorage.getItem('dynasty_display_name') || 'Tony Stark');
  const [startingBudget, setStartingBudget] = useState(1000);
  const [requiredRosterSize, setRequiredRosterSize] = useState(5);
  const [bidIncrement, setBidIncrement] = useState(10);
  const [countdownSeconds, setCountdownSeconds] = useState(20);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [lotCount, setLotCount] = useState(30);
  const [catalogueMode, setCatalogueMode] = useState<'marvel' | 'all'>('marvel');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please provide a bidder display name');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    updateProfileName(displayName.trim());

    const settings: Partial<RoomSettings> = {
      startingBudget,
      requiredRosterSize,
      bidIncrement,
      countdownSeconds,
      maxPlayers,
      lotCount,
      catalogueMode
    };

    const res = await createRoom(settings);
    setIsSubmitting(false);

    if (res.success && res.room) {
      onSuccess(res.room.roomCode);
      onClose();
    } else {
      setError(res.error || 'Failed to initialize chamber');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl bg-gradient-to-b from-[#171A23] to-[#0A0C10] border border-[#C6A15B]/40 shadow-[0_0_50px_rgba(198,161,91,0.15)] overflow-hidden">
        
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-[#C6A15B]/20 flex items-center justify-between bg-gradient-to-r from-[#111319] to-[#1A1D27]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C6A15B]/20 border border-[#C6A15B] flex items-center justify-center text-[#F0D79A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-cinzel text-lg font-bold text-gold-gradient tracking-wider">
                FOUND AUCTION CHAMBER
              </h2>
              <p className="text-xs text-[#9295A0]">Configure rules for your private high-stakes superhero arena</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Host Name */}
          <div>
            <label className="block text-xs uppercase font-semibold text-[#C6A15B] tracking-wider mb-2">
              Chamber Host Identity
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Tony Stark, Grandmaster"
              className="w-full px-4 py-2.5 rounded-xl bg-[#08090D] border border-[#C6A15B]/30 focus:border-[#F0D79A] text-sm text-[#F5F0E7] focus:outline-none focus:ring-1 focus:ring-[#C6A15B]"
              required
            />
          </div>

          {/* Catalogue Mode */}
          <div>
            <label className="block text-xs uppercase font-semibold text-[#C6A15B] tracking-wider mb-2">
              Hero Universe Catalogue
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCatalogueMode('marvel')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  catalogueMode === 'marvel'
                    ? 'border-[#C6A15B] bg-[#C6A15B]/15 text-[#F0D79A] shadow-md shadow-[#C6A15B]/10'
                    : 'border-white/10 bg-[#08090D] text-[#9295A0] hover:border-white/20'
                }`}
              >
                <div className="font-cinzel font-bold text-xs">Marvel Focused</div>
                <div className="text-[11px] text-[#9295A0] mt-0.5">Curated Avengers, X-Men & Marvel icons</div>
              </button>

              <button
                type="button"
                onClick={() => setCatalogueMode('all')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  catalogueMode === 'all'
                    ? 'border-[#C6A15B] bg-[#C6A15B]/15 text-[#F0D79A] shadow-md shadow-[#C6A15B]/10'
                    : 'border-white/10 bg-[#08090D] text-[#9295A0] hover:border-white/20'
                }`}
              >
                <div className="font-cinzel font-bold text-xs">Expanded Multiverse</div>
                <div className="text-[11px] text-[#9295A0] mt-0.5">Full multi-publisher 500+ hero roster</div>
              </button>
            </div>
          </div>

          {/* Grid Settings */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            
            {/* Starting Budget */}
            <div className="p-3 rounded-xl bg-[#08090D] border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#9295A0] mb-1 font-semibold">
                <Coins className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>Budget</span>
              </div>
              <input
                type="number"
                min="500"
                max="5000"
                step="100"
                value={startingBudget}
                onChange={(e) => setStartingBudget(Number(e.target.value))}
                className="w-full bg-transparent font-mono text-base font-bold text-[#F0D79A] focus:outline-none"
              />
              <span className="text-[10px] text-[#9295A0]">credits / player</span>
            </div>

            {/* Roster Target */}
            <div className="p-3 rounded-xl bg-[#08090D] border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#9295A0] mb-1 font-semibold">
                <Shield className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>Roster Target</span>
              </div>
              <input
                type="number"
                min="2"
                max="8"
                value={requiredRosterSize}
                onChange={(e) => setRequiredRosterSize(Number(e.target.value))}
                className="w-full bg-transparent font-mono text-base font-bold text-[#F0D79A] focus:outline-none"
              />
              <span className="text-[10px] text-[#9295A0]">heroes to win</span>
            </div>

            {/* Countdown seconds */}
            <div className="p-3 rounded-xl bg-[#08090D] border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#9295A0] mb-1 font-semibold">
                <Timer className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>Countdown</span>
              </div>
              <input
                type="number"
                min="10"
                max="60"
                step="5"
                value={countdownSeconds}
                onChange={(e) => setCountdownSeconds(Number(e.target.value))}
                className="w-full bg-transparent font-mono text-base font-bold text-[#F0D79A] focus:outline-none"
              />
              <span className="text-[10px] text-[#9295A0]">seconds / lot</span>
            </div>

            {/* Bid Increment */}
            <div className="p-3 rounded-xl bg-[#08090D] border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#9295A0] mb-1 font-semibold">
                <Coins className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>Min Increment</span>
              </div>
              <input
                type="number"
                min="5"
                max="50"
                step="5"
                value={bidIncrement}
                onChange={(e) => setBidIncrement(Number(e.target.value))}
                className="w-full bg-transparent font-mono text-base font-bold text-[#F0D79A] focus:outline-none"
              />
              <span className="text-[10px] text-[#9295A0]">credits minimum</span>
            </div>

            {/* Max Players */}
            <div className="p-3 rounded-xl bg-[#08090D] border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#9295A0] mb-1 font-semibold">
                <Users className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>Capacity</span>
              </div>
              <input
                type="number"
                min="2"
                max="12"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full bg-transparent font-mono text-base font-bold text-[#F0D79A] focus:outline-none"
              />
              <span className="text-[10px] text-[#9295A0]">max bidders</span>
            </div>

            {/* Auction Lots */}
            <div className="p-3 rounded-xl bg-[#08090D] border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-[#9295A0] mb-1 font-semibold">
                <Layers className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>Auction Lots</span>
              </div>
              <input
                type="number"
                min="10"
                max="40"
                step="5"
                value={lotCount}
                onChange={(e) => setLotCount(Number(e.target.value))}
                className="w-full bg-transparent font-mono text-base font-bold text-[#F0D79A] focus:outline-none"
              />
              <span className="text-[10px] text-[#9295A0]">superhero lots</span>
            </div>

          </div>

          <p className="text-[11px] text-[#9295A0] leading-relaxed">
            🛡️ <strong className="text-[#C6A15B]">Dynasty Anti-Sniping Protection</strong> is automatically active. Bids entered in the final 5 seconds will extend the authoritative clock by +5 seconds.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C6A15B] via-[#F0D79A] to-[#C6A15B] text-[#08090D] font-cinzel font-bold text-sm tracking-widest uppercase hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-[#C6A15B]/20 disabled:opacity-50"
          >
            {isSubmitting ? 'CREATING CHAMBER...' : 'INITIALIZE AUCTION CHAMBER'}
          </button>
        </form>

      </div>
    </div>
  );
};
