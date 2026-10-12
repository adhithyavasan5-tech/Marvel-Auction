import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext.js';
import { 
  Copy, 
  Check, 
  Crown, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Coins, 
  Layers, 
  AlertCircle, 
  Radio
} from 'lucide-react';

export const LobbyPage: React.FC = () => {
  const { 
    roomState, 
    myPlayer, 
    setReady, 
    startAuction 
  } = useAuction();

  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!roomState) return null;

  const playersList = Object.values(roomState.players);
  const isHost = myPlayer?.isHost;
  const isReady = myPlayer?.isReady;
  const readyCount = playersList.filter(p => p.isReady).length;
  const canStart = isHost && playersList.length >= 2 && readyCount === playersList.length;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomState.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStartAuction = async () => {
    if (!canStart) return;
    setIsStarting(true);
    setErrorMsg(null);
    const res = await startAuction();
    setIsStarting(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to open bidding floor');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#171A23] via-[#111319] to-[#1A1015] border border-[#C6A15B]/40 shadow-[0_0_40px_rgba(198,161,91,0.12)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial-crimson opacity-50 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#C6A15B]/15 border border-[#C6A15B]/30 text-[#F0D79A]">
                CHAMBER LOBBY
              </span>
              <span className="text-xs text-[#9295A0]">Waiting for Chamber Host to strike gavel</span>
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F5F0E7]">
              AUCTION ANTECHAMBER
            </h1>
            <p className="text-sm text-[#9295A0] max-w-xl">
              Coordinate with fellow bidders. Once the host commences the session, all participants enter the synchronized live arena.
            </p>
          </div>

          {/* Chamber Code Card */}
          <div className="flex flex-col items-center sm:items-end w-full md:w-auto">
            <div className="text-[11px] uppercase tracking-wider text-[#C6A15B] font-semibold mb-1">
              Chamber Access Code
            </div>
            <div className="flex items-center gap-2 bg-[#08090D] px-4 py-2.5 rounded-2xl border border-[#C6A15B]/50 shadow-inner">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-[0.25em] text-[#F0D79A]">
                {roomState.roomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-xl bg-[#C6A15B]/20 hover:bg-[#C6A15B]/30 text-[#F0D79A] transition-colors"
                title="Copy Room Code"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copied && (
              <span className="text-[11px] text-emerald-400 font-semibold mt-1">
                Room code copied to clipboard!
              </span>
            )}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Bidders List & Chamber Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Assembled Bidders (2 cols on LG) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#C6A15B]" />
              <h2 className="font-cinzel text-lg font-bold text-[#F5F0E7]">
                ASSEMBLED BIDDERS ({playersList.length}/{roomState.settings.maxPlayers})
              </h2>
            </div>
            <span className="text-xs font-mono text-[#F0D79A]">
              {readyCount} / {playersList.length} READY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {playersList.map((player) => {
              const isMe = player.id === myPlayer?.id;
              return (
                <div
                  key={player.id}
                  className={`relative p-4 rounded-2xl border transition-all ${
                    player.isReady
                      ? 'border-[#C6A15B]/60 bg-gradient-to-r from-[#171A23] to-[#14181F] shadow-[0_0_15px_rgba(198,161,91,0.08)]'
                      : 'border-white/10 bg-[#0C0E14]'
                  } ${isMe ? 'ring-1 ring-[#C6A15B]/40' : ''}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={player.avatar}
                          alt={player.displayName}
                          className="w-12 h-12 rounded-xl object-cover border border-[#C6A15B]/40"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0C0E14] ${
                            player.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-cinzel font-bold text-sm text-[#F5F0E7]">
                            {player.displayName}
                          </span>
                          {player.isHost && (
                            <span title="Chamber Host">
                              <Crown className="w-3.5 h-3.5 text-[#F0D79A]" />
                            </span>
                          )}
                          {isMe && (
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-white/10 text-[#C6A15B]">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-[#C6A15B] mt-0.5">
                          {player.budget.toLocaleString()} CREDITS
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {player.isReady ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold font-mono px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                          <ShieldCheck className="w-3 h-3" />
                          READY
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#9295A0]">
                          WAITING
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            {/* Ready Toggle for Non-Host or Host */}
            <button
              onClick={() => setReady(!isReady)}
              className={`w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase transition-all border ${
                isReady
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/40'
                  : 'bg-[#C6A15B]/20 border-[#C6A15B] text-[#F0D79A] hover:bg-[#C6A15B]/30'
              }`}
            >
              {isReady ? '✓ SIGNALED READY (CLICK TO UNREADY)' : '⚡ SIGNAL READY'}
            </button>

            {/* Start Button for Host */}
            {isHost && (
              <button
                onClick={handleStartAuction}
                disabled={!canStart || isStarting}
                className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#8B1020] via-[#C62838] to-[#8B1020] text-white font-cinzel font-bold text-xs sm:text-sm tracking-widest uppercase hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-[#8B1020]/40 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isStarting ? 'STRIKING GAVEL...' : 'STRIKE GAVEL (START AUCTION)'}
              </button>
            )}
          </div>

          {isHost && !canStart && (
            <p className="text-xs text-amber-400/90 text-center sm:text-left italic">
              ℹ️ Auction requires at least 2 connected bidders, and every bidder must signal Ready before the gavel can be struck.
            </p>
          )}

        </div>

        {/* Right Column: Chamber Settings & Live Rules */}
        <div className="space-y-4">
          <div className="rounded-2xl p-5 bg-[#111319] border border-[#C6A15B]/30 space-y-4">
            <h3 className="font-cinzel text-sm font-bold text-gold-gradient tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C6A15B]" />
              CHAMBER SPECIFICATIONS
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-[#9295A0]">Starting Purse</span>
                <span className="font-mono font-bold text-[#F0D79A]">
                  {roomState.settings.startingBudget.toLocaleString()} Credits
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-[#9295A0]">Roster Quota</span>
                <span className="font-mono font-bold text-[#F5F0E7]">
                  {roomState.settings.requiredRosterSize} Heroes
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-[#9295A0]">Min Bid Increment</span>
                <span className="font-mono font-bold text-[#F5F0E7]">
                  +{roomState.settings.bidIncrement} Credits
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-[#9295A0]">Authoritative Clock</span>
                <span className="font-mono font-bold text-[#F5F0E7]">
                  {roomState.settings.countdownSeconds} Seconds / Lot
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-[#9295A0]">Total Auction Lots</span>
                <span className="font-mono font-bold text-[#F5F0E7]">
                  {roomState.settings.lotCount} Superhero Lots
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-[#9295A0]">Universe Mode</span>
                <span className="font-mono font-bold text-[#C6A15B] uppercase">
                  {roomState.settings.catalogueMode}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#9295A0]">Anti-Sniping Clock</span>
                <span className="font-mono font-bold text-emerald-400">
                  +5s in final 5 seconds
                </span>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-2xl p-5 bg-[#0C0E14] border border-white/10 space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#9295A0]">
              Chamber Log
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {roomState.recentActivity.slice(0, 8).map((act) => (
                <div key={act.id} className="text-xs text-[#9295A0] leading-snug">
                  <span className="text-[#C6A15B] font-mono mr-1.5">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className={act.highlight ? 'text-[#F0D79A] font-semibold' : ''}>
                    {act.message}
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
