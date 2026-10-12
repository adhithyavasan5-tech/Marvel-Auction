import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext.js';
import { useUser } from '../context/UserContext.js';
import { Volume2, VolumeX, Shield, LogOut } from 'lucide-react';

interface NavbarProps {
  onOpenCreate?: () => void;
  onOpenJoin?: () => void;
  onOpenCatalogue?: () => void;
  onOpenProfile?: () => void;
  currentTab?: 'arena' | 'team' | 'leaderboard';
  setCurrentTab?: (tab: 'arena' | 'team' | 'leaderboard') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreate,
  onOpenJoin,
  onOpenCatalogue,
  onOpenProfile,
  currentTab,
  setCurrentTab
}) => {
  const { 
    roomState, 
    myPlayer, 
    isConnected, 
    isMuted, 
    toggleSound, 
    leaveRoom
  } = useAuction();
  
  const { user, logout } = useUser();

  return (
    <header className="sticky top-0 z-50 border-b border-[#C6A15B]/20 bg-[#08090D]/90 backdrop-blur-md px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden border border-[#C6A15B]/50 shadow-[0_0_12px_rgba(198,161,91,0.25)] bg-[#111319]">
            <img 
              src="/logo.jpeg" 
              alt="Omniverse Auctions Logo" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel font-bold text-sm sm:text-base tracking-widest text-gold-gradient">
                Omniverse Auctions
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded border border-[#C6A15B]/30 text-[#C6A15B] bg-[#C6A15B]/10">
                AUCTION ARENA
              </span>
            </div>
            <p className="text-[10px] text-[#9295A0] tracking-wider uppercase font-sans">
              Marvel Superhero Collectible Exchange
            </p>
          </div>
        </div>

        {/* Room Navigation Tabs (if inside an active or completed room) */}
        {roomState && setCurrentTab && (
          <nav className="hidden md:flex items-center gap-1 bg-[#111319] p-1 rounded-xl border border-[#C6A15B]/20">
            {roomState.status === 'AUCTION_ACTIVE' && (
              <button
                onClick={() => setCurrentTab('arena')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                  currentTab === 'arena'
                    ? 'bg-gradient-to-r from-[#E01414] to-[#8B1020] text-white shadow-lg shadow-[#E01414]/40'
                    : 'text-[#9295A0] hover:text-[#F5F0E7]'
                }`}
              >
                LIVE ARENA
              </button>
            )}
            <button
              onClick={() => setCurrentTab('team')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                currentTab === 'team'
                  ? 'bg-[#C6A15B] text-[#08090D] font-bold'
                  : 'text-[#9295A0] hover:text-[#F5F0E7]'
              }`}
            >
              MY TEAM ({myPlayer?.roster.length || 0}/{roomState.settings.requiredRosterSize})
            </button>
            <button
              onClick={() => setCurrentTab('leaderboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                currentTab === 'leaderboard'
                  ? 'bg-[#C6A15B] text-[#08090D] font-bold'
                  : 'text-[#9295A0] hover:text-[#F5F0E7]'
              }`}
            >
              LEADERBOARD
            </button>
          </nav>
        )}

        {/* Status Badges & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Connection Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111319] border border-[#C6A15B]/15 text-[11px] font-mono">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-[#9295A0]">{isConnected ? 'SERVER LIVE' : 'CONNECTING'}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="p-2 rounded-lg bg-[#111319] border border-[#C6A15B]/20 text-[#C6A15B] hover:border-[#C6A15B]/60 hover:text-[#F0D79A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]"
            title={isMuted ? 'Sound: Muted' : 'Sound: Enabled'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Heroes Catalogue button */}
          {onOpenCatalogue && (
            <button
              onClick={onOpenCatalogue}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111319] border border-[#C6A15B]/30 hover:border-[#C6A15B] text-xs text-[#F0D79A] transition-all font-cinzel font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">HEROES CATALOGUE</span>
              <span className="sm:hidden">HEROES</span>
            </button>
          )}

          {/* Player Room Identity or Leave Room */}
          {roomState && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#C6A15B]/20">
              <div className="hidden sm:flex flex-col text-right pr-2">
                <span className="text-[10px] font-mono text-[#F0D79A]">
                  {myPlayer?.budget.toLocaleString()} CREDITS
                </span>
              </div>
              <button
                onClick={leaveRoom}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#E01414]/10 border border-[#E01414]/30 text-[#E01414] hover:bg-[#E01414]/20 transition-colors text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E01414]"
                title="Leave Auction Chamber"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">LEAVE</span>
              </button>
            </div>
          )}

          {/* Logged In User Info (Clickable Profile) */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#C6A15B]/20 ml-1">
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-transparent hover:border-[#C6A15B]/50 hover:bg-[#C6A15B]/10 active:scale-[0.98] transition-all text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]"
                title="Click to view & edit your profile"
                aria-label="Open User Profile Editor"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-[#C6A15B]/60 object-cover bg-[#08090D] group-hover:border-[#F0D79A] group-hover:shadow-[0_0_10px_rgba(198,161,91,0.4)] transition-all"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=120&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#08090D]" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-[#F5F0E7] group-hover:text-[#F0D79A] transition-colors truncate max-w-[110px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-[#9295A0] group-hover:text-[#C6A15B] transition-colors font-mono">
                    @{user.userId}
                  </span>
                </div>
              </button>
              <button
                onClick={logout}
                className="p-1.5 sm:p-2 rounded-lg text-[#9295A0] hover:text-[#E01414] hover:bg-[#E01414]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E01414]"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

