import React, { useState, useEffect } from 'react';
import { useAuction } from '../context/AuctionContext.js';
import { HeroCard } from '../components/HeroCard.js';
import { 
  Timer, 
  Coins, 
  Shield, 
  Zap, 
  Flame, 
  TrendingUp, 
  Award, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  Volume2,
  VolumeX,
  LogOut
} from 'lucide-react';

export const AuctionArenaPage: React.FC = () => {
  const { 
    roomState, 
    activeLot, 
    timeLeft, 
    myPlayer, 
    placeBid, 
    contributeRescue, 
    voteSkip, 
    soldBanner,
    isMuted,
    toggleSound,
    leaveRoom
  } = useAuction();

  const [customBidAmount, setCustomBidAmount] = useState<number>(0);
  const [isSubmittingBid, setIsSubmittingBid] = useState<boolean>(false);
  const [bidError, setBidError] = useState<string | null>(null);

  const lot = activeLot;
  const isHoldingLead = lot && myPlayer && lot.highestBidderId === myPlayer.id;
  const minRequiredBid = lot
    ? (lot.highestBidderId ? lot.currentBid + roomState!.settings.bidIncrement : lot.currentBid)
    : 0;

  // Sync custom bid with minimum required bid
  useEffect(() => {
    if (minRequiredBid > 0) {
      if (myPlayer && myPlayer.budget < minRequiredBid && lot?.isReducedPrice && myPlayer.budget > (lot?.currentBid || 0)) {
        setCustomBidAmount(myPlayer.budget);
      } else {
        setCustomBidAmount(minRequiredBid);
      }
      setBidError(null);
    }
  }, [minRequiredBid, lot?.id, lot?.isReducedPrice, myPlayer?.budget]);

  if (!roomState) return null;

  const handlePlaceBid = async (amount: number) => {
    if (!lot || !myPlayer) return;
    if (amount > myPlayer.budget) {
      setBidError(`Insufficient credits. You hold ${myPlayer.budget} credits.`);
      return;
    }
    const isAllInSpecial = lot.isReducedPrice && amount === myPlayer.budget && amount > lot.currentBid;
    if (amount < minRequiredBid && !isAllInSpecial) {
      setBidError(`Bid must be at least ${minRequiredBid} credits.`);
      return;
    }

    setIsSubmittingBid(true);
    setBidError(null);
    const res = await placeBid(amount);
    setIsSubmittingBid(false);
    if (!res.success) {
      setBidError(res.error || 'Bid rejected');
    }
  };

  const handleQuickAdd = (increment: number) => {
    setCustomBidAmount((prev) => {
      const base = prev > 0 ? prev : minRequiredBid;
      const target = base + increment;
      if (myPlayer && target > myPlayer.budget) {
        return myPlayer.budget;
      }
      return Math.max(minRequiredBid, target);
    });
  };

  const isRosterFull = (myPlayer?.roster.length ?? 0) >= roomState.settings.requiredRosterSize;
  const hasEnoughBudget = (myPlayer?.budget ?? 0) >= minRequiredBid || 
    (lot?.isReducedPrice && (myPlayer?.budget ?? 0) > (lot?.currentBid ?? 0));

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* SOLD / UNSOLD OVERLAY STAMP */}
      {soldBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in zoom-in duration-300">
          <div className="relative max-w-lg w-full p-8 rounded-3xl bg-gradient-to-b from-[#1C1F2B] to-[#0A0C10] border-2 border-[#C6A15B] shadow-[0_0_80px_rgba(198,161,91,0.4)] text-center space-y-5">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#C6A15B] to-[#9B7838] p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-[#08090D] flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-[#F0D79A]" />
              </div>
            </div>

            <div className="space-y-1">
              <span className={`text-xs font-mono font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full border ${
                soldBanner.status === 'SOLD' 
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300' 
                  : 'border-amber-500/50 bg-amber-950/40 text-amber-300'
              }`}>
                {soldBanner.status === 'SOLD' ? '👑 GAVEL STRUCK — SOLD' : 'PASSED UNSOLD'}
              </span>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-black text-gold-gradient tracking-wider pt-2">
                {soldBanner.lot.hero.name}
              </h2>
            </div>

            {soldBanner.status === 'SOLD' ? (
              <div className="p-4 rounded-2xl bg-[#08090D] border border-[#C6A15B]/30 space-y-2">
                <div className="text-xs uppercase text-[#9295A0] tracking-widest font-semibold">
                  Winning Bidder
                </div>
                <div className="text-xl font-cinzel font-bold text-[#F5F0E7]">
                  {soldBanner.winnerName}
                </div>
                <div className="text-2xl font-mono font-bold text-gold-gradient">
                  {soldBanner.finalPrice?.toLocaleString()} CREDITS
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#9295A0]">
                No valid bids were submitted before the authoritative server deadline. Hero passes back to the reserve vaults.
              </p>
            )}

            <div className="text-xs text-[#9295A0] font-mono animate-pulse">
              Preparing next lot for auction...
            </div>
          </div>
        </div>
      )}

      {/* Arena Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111319] border border-[#C6A15B]/25">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B1020] to-[#C62838] flex items-center justify-center text-white shadow-lg shadow-[#8B1020]/30 font-bold font-mono">
            #{lot ? lot.lotNumber : roomState.currentLotIndex + 1}
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#C6A15B]">
              LOT {roomState.currentLotIndex + 1} OF {roomState.lots.length}
            </div>
            <h1 className="font-cinzel text-lg sm:text-xl font-bold text-[#F5F0E7]">
              {lot ? lot.hero.name : 'Awaiting Next Lot...'}
            </h1>
          </div>
        </div>

        {/* Header Right Controls: Sound Toggle, Leave Room, Live Timer Gauge, Purse */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Sound Mute / Unmute Button */}
          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-2xl border transition-all ${
              isMuted
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-400 hover:bg-rose-900/40'
                : 'bg-[#08090D] border-[#C6A15B]/40 text-[#F0D79A] hover:border-[#C6A15B] hover:bg-[#C6A15B]/10'
            }`}
            title={isMuted ? 'Unmute match audio' : 'Mute match audio'}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Leave Chamber Button */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to leave this auction chamber?')) {
                leaveRoom();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#E01414]/10 border border-[#E01414]/40 hover:border-[#E01414] text-[#E01414] hover:bg-[#E01414]/20 transition-all text-xs font-mono font-bold"
            title="Leave this auction chamber"
            aria-label="Leave match"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>LEAVE</span>
          </button>

          {/* Live Timer Gauge */}
          {lot && (
            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border transition-all ${
              timeLeft <= 5 
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.4)]' 
                : 'bg-[#08090D] border-[#C6A15B]/40 text-[#F0D79A]'
            }`}>
              <Timer className={`w-5 h-5 ${timeLeft <= 5 ? 'animate-bounce' : ''}`} />
              <div className="text-right">
                <div className="text-[9px] font-mono uppercase tracking-widest text-[#9295A0]">
                  Authoritative Clock
                </div>
                <div className="text-2xl font-mono font-black tracking-wider leading-none">
                  {timeLeft.toString().padStart(2, '0')}s
                </div>
              </div>
            </div>
          )}

          {/* User purse quick indicator */}
          <div className="px-3 py-2 rounded-2xl bg-[#08090D] border border-white/10 text-right">
            <div className="text-[9px] font-mono uppercase tracking-widest text-[#9295A0]">Your Purse</div>
            <div className="text-sm font-mono font-bold text-gold-gradient">
              {myPlayer?.budget.toLocaleString()} CR
            </div>
          </div>
        </div>
      </div>

      {/* Main Stage Grid: Hero Card (Left), Bidding Floor (Center), Chamber Roster (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Featured Hero Card (5 cols on LG) */}
        <div className="lg:col-span-5 space-y-4">
          {lot ? (
            <>
              <HeroCard
                hero={lot.hero}
                price={lot.currentBid}
                priceLabel={
                  lot.highestBidderId
                    ? 'CURRENT LEADING BID'
                    : lot.isReducedPrice
                    ? 'SPECIAL OPENING BID'
                    : 'OPENING BID VALUE'
                }
              />
              
              {lot.isReducedPrice && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-red-950/50 to-amber-950/40 border-2 border-[#C6A15B] shadow-[0_0_30px_rgba(198,161,91,0.25)] space-y-2 animate-in slide-in-from-top-4 fade-in duration-500">
                  <div className="flex items-center gap-2 text-[#F0D79A]">
                    <Sparkles className="w-5 h-5 text-[#C6A15B] animate-pulse" />
                    <div>
                      <h3 className="font-cinzel font-black text-base tracking-widest text-gold-gradient">
                        SPECIAL AUCTION — REDUCED PRICE MODE
                      </h3>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#C6A15B]">
                        BASE PRICE OVERRIDE
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[#F5F0E7]/90 leading-relaxed font-sans">
                    Nobody can afford this hero&apos;s base price ({lot.originalBasePrice ?? lot.hero.basePrice} CR). Special bidding is now active! Use your remaining credits to compete for this character.
                  </p>
                  <div className="text-[11px] font-mono text-[#C6A15B] flex items-center gap-1.5 pt-1">
                    <span>⚡ Current opening / standing:</span>
                    <span className="font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-[#C6A15B]/30">
                      {lot.currentBid} CR
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 rounded-2xl bg-[#111319] border border-white/10 text-center text-[#9295A0]">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#C6A15B] animate-spin" />
              <p>Summoning next superhero lot to the floor...</p>
            </div>
          )}
        </div>

        {/* Center Column: Live Bidding Controls & Activity (4 cols on LG) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Highest Bid Status Box */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isHoldingLead
              ? 'bg-gradient-to-b from-[#1E291B] to-[#0D150B] border-emerald-500/70 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
              : 'bg-gradient-to-b from-[#1C1F2B] to-[#0E1017] border-[#C6A15B]/30'
          }`}>
            <div className="flex justify-between items-center text-xs mb-2">
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-widest font-semibold text-[#9295A0]">
                  {lot?.highestBidderId ? 'Highest Bidder' : 'Opening Price'}
                </span>
                {lot?.isReducedPrice && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold">
                    SPECIAL REDUCED PRICE
                  </span>
                )}
              </div>
              {isHoldingLead && (
                <span className="flex items-center gap-1 text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  YOU ARE WINNING
                </span>
              )}
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs text-[#9295A0]">Leading Bidder</div>
                <div className="font-cinzel text-lg font-bold text-[#F5F0E7]">
                  {lot?.highestBidderName || 'None (Open for initial bid)'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#9295A0]">Standing Price</div>
                <div className="font-mono text-3xl font-black text-gold-gradient">
                  {lot?.currentBid.toLocaleString()}
                  <span className="text-xs ml-1 text-[#F0D79A] font-sans">CR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bid Control Panel */}
          <div className="p-5 rounded-2xl bg-[#111319] border border-[#C6A15B]/30 space-y-4">
            <div className="flex justify-between items-center text-xs font-semibold text-[#C6A15B]">
              <span>BIDDING CONSOLE</span>
              <span className="text-[#9295A0] font-mono">Min +{roomState.settings.bidIncrement} CR</span>
            </div>

            {bidError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{bidError}</span>
              </div>
            )}

            {/* Quick Bid Increment Buttons */}
            <div>
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-[#9295A0] mb-1.5">
                <span>Quick Increment Adjust</span>
                {lot?.isReducedPrice && (
                  <span className="text-amber-400 font-semibold">Special Mode (+10 / +20 Active)</span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map((inc) => {
                  const targetBid = (customBidAmount > 0 ? customBidAmount : minRequiredBid) + inc;
                  const isAffordable = myPlayer ? myPlayer.budget >= targetBid : true;
                  const isPrimary = inc === 10 || inc === 20;

                  return (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => handleQuickAdd(inc)}
                      disabled={!isAffordable && (!myPlayer || myPlayer.budget <= (lot?.currentBid || 0))}
                      title={!isAffordable ? `Requires ${targetBid} CR (You have ${myPlayer?.budget || 0} CR)` : undefined}
                      className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all active:scale-95 ${
                        isPrimary
                          ? 'bg-gradient-to-b from-[#1C1F2B] to-[#0E1017] border-[#C6A15B] text-gold-gradient shadow-[0_0_10px_rgba(198,161,91,0.2)] hover:border-[#F0D79A]'
                          : 'bg-[#08090D] border-white/10 text-[#F0D79A] hover:border-[#C6A15B] hover:bg-[#C6A15B]/10'
                      } ${!isAffordable ? 'opacity-40 hover:opacity-70' : ''}`}
                    >
                      +{inc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amount Field */}
            <div>
              <div className="flex justify-between text-[10px] uppercase tracking-wider text-[#9295A0] mb-1">
                <span>Custom Bid Submission</span>
                <span>Minimum: {minRequiredBid} CR</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={minRequiredBid}
                  step={roomState.settings.bidIncrement}
                  value={customBidAmount}
                  onChange={(e) => setCustomBidAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-[#08090D] border border-[#C6A15B]/40 focus:border-[#F0D79A] font-mono text-xl font-bold text-[#F0D79A] focus:outline-none focus:ring-1 focus:ring-[#C6A15B]"
                />
                <span className="absolute right-4 top-3.5 text-xs font-mono text-[#9295A0] font-bold">
                  CREDITS
                </span>
              </div>
            </div>

            {/* Main Action Bid Button */}
            <button
              onClick={() => handlePlaceBid(customBidAmount)}
              disabled={
                !lot ||
                lot.status !== 'LIVE' ||
                isSubmittingBid ||
                isHoldingLead ||
                isRosterFull ||
                !hasEnoughBudget
              }
              className={`w-full py-4 rounded-xl font-cinzel font-bold text-sm tracking-widest uppercase transition-all shadow-lg ${
                isHoldingLead
                  ? 'bg-emerald-900/60 border border-emerald-500 text-emerald-300 cursor-not-allowed'
                  : isRosterFull
                  ? 'bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed'
                  : !hasEnoughBudget
                  ? 'bg-rose-950/50 border border-rose-800 text-rose-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#8B1020] via-[#C62838] to-[#8B1020] text-white hover:brightness-110 active:scale-[0.99] shadow-[#8B1020]/40'
              }`}
            >
              {isHoldingLead
                ? '✓ YOU CURRENTLY HOLD HIGHEST BID'
                : isRosterFull
                ? 'ROSTER COMPLETE (LIMIT REACHED)'
                : !hasEnoughBudget
                ? 'INSUFFICIENT CREDITS'
                : isSubmittingBid
                ? 'TRANSMITTING BID...'
                : `SUBMIT BID: ${customBidAmount.toLocaleString()} CR`}
            </button>

            {/* Anti-snipe notice */}
            <p className="text-[11px] text-[#9295A0] text-center leading-tight">
              ⚡ Anti-sniping active: Placing a bid in the final 5s extends the timer by +5s.
            </p>

            {/* Skip Voting */}
            {!lot?.highestBidderId && lot?.status === 'LIVE' && (
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => voteSkip()}
                  disabled={!myPlayer || lot.skipVotes?.includes(myPlayer.id)}
                  className="w-full py-2.5 rounded-lg border border-slate-700/50 hover:bg-slate-800 text-[#9295A0] text-xs font-semibold tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {myPlayer && lot.skipVotes?.includes(myPlayer.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">VOTED TO SKIP ({lot.skipVotes.length}/{Object.values(roomState.players).filter(p => p.isOnline).length})</span>
                    </>
                  ) : (
                    'I DON\'T NEED THIS CHARACTER (Skip)'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Recent Bids on this active lot */}
          <div className="p-4 rounded-2xl bg-[#0C0E14] border border-white/10 space-y-2">
            <div className="text-xs uppercase font-bold tracking-wider text-[#9295A0] flex items-center justify-between">
              <span>Lot Bidding Log</span>
              <span className="font-mono">{lot?.bidHistory.length || 0} bids</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {lot && lot.bidHistory.length > 0 ? (
                lot.bidHistory.map((bid) => (
                  <div
                    key={bid.id}
                    className="flex justify-between items-center text-xs p-1.5 rounded-lg bg-[#111319]"
                  >
                    <span className="font-semibold text-[#F5F0E7] truncate max-w-[120px]">
                      {bid.playerName}
                    </span>
                    <span className="font-mono font-bold text-gold-gradient">
                      {bid.amount.toLocaleString()} CR
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#9295A0] italic text-center py-2">
                  No bids yet. Submit the opening bid!
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Chamber Bidders & User Roster (3 cols on LG) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* User Roster Progress Card */}
          <div className="p-4 rounded-2xl bg-[#111319] border border-[#C6A15B]/30 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-cinzel text-xs font-bold text-gold-gradient">
                YOUR ROSTER
              </span>
              <span className="font-mono text-xs text-[#F0D79A]">
                {myPlayer?.roster.length || 0} / {roomState.settings.requiredRosterSize}
              </span>
            </div>

            {/* Mini roster slots */}
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: roomState.settings.requiredRosterSize }).map((_, idx) => {
                const acquired = myPlayer?.roster[idx];
                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-lg border flex items-center justify-center overflow-hidden transition-all ${
                      acquired
                        ? 'border-[#C6A15B] bg-[#08090D]'
                        : 'border-white/10 bg-[#08090D]/50 border-dashed text-[#9295A0]'
                    }`}
                  >
                    {acquired ? (
                      <img
                        src={acquired.hero.imageUrl}
                        alt={acquired.hero.name}
                        title={`${acquired.hero.name} (${acquired.purchasePrice} CR)`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Shield className="w-3.5 h-3.5 opacity-30" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chamber Rivals Standing Table */}
          <div className="p-4 rounded-2xl bg-[#0C0E14] border border-white/10 space-y-3">
            <div className="text-xs uppercase font-bold tracking-wider text-[#C6A15B]">
              Chamber Rivals
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {Object.values(roomState.players).map((p) => {
                const isMe = p.id === myPlayer?.id;
                return (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                      isMe ? 'border-[#C6A15B]/50 bg-[#171A23]' : 'border-white/5 bg-[#111319]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={p.avatar}
                        alt={p.displayName}
                        className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#F5F0E7] truncate">
                          {p.displayName} {isMe && '(You)'}
                        </div>
                        <div className="text-[10px] text-[#9295A0]">
                          {p.roster.length}/{roomState.settings.requiredRosterSize} Heroes
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-mono font-bold text-[#F0D79A]">
                        {p.budget}
                      </div>
                      <div className="text-[9px] text-[#9295A0]">CR</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chamber Live Feed */}
          <div className="p-4 rounded-2xl bg-[#0C0E14] border border-white/10 space-y-2">
            <div className="text-xs uppercase font-bold tracking-wider text-[#9295A0]">
              Chamber Activity
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-[11px] text-[#9295A0]">
              {roomState.recentActivity.slice(0, 6).map((item) => (
                <div key={item.id} className="leading-tight">
                  <span className={item.highlight ? 'text-[#F0D79A] font-semibold' : ''}>
                    {item.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
