import React from 'react';
import { Hero, HeroRarity, HeroRole } from '../types/index.js';
import { Shield, Zap, Sparkles, Award } from 'lucide-react';

interface HeroCardProps {
  hero: Hero;
  price?: number;
  priceLabel?: string;
  isCompact?: boolean;
  isWinning?: boolean;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  hero,
  price,
  priceLabel = 'BASE VALUE',
  isCompact = false,
  isWinning = false
}) => {
  const rarityColors: Record<HeroRarity, { border: string; bg: string; text: string; glow: string }> = {
    Mythic: {
      border: 'border-[#C62838]',
      bg: 'bg-gradient-to-r from-[#8B1020]/40 to-[#C62838]/20',
      text: 'text-[#FF7D8C]',
      glow: 'shadow-[0_0_20px_rgba(198,40,56,0.35)]'
    },
    Legendary: {
      border: 'border-[#C6A15B]',
      bg: 'bg-gradient-to-r from-[#C6A15B]/30 to-[#F0D79A]/20',
      text: 'text-[#F0D79A]',
      glow: 'shadow-[0_0_20px_rgba(198,161,91,0.35)]'
    },
    Epic: {
      border: 'border-purple-500/70',
      bg: 'bg-purple-950/30',
      text: 'text-purple-300',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.25)]'
    },
    Rare: {
      border: 'border-blue-500/60',
      bg: 'bg-blue-950/30',
      text: 'text-blue-300',
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]'
    },
    Uncommon: {
      border: 'border-emerald-500/50',
      bg: 'bg-emerald-950/30',
      text: 'text-emerald-300',
      glow: ''
    }
  };

  const roleIcons: Record<HeroRole, string> = {
    Titan: '🛡️ Titan',
    Tactician: '🧠 Tactician',
    Duelist: '⚔️ Duelist',
    Vanguard: '⚡ Vanguard',
    Support: '✨ Support'
  };

  const rarityStyle = rarityColors[hero.rarity] || rarityColors.Rare;

  if (isCompact) {
    return (
      <div className={`group relative rounded-xl overflow-hidden border ${rarityStyle.border} bg-[#111319] hover:border-[#C6A15B] transition-all duration-300`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-[#08090D]">
          <img
            src={hero.imageUrl}
            alt={hero.name}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 block"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-transparent to-black/30" />
          
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${rarityStyle.border} ${rarityStyle.bg} ${rarityStyle.text}`}>
              {hero.rarity}
            </span>
          </div>

          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/70 border border-white/20 text-[#F0D79A]">
              PWR {hero.totalPower}
            </span>
          </div>

          <div className="absolute bottom-2 left-2 right-2">
            <h4 className="font-cinzel font-bold text-sm text-[#F5F0E7] truncate leading-tight">
              {hero.name}
            </h4>
            <div className="flex items-center justify-between text-[11px] mt-0.5">
              <span className="text-[#9295A0] font-sans">{roleIcons[hero.role]}</span>
              {price !== undefined && (
                <span className="font-mono font-bold text-[#F0D79A]">{price} CR</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden border ${rarityStyle.border} ${rarityStyle.glow} bg-gradient-to-b from-[#171A23] to-[#0A0C10] transition-all`}>
      {/* Top Banner */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#08090D]">
        <img
          src={hero.imageUrl}
          alt={hero.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=500&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-contain object-center filter brightness-95 block"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171A23] via-transparent to-black/40" />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${rarityStyle.border} ${rarityStyle.bg} ${rarityStyle.text} backdrop-blur-md`}>
            {hero.rarity}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/60 border border-white/20 text-white backdrop-blur-md">
            {roleIcons[hero.role]}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-black/60 border border-[#C6A15B]/30 text-[#C6A15B] font-mono">
            {hero.publisher}
          </span>
        </div>

        {/* Total Power Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 border border-[#C6A15B] shadow-lg">
          <Award className="w-4 h-4 text-[#F0D79A]" />
          <div>
            <div className="text-[9px] uppercase tracking-wider text-[#9295A0]">Total Power</div>
            <div className="text-sm font-mono font-bold text-gold-gradient">{hero.totalPower} / 600</div>
          </div>
        </div>

        {/* Hero Title & Real Name */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-cinzel text-xl sm:text-2xl font-black text-[#F5F0E7] drop-shadow-md">
            {hero.name}
          </h3>
          {hero.realName && hero.realName !== hero.name && (
            <p className="text-xs text-[#9295A0] italic">
              Alias: {hero.realName}
            </p>
          )}
        </div>
      </div>

      {/* Stats & Lore Body */}
      <div className="p-4 sm:p-5 space-y-4">
        
        {/* Lore / Bio */}
        <p className="text-xs text-[#9295A0] line-clamp-2 leading-relaxed">
          {hero.biography}
        </p>

        {/* 6 Power Stats Grid */}
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#C6A15B] mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Powerstat Analysis</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'INT', val: hero.intelligence },
              { label: 'STR', val: hero.strength },
              { label: 'SPD', val: hero.speed },
              { label: 'DUR', val: hero.durability },
              { label: 'PWR', val: hero.power },
              { label: 'CMB', val: hero.combat }
            ].map((stat) => (
              <div key={stat.label} className="p-1.5 rounded-lg bg-[#08090D] border border-white/5 flex flex-col justify-between">
                <div className="flex justify-between text-[10px] font-mono text-[#9295A0]">
                  <span>{stat.label}</span>
                  <span className="text-[#F0D79A] font-bold">{stat.val}</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-[#C6A15B] to-[#F0D79A]"
                    style={{ width: `${stat.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Abilities Chips */}
        {hero.abilities && hero.abilities.length > 0 && (
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#C6A15B] mb-1.5">
              Dynasty Combat Abilities
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hero.abilities.map((ability, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-[#111319] border border-[#C6A15B]/20 text-[#F5F0E7]"
                >
                  {ability}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Price / Value Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs uppercase text-[#9295A0] tracking-wider font-semibold">
            {priceLabel}
          </span>
          <div className="text-base font-mono font-bold text-gold-gradient">
            {(price ?? hero.basePrice).toLocaleString()} CREDITS
          </div>
        </div>

      </div>
    </div>
  );
};
