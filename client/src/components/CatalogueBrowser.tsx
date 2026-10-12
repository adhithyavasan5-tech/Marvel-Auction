import React, { useState, useEffect } from 'react';
import { Hero } from '../types/index.js';
import { HeroCard } from './HeroCard.js';
import { X, Search, Shield, Sparkles, ArrowLeft, LayoutGrid, List } from 'lucide-react';

interface CatalogueBrowserProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CatalogueBrowser: React.FC<CatalogueBrowserProps> = ({ isOpen, onClose }) => {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [source, setSource] = useState<'api' | 'fallback'>('api');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  const [role, setRole] = useState<string>('ALL');
  const [rarity, setRarity] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');

  const loadHeroes = () => {
    setLoading(true);
    setError(null);
    fetch('/api/heroes?mode=all')
      .then(r => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (data.heroes) {
          setHeroes(data.heroes);
          setSource(data.source || 'api');
        }
      })
      .catch(err => {
        console.error('Failed to load catalogue:', err);
        setError(err.message || 'Failed to load catalogue');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Load heroes whenever the page opens
  useEffect(() => {
    if (isOpen) {
      loadHeroes();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter
  const filtered = heroes.filter(h => {
    const matchesSearch = 
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.realName && h.realName.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = role === 'ALL' || h.role === role;
    const matchesRarity = rarity === 'ALL' || h.rarity === rarity;

    return matchesSearch && matchesRole && matchesRarity;
  });

  // Stats for the header
  const rarityBreakdown = heroes.reduce((acc, h) => {
    acc[h.rarity] = (acc[h.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#08090D]">
      
      {/* ─── Top Navigation Bar ─── */}
      <header className="flex-shrink-0 border-b border-[#C6A15B]/20 bg-gradient-to-r from-[#111319] to-[#0E1017]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          
          {/* Left: Back + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#08090D] border border-[#C6A15B]/30 hover:border-[#C6A15B] text-[#F0D79A] transition-all text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">BACK</span>
            </button>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-8 h-8 rounded-lg bg-[#C6A15B]/20 border border-[#C6A15B] flex items-center justify-center text-[#F0D79A] flex-shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <h1 className="font-cinzel text-lg sm:text-xl font-bold text-gold-gradient tracking-wider whitespace-nowrap">
                  HEROES CATALOGUE
                </h1>
                {/* Data Source Badge */}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex-shrink-0 ${
                  source === 'api'
                    ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                    : 'border-amber-500/40 bg-amber-950/40 text-amber-300'
                }`}>
                  {source === 'api' ? '● LIVE DATA' : '● LOCAL ARCHIVE'}
                </span>
              </div>
              <p className="text-[11px] text-[#9295A0] mt-0.5 hidden sm:block">
                Browse all {heroes.length} heroes · Study power stats, roles & base auction prices
              </p>
            </div>
          </div>

          {/* Right: View Toggle + Stats */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Rarity summary pills (desktop only) */}
            <div className="hidden lg:flex items-center gap-1.5">
              {rarityBreakdown['Mythic'] && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#C62838]/40 bg-[#C62838]/10 text-[#FF7D8C]">
                  {rarityBreakdown['Mythic']} Mythic
                </span>
              )}
              {rarityBreakdown['Legendary'] && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#C6A15B]/40 bg-[#C6A15B]/10 text-[#F0D79A]">
                  {rarityBreakdown['Legendary']} Legend
                </span>
              )}
              {rarityBreakdown['Epic'] && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-purple-500/40 bg-purple-950/30 text-purple-300">
                  {rarityBreakdown['Epic']} Epic
                </span>
              )}
              {rarityBreakdown['Rare'] && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-blue-500/40 bg-blue-950/30 text-blue-300">
                  {rarityBreakdown['Rare']} Rare
                </span>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#08090D] rounded-lg border border-[#C6A15B]/20 p-0.5">
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'compact'
                    ? 'bg-[#C6A15B]/20 text-[#F0D79A]'
                    : 'text-[#9295A0] hover:text-[#F5F0E7]'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'detailed'
                    ? 'bg-[#C6A15B]/20 text-[#F0D79A]'
                    : 'text-[#9295A0] hover:text-[#F5F0E7]'
                }`}
                title="Detailed view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Search & Filters Toolbar ─── */}
      <div className="flex-shrink-0 border-b border-white/5 bg-[#0C0E14]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#9295A0]" />
              <input
                type="text"
                placeholder="Search superhero name or alter ego..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111319] border border-white/10 focus:border-[#C6A15B] text-sm text-[#F5F0E7] focus:outline-none transition-colors"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9295A0] font-semibold whitespace-nowrap">Role:</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#111319] border border-white/10 text-sm text-[#F5F0E7] focus:outline-none focus:border-[#C6A15B]"
              >
                <option value="ALL">All Roles</option>
                <option value="Titan">Titan</option>
                <option value="Duelist">Duelist</option>
                <option value="Tactician">Tactician</option>
                <option value="Vanguard">Vanguard</option>
                <option value="Support">Support</option>
              </select>
            </div>

            {/* Rarity Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9295A0] font-semibold whitespace-nowrap">Rarity:</span>
              <select
                value={rarity}
                onChange={(e) => setRarity(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#111319] border border-white/10 text-sm text-[#F5F0E7] focus:outline-none focus:border-[#C6A15B]"
              >
                <option value="ALL">All Rarities</option>
                <option value="Mythic">Mythic</option>
                <option value="Legendary">Legendary</option>
                <option value="Epic">Epic</option>
                <option value="Rare">Rare</option>
                <option value="Uncommon">Uncommon</option>
              </select>
            </div>
          </div>

          {/* Results count + Reset */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#9295A0] font-mono">
              Showing {filtered.length} of {heroes.length} champions
            </span>
            {(search || role !== 'ALL' || rarity !== 'ALL') && (
              <button
                onClick={() => { setSearch(''); setRole('ALL'); setRarity('ALL'); }}
                className="text-[#C6A15B] hover:text-[#F0D79A] font-semibold transition-colors"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Hero Cards Grid (Scrollable) ─── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E01414]/10 border border-[#E01414]/30 flex items-center justify-center">
                <X className="w-8 h-8 text-[#E01414]" />
              </div>
              <p className="text-sm text-[#E01414] font-semibold">{error}</p>
              <p className="text-xs text-[#9295A0]">Make sure the backend server is running on port 4000</p>
              <button
                onClick={loadHeroes}
                className="px-4 py-2 rounded-lg bg-[#C6A15B]/20 border border-[#C6A15B]/40 text-sm text-[#F0D79A] hover:bg-[#C6A15B]/30 transition-colors font-semibold"
              >
                Retry Connection
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Sparkles className="w-10 h-10 animate-spin text-[#C6A15B]" />
              <p className="text-sm font-mono text-[#9295A0]">Loading superhero catalogue from the archives...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className={
              viewMode === 'compact'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
            }>
              {filtered.map((hero) => (
                <HeroCard key={hero.id} hero={hero} isCompact={viewMode === 'compact'} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-[#9295A0] space-y-3">
              <p className="text-sm font-cinzel">No superheroes match your query</p>
              <button
                onClick={() => { setSearch(''); setRole('ALL'); setRarity('ALL'); }}
                className="text-xs text-[#C6A15B] underline hover:text-[#F0D79A] transition-colors"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Footer Bar ─── */}
      <footer className="flex-shrink-0 border-t border-[#C6A15B]/15 bg-[#0C0E14] py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between text-[10px] text-[#9295A0]">
          <span className="font-cinzel text-[#C6A15B]/60 font-bold tracking-widest">
            MARVEL: Omniverse Auctions
          </span>
          <span className="font-mono">
            {heroes.length} heroes catalogued · Source: {source.toUpperCase()}
          </span>
        </div>
      </footer>
    </div>
  );
};
