import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext.js';
import { HeroCard } from '../components/HeroCard.js';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Award, 
  Coins, 
  Shield, 
  Flame, 
  Sparkles, 
  ArrowLeft, 
  RotateCcw,
  History
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { roomState, leaveRoom } = useAuction();
  const [selectedBidderId, setSelectedBidderId] = useState<string | null>(null);

  if (!roomState) return null;

  const rankings = roomState.rankings || [];
  const champion = rankings[0];

  // Overall auction stats
  const totalLots = roomState.lots.length;
  const soldLots = roomState.lots.filter(l => l.status === 'SOLD').length;
  const unsoldLots = totalLots - soldLots;
  const totalVolumeSpent = roomState.lots.reduce((sum, l) => sum + (l.finalPrice || 0), 0);

  const selectedRanking = rankings.find(r => r.playerId === selectedBidderId) || rankings[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      
      {/* Grand Victorious Banner */}
      <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#201B12] via-[#111319] to-[#200F15] border-2 border-[#C6A15B] shadow-[0_0_70px_rgba(198,161,91,0.25)] text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-48 bg-radial-crimson opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C6A15B]/20 border border-[#C6A15B] text-[#F0D79A] text-xs font-mono font-bold uppercase tracking-widest">
            <Crown className="w-4 h-4 text-[#F0D79A]" />
            DYNASTY AUCTION CONCLUDED
          </div>

          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-gold-gradient tracking-wider">
            HALL OF CHAMPIONS
          </h1>

          <p className="text-sm text-[#9295A0]">
            The hammer has struck for the final lot. The dynasty crowns its ultimate collector based on authoritative team combat evaluation and strategic role synergy.
          </p>

          {champion && (
            <div className="pt-4 flex items-center justify-center gap-4">
              <div className="relative">
                <img
                  src={champion.avatar}
                  alt={champion.displayName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#C6A15B] shadow-[0_0_20px_rgba(198,161,91,0.4)]"
                />
                <span className="absolute -top-3 -right-2 text-2xl">👑</span>
              </div>
              <div className="text-left">
                <div className="text-xs uppercase tracking-widest text-[#C6A15B] font-mono font-bold">
                  DYNASTY GRANDMASTER
                </div>
                <div className="font-cinzel text-xl sm:text-2xl font-bold text-[#F5F0E7]">
                  {champion.displayName}
                </div>
                <div className="font-mono text-sm font-bold text-gold-gradient">
                  {champion.finalScore} FINAL SCORE ({champion.basePower} Base + {champion.compositionBonus} Synergy)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Auction Session Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#111319] border border-white/10 text-center">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#9295A0]">Total Lots Offered</div>
          <div className="font-mono text-2xl font-bold text-[#F5F0E7] mt-1">{totalLots}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#111319] border border-emerald-500/30 text-center">
          <div className="text-[10px] uppercase font-mono tracking-wider text-emerald-400">Lots Awarded</div>
          <div className="font-mono text-2xl font-bold text-emerald-300 mt-1">{soldLots}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#111319] border border-amber-500/30 text-center">
          <div className="text-[10px] uppercase font-mono tracking-wider text-amber-400">Passed Unsold</div>
          <div className="font-mono text-2xl font-bold text-amber-300 mt-1">{unsoldLots}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#111319] border border-[#C6A15B]/30 text-center">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#C6A15B]">Exchange Volume</div>
          <div className="font-mono text-2xl font-bold text-gold-gradient mt-1">
            {totalVolumeSpent.toLocaleString()} CR
          </div>
        </div>
      </div>

      {/* Podium & Final Rankings Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#C6A15B]" />
          <h2 className="font-cinzel text-xl font-bold text-[#F5F0E7]">
            FINAL LEADERBOARD & RANKINGS
          </h2>
        </div>

        <div className="space-y-3">
          {rankings.map((r) => {
            const is1st = r.rank === 1;
            const is2nd = r.rank === 2;
            const is3rd = r.rank === 3;
            const isSelected = selectedRanking?.playerId === r.playerId;

            return (
              <div
                key={r.playerId}
                onClick={() => setSelectedBidderId(r.playerId)}
                className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all ${
                  is1st
                    ? 'border-[#C6A15B] bg-gradient-to-r from-[#1C1A14] to-[#111319] shadow-[0_0_25px_rgba(198,161,91,0.15)]'
                    : is2nd
                    ? 'border-slate-400/50 bg-[#12141A]'
                    : is3rd
                    ? 'border-amber-700/50 bg-[#151210]'
                    : 'border-white/10 bg-[#0C0E14]'
                } ${isSelected ? 'ring-2 ring-[#C6A15B]' : ''} hover:border-[#C6A15B]/80`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Left: Rank & Avatar & Name */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-cinzel font-black text-lg">
                      {is1st ? '🥇' : is2nd ? '🥈' : is3rd ? '🥉' : `#${r.rank}`}
                    </div>
                    <img
                      src={r.avatar}
                      alt={r.displayName}
                      className="w-12 h-12 rounded-xl object-cover border border-[#C6A15B]/40"
                    />
                    <div>
                      <div className="font-cinzel font-bold text-base text-[#F5F0E7] flex items-center gap-2">
                        {r.displayName}
                        {is1st && <span className="text-xs text-[#F0D79A] font-mono">[CHAMPION]</span>}
                      </div>
                      <div className="text-xs text-[#9295A0] font-mono mt-0.5">
                        {r.rosterCount} / {r.rosterTarget} Heroes Collected • Spent {r.totalSpent} CR
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores & Breakdown */}
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] font-mono uppercase text-[#9295A0]">Power Breakdown</div>
                      <div className="text-xs font-mono text-[#F5F0E7]">
                        Base {r.basePower} <span className="text-emerald-400">+{r.compositionBonus} bonus</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase text-[#9295A0]">Final Score</div>
                      <div className="font-mono text-2xl font-black text-gold-gradient">
                        {r.finalScore}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Collector's Acquired Squad Showcase */}
      {selectedRanking && (
        <div className="p-6 rounded-3xl bg-[#111319] border border-[#C6A15B]/30 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C6A15B]">
                INSPECTING ROSTER
              </span>
              <h3 className="font-cinzel text-xl font-bold text-[#F5F0E7]">
                {selectedRanking.displayName}'s Final Superhero Team
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-400">
                Best Value: {selectedRanking.bestValueHero?.hero.name || 'None'}
              </span>
              <span className="text-[#F0D79A]">
                Primmum Lot: {selectedRanking.mostExpensiveHero?.hero.name || 'None'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {selectedRanking.heroes.map((item) => (
              <HeroCard
                key={item.hero.id}
                hero={item.hero}
                price={item.purchasePrice}
                priceLabel="PURCHASED FOR"
                isCompact={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Leave / Return button */}
      <div className="text-center pt-4">
        <button
          onClick={leaveRoom}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#C6A15B] to-[#F0D79A] text-[#08090D] font-cinzel font-bold text-sm tracking-widest uppercase hover:brightness-110 transition-all shadow-lg shadow-[#C6A15B]/20"
        >
          RETURN TO MAIN FOYER
        </button>
      </div>

    </div>
  );
};
