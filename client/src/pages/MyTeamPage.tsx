import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext.js';
import { HeroCard } from '../components/HeroCard.js';
import { Shield, Coins, Sparkles, Filter, Award, TrendingUp } from 'lucide-react';
import { HeroRole, HeroRarity } from '../types/index.js';

export const MyTeamPage: React.FC = () => {
  const { roomState, myPlayer } = useAuction();

  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [rarityFilter, setRarityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'power' | 'price' | 'name'>('power');

  if (!roomState || !myPlayer) return null;

  const roster = myPlayer.roster;
  const targetSize = roomState.settings.requiredRosterSize;

  // Team summary calculations
  const totalBasePower = roster.reduce((sum, item) => sum + item.hero.totalPower, 0);
  const uniqueRoles = new Set(roster.map(item => item.hero.role));
  let compositionBonus = 0;
  if (uniqueRoles.size >= 5) compositionBonus = 100;
  else if (uniqueRoles.size === 4) compositionBonus = 60;
  else if (uniqueRoles.size === 3) compositionBonus = 30;

  const finalScore = totalBasePower + compositionBonus;
  const totalSpent = roster.reduce((sum, item) => sum + item.purchasePrice, 0);
  const avgPrice = roster.length > 0 ? Math.round(totalSpent / roster.length) : 0;

  // Filter & sort
  let filtered = [...roster];
  if (roleFilter !== 'ALL') {
    filtered = filtered.filter(item => item.hero.role === roleFilter);
  }
  if (rarityFilter !== 'ALL') {
    filtered = filtered.filter(item => item.hero.rarity === rarityFilter);
  }

  filtered.sort((a, b) => {
    if (sortBy === 'power') return b.hero.totalPower - a.hero.totalPower;
    if (sortBy === 'price') return b.purchasePrice - a.purchasePrice;
    return a.hero.name.localeCompare(b.hero.name);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header & Stats Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#171A23] via-[#111319] to-[#1C161D] border border-[#C6A15B]/30 shadow-[0_0_40px_rgba(198,161,91,0.12)]">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C6A15B] px-2.5 py-0.5 rounded-full bg-[#C6A15B]/15 border border-[#C6A15B]/30">
                COLLECTOR VAULT
              </span>
              <span className="text-xs text-[#9295A0]">
                {roster.length} of {targetSize} Quota Acquired
              </span>
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#F5F0E7]">
              {myPlayer.displayName}'s DYNASTY ROSTER
            </h1>
            <p className="text-xs text-[#9295A0] mt-1 max-w-xl">
              Superheroes under your executive contract. Synergize unique combat roles to maximize the Dynasty Composition Bonus.
            </p>
          </div>

          {/* Big Score Box */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
            <div className="flex-1 sm:flex-none p-4 rounded-2xl bg-[#08090D] border border-[#C6A15B]/40 text-center min-w-[130px]">
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#9295A0]">Final Score</div>
              <div className="font-mono text-2xl sm:text-3xl font-black text-gold-gradient">
                {finalScore}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                +{compositionBonus} Role Bonus
              </div>
            </div>

            <div className="flex-1 sm:flex-none p-4 rounded-2xl bg-[#08090D] border border-white/10 text-center min-w-[120px]">
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#9295A0]">Purse Balance</div>
              <div className="font-mono text-xl sm:text-2xl font-bold text-[#F0D79A]">
                {myPlayer.budget.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#9295A0] font-mono mt-0.5">
                Spent {totalSpent} CR
              </div>
            </div>
          </div>
        </div>

        {/* Composition Diversity Meter */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#9295A0] block">Base Power Score</span>
            <span className="font-mono font-bold text-sm text-[#F5F0E7]">{totalBasePower}</span>
          </div>
          <div>
            <span className="text-[#9295A0] block">Unique Role Synergy</span>
            <span className="font-mono font-bold text-sm text-[#C6A15B]">{uniqueRoles.size} / 5 Roles</span>
          </div>
          <div>
            <span className="text-[#9295A0] block">Avg Acquisition Cost</span>
            <span className="font-mono font-bold text-sm text-[#F5F0E7]">{avgPrice} Credits</span>
          </div>
          <div>
            <span className="text-[#9295A0] block">Roster Completeness</span>
            <span className="font-mono font-bold text-sm text-[#F0D79A]">
              {Math.round((roster.length / targetSize) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#111319] border border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#9295A0] flex items-center gap-1 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            FILTER:
          </span>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#08090D] border border-white/10 text-xs font-semibold text-[#F5F0E7] focus:outline-none focus:border-[#C6A15B]"
          >
            <option value="ALL">All Roles</option>
            <option value="Titan">Titan</option>
            <option value="Duelist">Duelist</option>
            <option value="Tactician">Tactician</option>
            <option value="Vanguard">Vanguard</option>
            <option value="Support">Support</option>
          </select>

          {/* Rarity Filter */}
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#08090D] border border-white/10 text-xs font-semibold text-[#F5F0E7] focus:outline-none focus:border-[#C6A15B]"
          >
            <option value="ALL">All Rarities</option>
            <option value="Mythic">Mythic</option>
            <option value="Legendary">Legendary</option>
            <option value="Epic">Epic</option>
            <option value="Rare">Rare</option>
            <option value="Uncommon">Uncommon</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9295A0] font-semibold">SORT:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-[#08090D] border border-white/10 text-xs font-semibold text-[#F0D79A] focus:outline-none focus:border-[#C6A15B]"
          >
            <option value="power">Highest Power</option>
            <option value="price">Highest Cost</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Roster Grid or Empty State */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <HeroCard
              key={item.hero.id}
              hero={item.hero}
              price={item.purchasePrice}
              priceLabel="PURCHASE PRICE"
              isCompact={false}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 rounded-3xl bg-[#111319] border border-dashed border-white/10 text-center space-y-4">
          <Shield className="w-12 h-12 mx-auto text-[#C6A15B]/40" />
          <div className="space-y-1">
            <h3 className="font-cinzel text-lg font-bold text-[#F5F0E7]">
              {roster.length === 0 ? 'NO HEROES IN VAULT YET' : 'NO HEROES MATCHING CRITERIA'}
            </h3>
            <p className="text-xs text-[#9295A0] max-w-md mx-auto">
              {roster.length === 0
                ? 'Join the Live Arena bidding floor and outbid rivals to win your first superhero.'
                : 'Clear the active filters to see your full assembled roster.'}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
