import React from 'react';

interface SocialLink {
  name: string;
  href: string;
  ariaLabel: string;
  icon: (props: { className?: string }) => React.JSX.Element;
}

// Configurable social URLs - replace placeholders with your actual profile links
export const SOCIAL_LINKS = {
  linkedIn: 'https://www.linkedin.com/in/adhithyavasan-r?utm_source=share_via&utm_content=profile&utm_medium=member_android',
  instagram: 'https://www.instagram.com/hht__adhithya__18?stkn=emR0and4ZXB3cWY0',
  gitHub: 'https://github.com/adhithyavasan5-tech',
};

// Official brand SVG icons with crisp vector geometry
const LinkedInIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.99 0 1.79-.8 1.79-1.79s-.8-1.79-1.79-1.79-1.79.8-1.79 1.79.8 1.79 1.79 1.79m1.4 9.74v-8.37H5.06v8.37h2.8z" />
  </svg>
);

const InstagramIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const GitHubIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const socialLinks: SocialLink[] = [
  {
    name: 'LinkedIn',
    href: SOCIAL_LINKS.linkedIn,
    ariaLabel: 'Visit LinkedIn profile',
    icon: LinkedInIcon,
  },
  {
    name: 'Instagram',
    href: SOCIAL_LINKS.instagram,
    ariaLabel: 'Visit Instagram profile',
    icon: InstagramIcon,
  },
  {
    name: 'GitHub',
    href: SOCIAL_LINKS.gitHub,
    ariaLabel: 'Visit GitHub profile (adhithyavasan5-tech)',
    icon: GitHubIcon,
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#C6A15B]/20 bg-gradient-to-b from-[#08090D] via-[#0B0D13] to-[#050505] py-10 px-4 text-center text-xs text-[#9295A0] space-y-6 relative z-10">
      {/* Brand header */}
      <div className="space-y-1.5">
         <div className="font-cinzel text-sm sm:text-base text-white-gradient font-black tracking-[0.2em] uppercase ">
         <b>  ADHITHYAVASAN R </b>
        </div>
        <div className="font-cinzel text-sm sm:text-base text-gold-gradient font-black tracking-[0.2em] uppercase">
        MARVEL: Omniverse Auctions 
        </div>
       
        <p className="max-w-xl mx-auto text-xs text-[#C5BBAA] leading-relaxed font-sans">
          Cinematic Real-Time Superhero Collectible Auction. Powered by Akabab Superhero Public Dataset, Web Audio Procedural Synthesis & Server-Authoritative Socket Engine.
        </p>
      </div>

      {/* Social media icons strip */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 pt-1">
        {socialLinks.map(({ name, href, ariaLabel, icon: Icon }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
            title={name}
            className="group relative p-2.5 sm:p-3 rounded-xl bg-[#111319]/90 border border-[#C6A15B]/25 hover:border-[#F0D79A] text-[#9295A0] hover:text-[#F0D79A] transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-[0_0_20px_rgba(198,161,91,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090D]"
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-3" />
            
            {/* Elegant Tooltip */}
            <span
              role="tooltip"
              className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-200 text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-[#08090D] border border-[#C6A15B]/40 text-[#F0D79A] shadow-lg shadow-black/80 whitespace-nowrap z-20"
            >
              {name}
            </span>
          </a>
        ))}
      </div>

      {/* Legal & mission text */}
      <div className="border-t border-white/5 pt-5 max-w-2xl mx-auto space-y-1.5 font-sans">
        <p className="text-xs font-semibold text-[#E5E0D5] tracking-wide">
          &copy; 2026 MARVEL AUCTION. All rights reserved.
        </p>
        <p className="text-[11px] font-cinzel font-medium text-[#C6A15B] tracking-wider">
          Built for fans. Driven by strategy.
        </p>
        <p className="text-[10px] text-[#9295A0]/60 pt-1 leading-normal">
          Character artwork and attributes are properties of their respective creators and publishers. Created for competitive entertainment.
        </p>
      </div>
    </footer>
  );
};
