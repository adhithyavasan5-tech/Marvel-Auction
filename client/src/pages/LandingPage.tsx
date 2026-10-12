import React, { useState, useEffect } from 'react';
import { Hero } from '../types/index.js';
import { HeroCard } from '../components/HeroCard.js';

import {
  Shield,
  Users,
  Timer,
  Award,
  ArrowRight,
  Crown,
  X,
} from 'lucide-react';

interface LandingPageProps {
  onOpenCreate: () => void;
  onOpenJoin: () => void;
  onOpenCatalogue: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenCreate,
  onOpenJoin,
  onOpenCatalogue

}) => {
  const [featuredHeroes, setFeaturedHeroes] = useState<Hero[]>([]);
  const [statusData, setStatusData] = useState<{ activeRooms: number; catalogueSource: string } | null>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  'https://marvel-auction-k4q4.onrender.com';
  useEffect(() => {
    // Fetch real status
   fetch(`${SERVER_URL}/api/status`)
      .then(r => r.json())
      .then(d => setStatusData(d))
      .catch(() => { });

    // Fetch featured heroes
   fetch(`${SERVER_URL}/api/heroes?mode=marvel&limit=6`)
      .then(r => r.json())
      .then(d => {
        if (d.heroes) setFeaturedHeroes(d.heroes.slice(0, 6));
      })
      .catch(() => { });
  }, []);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 overflow-x-hidden">

      {/* 1. CINEMATIC HERO SECTION WITH SPECIFIED BACKGROUND IMAGE */}
      <section
        className="relative min-h-[520px] sm:min-h-[580px] flex items-center justify-center pt-10 sm:pt-14 pb-12 sm:pb-16 px-4 overflow-hidden border-b border-[#C6A15B]/20"
        style={{
          backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkcxA2VbiTy-GXMgUrK86QBK_dzUNSnTPRRosqpDMb6MQfgQ4Fhi78ijf2&s=10')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Background Overlay - gentle vignette to ensure background is bright yet centered text is crystal clear */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090D]/50 via-black/30 to-[#08090D]/90" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.5)_0%,rgba(8,9,13,0.8)_100%)]" aria-hidden="true" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-5">

          {/* Main Title with dark frosted glow plate for crystal-clear letter visibility */}
          <div className="inline-block px-6 sm:px-10 py-4 sm:py-5 rounded-3xl bg-black/60 border border-[#C6A15B]/40 shadow-[0_0_50px_rgba(0,0,0,0.85)] backdrop-blur-md space-y-2">
            <h1 className="font-cinzel text-4xl sm:text-6xl lg:text-7xl font-black tracking-wider text-[#FFF1D0] drop-shadow-[0_4px_16px_rgba(0,0,0,1)] text-stroke">
              <span className="text-gold-gradient">Omniverse Auctions</span>
            </h1>
            <p className="font-cinzel text-base sm:text-2xl font-bold tracking-wide text-[#F5F0E7] drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
              &ldquo;Assemble Your Legends. Command the Auction.&rdquo;
            </p>
          </div>

          {/* Supporting Copy inside contrast pill */}
          <div className="max-w-2xl mx-auto px-6 py-3 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-sm shadow-xl">
            <p className="text-sm sm:text-base text-[#F5F0E7] font-medium leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-sans">
              Step inside a futuristic billionaire collector's private auction pavilion. Compete in real time against rival strategists, bid virtual credits on iconic superheroes, and engineer the highest combat-rated team in the multiverse.
            </p>
          </div>

          {/* Primary & Secondary Call to Actions */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenCreate}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#C6A15B] via-[#E5C378] to-[#C6A15B] text-[#08090D] font-cinzel font-black text-sm tracking-widest uppercase hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(198,161,91,0.5)] flex items-center justify-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0D79A]"
            >
              <Crown className="w-4 h-4 text-[#08090D]" />
              <span>CREATE</span>
            </button>

            <button
              onClick={onOpenJoin}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#111319]/95 border-2 border-[#C6A15B] hover:border-[#F0D79A] text-[#F0D79A] font-cinzel font-bold text-sm tracking-widest uppercase hover:bg-[#C6A15B]/20 active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]"
            >
              <Users className="w-4 h-4 text-[#F0D79A]" />
              <span>JOIN</span>
            </button>
          </div>

          {/* Quick Specs Strip */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-[#0E1017]/90 border border-[#C6A15B]/25 backdrop-blur-md shadow-lg shadow-black/40">
              <div className="text-[10px] font-mono uppercase text-[#9295A0]">Starting Purse</div>
              <div className="text-sm font-mono font-bold text-[#F0D79A] mt-0.5">1,000 Credits</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0E1017]/90 border border-[#C6A15B]/25 backdrop-blur-md shadow-lg shadow-black/40">
              <div className="text-[10px] font-mono uppercase text-[#9295A0]">Roster Quota</div>
              <div className="text-sm font-mono font-bold text-[#F5F0E7] mt-0.5">5 Hero Contracts</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0E1017]/90 border border-[#C6A15B]/25 backdrop-blur-md shadow-lg shadow-black/40">
              <div className="text-[10px] font-mono uppercase text-[#9295A0]">Bidding Clock</div>
              <div className="text-sm font-mono font-bold text-[#F5F0E7] mt-0.5">20s + Anti-Snipe</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0E1017]/90 border border-[#C6A15B]/25 backdrop-blur-md shadow-lg shadow-black/40">
              <div className="text-[10px] font-mono uppercase text-[#9295A0]">Engine</div>
              <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">Authoritative Real-Time</div>
            </div>
          </div>


        </div>
      </section>

      {/* 2. STREAMING-STYLE MARVEL HERO BANNER */}
      <section
        id="marvel-streaming-banner"
        className="streaming-hero relative mx-auto w-full max-w-7xl overflow-hidden px-4 sm:px-6"
      >
        {/* Left content */}
        <div className="streaming-content">
          <span className="streaming-eyebrow">
            MARVEL CHARACTER UNIVERSE
          </span>

          <h2>A Universe of Super Heroes</h2>

          <p>
            Iconic heroes. Legendary battles. Build your ultimate team
            and rule the auction.
          </p>

          <button
            type="button"
            className="streaming-button"
            onClick={onOpenCatalogue}
          >
            EXPLORE HEROES
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Curved image panels */}
        <div className="streaming-panel streaming-panel-one">
          <img
            src="https://i.pinimg.com/1200x/46/49/9f/46499fd00af99589194b497fbf83ce1c.jpg"
            alt="Marvel hero artwork"
            loading="lazy"
          />
        </div>

        <div className="streaming-panel streaming-panel-two">
          <img
            src="https://i.pinimg.com/736x/a8/5d/bb/a85dbbb04aedbe08f263807904878c84.jpg"
            alt="Superhero artwork"
            loading="lazy"
          />
        </div>

        <div className="streaming-panel streaming-panel-three">
          <img
            src="https://i.pinimg.com/1200x/ac/bb/11/acbb1115d46ddc475fa3b24adf04d3e5.jpg"
            alt="Hero universe artwork"
            loading="lazy"
          />
        </div>

        <div className="streaming-bottom-label">
          Omniverse Auctions · ASSEMBLE YOUR LEGENDS
        </div>
      </section>


      {/* 3. RULES & COMPOSITION SYNERGY SECTION */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#171A23] via-[#111319] to-[#171A23] border border-[#C6A15B]/30 space-y-6">
          <div className="max-w-2xl">
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#F5F0E7]">
              AUCTION INTEGRITY & FAIR-PLAY LAWS
            </h3>
            <p className="text-xs text-[#9295A0] mt-1 leading-relaxed">
              Every bid, timer tick, credit debit, and lot settlement is enforced authoritatively on the server. Clients cannot alter game outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">

            {/* Rule 1 */}
            <div className="p-4 rounded-2xl bg-[#08090D] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-[#C6A15B] font-bold">
                <Timer className="w-4 h-4" />
                <span>Anti-Sniping Guarantee</span>
              </div>
              <p className="text-[#9295A0] leading-relaxed">
                If a valid bid is placed in the final 5 seconds of any lot, the server extends the timer by 5 full seconds so bidders have an equal opportunity to respond.
              </p>
            </div>

            {/* Rule 2 */}
            <div className="p-4 rounded-2xl bg-[#08090D] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-[#C6A15B] font-bold">
                <Shield className="w-4 h-4" />
                <span>Exclusive Ownership</span>
              </div>
              <p className="text-[#9295A0] leading-relaxed">
                Each hero lot exists uniquely per room. Once struck SOLD, that specific hero is owned only by the winning bidder. Unsold heroes return to the vault.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="p-4 rounded-2xl bg-[#08090D] border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-[#C6A15B] font-bold">
                <Award className="w-4 h-4" />
                <span>Composition Synergy Bonus</span>
              </div>
              <p className="text-[#9295A0] leading-relaxed">
                Base team power equals the sum of hero power scores. Assembling diverse roles yields capped strategic bonuses: +30 (3 roles), +60 (4 roles), +100 (5 roles).
              </p>
            </div>

          </div>
        </div>
      </section>
   
    
{selectedImage && (
  <div
    className="image-lightbox"
    role="dialog"
    aria-modal="true"
    aria-label="Enlarged superhero image"
    onClick={() => setSelectedImage(null)}
  >
    <button
      type="button"
      className="lightbox-close"
      aria-label="Close enlarged image"
      onClick={() => setSelectedImage(null)}
    >
      <X size={28} />
    </button>

    <img
      src={selectedImage}
      alt="Enlarged superhero artwork"
      onClick={(event) => event.stopPropagation()}
    />
  </div>
)}

    </div>
  );
};